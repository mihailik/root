/// <reference path="MetadataStreams.ts" />
/// <reference path="DefinitionReaders.ts" />
/// <reference path="../tableRows/FieldDef.ts" />
/// <reference path="../tableRows/MethodDef.ts" />
/// <reference path="../tableRows/TypeDef.ts" />

module pe.managed.metadata {
    export class TableStream {
        reserved0: number = 0;
        version: string = "";
        
        // byte
        heapSizes: number = 0;

        reserved1: number = 0;

        tables: any[][];

        read(tableReader: io.BinaryReader, streams: MetadataStreams) {
            ensureTableTypesPopulated();

            this.reserved0 = tableReader.readInt();

            // Note those are bytes, not shorts!
            this.version = tableReader.readByte() + "." + tableReader.readByte();

            this.heapSizes = tableReader.readByte();
            this.reserved1 = tableReader.readByte();

            var valid = tableReader.readLong();
            var sorted = tableReader.readLong();

            this.initTables(tableReader, valid);
            this.readTables(tableReader, streams);
        }
            
        private initTables(reader: io.BinaryReader, valid: Long) {
            this.tables = Array(TableTypes.length);

            var bits = valid.lo;
            for (var tableIndex = 0; tableIndex < 32; tableIndex++) {
                if (bits & 1) {
                    var rowCount = reader.readInt();
                    this.initTable(tableIndex, rowCount);
                }
                bits = bits >> 1;
            }

            bits = valid.hi;
            for (var i = 0; i < 32; i++) {
                var tableIndex = i + 32;
                if (bits & 1) {
                    var rowCount = reader.readInt();
                    this.initTable(tableIndex, rowCount);
                }
                bits = bits >> 1;
            }
        }

        private initTable(tableIndex: number, rowCount: number) {
            var tableRows = this.tables[tableIndex] = Array(rowCount);

            if (TableTypes[tableIndex].ctor) {
                for (var i = 0; i < rowCount; i++) {
                    if (!tableRows[i]) {
                        var ctor = TableTypes[tableIndex].ctor;
                        tableRows[i] = new ctor();
                    }
                }
            }
        }

       private readTables(reader: io.BinaryReader, streams: MetadataStreams) {
            var tableStreamReader = new TableStreamReader(
                reader,
                streams,
                this.tables);

            for (var tableIndex = 0; tableIndex < TableTypes.length; tableIndex++) {
                var tableRows = this.tables[tableIndex];

                if (!tableRows)
                    continue;

                var ttype = TableTypes[tableIndex];

                if (!ttype.read)
                    continue;

                for (var i = 0; i < tableRows.length; i++) {
                    if (!tableRows[i])
                        continue; // until all the reading is implemented

                    ttype.read(tableRows[i], tableStreamReader);
                }
            }
        }
    }

    export class TableStreamReader {
        private stringHeapCache: string[] = [];
        
        constructor(
            private baseReader: io.BinaryReader,
            private streams: metadata.MetadataStreams,
            private tables: any[][]) {

            this.readResolutionScope = this.createCodedIndexReader(
                TableTypes.Module,
                TableTypes.ModuleRef,
                TableTypes.AssemblyRef,
                TableTypes.TypeRef);

            this.readTypeDefOrRef = this.createCodedIndexReader(
                TableTypes.TypeDef,
                TableTypes.TypeRef,
                TableTypes.TypeSpec);
        }

        readInt(): number { return this.baseReader.readInt(); }
        readShort(): number { return this.baseReader.readShort(); }
        
        readString(): string {
            var pos = this.readPos(this.streams.strings.size);

            var result: string;
            if(pos == 0 ) {
                result = null;
            }
            else {
                result = this.stringHeapCache[pos];

                if (!result) {
                    if (pos > this.streams.strings.size)
                        throw new Error("String heap position overflow.");

                    var utf8Reader = this.baseReader.readAtOffset(this.streams.strings.address + pos);
                    result = utf8Reader.readUtf8z(1024*1024*1024); // strings longer than 1GB? Not supported for a security excuse.

                    this.stringHeapCache[pos] = result;
                }
            }

            return result;
        }

        readGuid(): string {
            var index = this.readPos(this.streams.guids.length);

            if (index == 0)
                return null;
            else
                return this.streams.guids[(index-1)/16];
        }
        
        readBlob(): any {
            var index = this.readPos(this.streams.blobs.size);
            return index;
        }

        readResolutionScope: () => any;
        readTypeDefOrRef: () => any;
        
        readTableRowIndex(tableIndex: number): number {
            var tableRows = this.tables[tableIndex];

            if (!tableRows)
                return 0;

            return this.readPos(tableRows.length);
        }

        private createCodedIndexReader(...tableTypes: TableType[]): () => any {
            var maxTableLength = 0;
            for (var i = 0; i < tableTypes.length; i++)
            {
                var tableType = tableTypes[i];
                if (!tableType)
                    continue;

                var tableRows = this.tables[i];

                if (!tableRows)
                    continue;
                
                maxTableLength = Math.max(maxTableLength, tableRows.length);
            }

            function calcRequredBitCount(maxValue) {
                var bitMask = maxValue;
                var result = 0;

                while (bitMask != 0)
                {
                    result++;
                    bitMask >>= 1;
                }

                return result;
            }

            var tableKindBitCount = calcRequredBitCount(tableTypes.length - 1);
            var tableIndexBitCount = calcRequredBitCount(maxTableLength);

            var readShortInt = tableKindBitCount + tableIndexBitCount < 16;

            return () => {
                var result = readShortInt ? this.baseReader.readShort() : this.baseReader.readInt();

                var resultIndex = result >> tableKindBitCount;
                var resultTableIndex = result - (resultIndex << tableKindBitCount);

                var table = this.tables[tableTypes[resultTableIndex].index];

                if (resultIndex==0)
                    return null;

                resultIndex--;

                var row = table[resultIndex];
                return row;
            };
        }

        private readPos(spaceSize: number): number {
            if(spaceSize<65535)
                return this.baseReader.readShort();
            else
                return this.baseReader.readInt();
        }
    }

    export class TableType {
        constructor(
            public name: string,
            public index: number,
            public comments: string,
            public ctor: any,
            read?: (row: any, reader: TableStreamReader) => void ) {

            if (read)
                this.read = read;
        }

        read(row: any, reader: TableStreamReader) {
            row.read(reader);
        }
    }

    export interface TableTypes {
        [tableKind: number]: TableType;
        length: number;

        Module: TableType; // 0x00
        TypeRef: TableType; // 0x01
        TypeDef: TableType; // 0x02
        Field: TableType; // 0x04
        MethodDef: TableType; // 0x06
        Param: TableType; // 0x08
        InterfaceImpl: TableType; // 0x09
        MemberRef: TableType; // 0x0A
        Constant: TableType; // 0x0B
        CustomAttribute: TableType; // 0x0C
        FieldMarshal: TableType; // 0x0D
        DeclSecurity: TableType; // 0x0E
        ClassLayout: TableType; // 0x0F
        FieldLayout: TableType; // 0x10
        StandAloneSig: TableType; // 0x11
        EventMap: TableType; // 0x12
        Event: TableType; // 0x14
        PropertyMap: TableType; // 0x15
        Property: TableType; // 0x17
        MethodSemantics: TableType; // 0x18
        MethodImpl: TableType; // 0x19
        ModuleRef: TableType; // 0x1A
        TypeSpec: TableType; // 0x1B
        ImplMap: TableType; // 0x1C
        FieldRVA: TableType; // 0x1D
        Assembly: TableType; // 0x20
        AssemblyProcessor: TableType; // 0x21
        AssemblyOS: TableType; // 0x22
        AssemblyRef: TableType; // 0x23
        AssemblyRefProcessor: TableType; // 0x24
        AssemblyRefOS: TableType; // 0x25
        File: TableType; // 0x26
        ExportedType: TableType; // 0x27
        ManifestResource: TableType; // 0x28
        NestedClass: TableType; // 0x29
        GenericParam: TableType; // 0x2A
        MethodSpec: TableType; // 0x2B
        GenericParamConstraint: TableType; // 0x2C
    }

    export var TableTypes: TableTypes;

    function ensureTableTypesPopulated(): any {
         if (TableTypes)
             return;

        var tabs = [
            new TableType(
                "Module",
                0x00,
                "The rows in the Module table result from .module directives in the Assembly.",
                ModuleDefinition,
                readModuleDefinition),

            new TableType(
                "TypeRef",
                0x01,
                "Contains ResolutionScope, TypeName and TypeNamespace columns.",
                TypeReference,
                readTypeReference),

            new TableType(
                "TypeDef",
                0x02,
                "The first row of the TypeDef table represents the pseudo class that acts as parent for functions and variables" +
                "defined at module scope." +
                "If a type is generic, its parameters are defined in the GenericParam table (§22.20). Entries in the" +
                "GenericParam table reference entries in the TypeDef table; there is no reference from the TypeDef table to the" +
                "GenericParam table.",
                TypeDef),

            new TableType(
                "Field",
                0x04,
                "Each row in the Field table results from a top-level .field directive, or a .field directive inside a" +
                "Type.",
                FieldDef),

            new TableType(
                "MethodDef",
                0x06,
                "Conceptually, every row in the MethodDef table is owned by one, and only one, row in the TypeDef table." +
                "The rows in the MethodDef table result from .method directives (§15). The RVA column is computed when" +
                "the image for the PE file is emitted and points to the COR_ILMETHOD structure for the body of the method.",
                MethodDef),

            new TableType(
                "Param",
                0x08,
                "Conceptually, every row in the Param table is owned by one, and only one, row in the MethodDef table." +
                "The rows in the Param table result from the parameters in a method declaration (§15.4), or from a .param" +
                "attribute attached to a method.",
                null),

            new TableType(
                "InterfaceImpl",
                0x09,
                "Records the interfaces a type implements explicitly.  Conceptually, each row in the" +
                "InterfaceImpl table indicates that Class implements Interface.",
                null),

            new TableType(
                "MemberRef",
                0x0A,
                "Combines two sorts of references, to Methods and to Fields of a class, known as 'MethodRef' and 'FieldRef', respectively." +
                "An entry is made into the MemberRef table whenever a reference is made in the CIL code to a method or field" +
                "which is defined in another module or assembly.  (Also, an entry is made for a call to a method with a VARARG" +
                "signature, even when it is defined in the same module as the call site.)",
                null),

            new TableType(
                "Constant",
                0x0B,
                "Used to store compile-time, constant values for fields, parameters, and properties.",
                null),

            new TableType(
                "CustomAttribute",
                0x0C,
                "Stores data that can be used to instantiate a Custom Attribute (more precisely, an" +
                "object of the specified Custom Attribute class) at runtime." +
                "A row in the CustomAttribute table for a parent is created by the .custom attribute, which gives the value of" +
                "the Type column and optionally that of the Value column.",
                null),

            new TableType(
                "FieldMarshal",
                0x0D,
                "The FieldMarshal table  'links' an existing row in the Field or Param table, to information" +
                "in the Blob heap that defines how that field or parameter (which, as usual, covers the method return, as" +
                "parameter number 0) shall be marshalled when calling to or from unmanaged code via PInvoke dispatch." +
                "A row in the FieldMarshal table is created if the .field directive for the parent field has specified a marshal attribute.",
                null),

            new TableType(
                "DeclSecurity",
                0x0E,
                "The rows of the DeclSecurity table are filled by attaching a .permission or .permissionset directive" +
                "that specifies the Action and PermissionSet on a parent assembly or parent type or method.",
                null),

            new TableType(
                "ClassLayout",
                0x0F,
                "Used to define how the fields of a class or value type shall be laid out by the CLI." +
                "(Normally, the CLI is free to reorder and/or insert gaps between the fields defined for a class or value type.)",
                null),

            new TableType(
                "FieldLayout",
                0x10,
                "A row in the FieldLayout table is created if the .field directive for the parent field has specified a field offset.",
                null),

            new TableType(
                "StandAloneSig",
                0x11,
                "Signatures are stored in the metadata Blob heap.  In most cases, they are indexed by a column in some table —" +
                "Field.Signature, Method.Signature, MemberRef.Signature, etc.  However, there are two cases that require a" +
                "metadata token for a signature that is not indexed by any metadata table.  The StandAloneSig table fulfils this" +
                "need.  It has just one column, which points to a Signature in the Blob heap.",
                null),

            new TableType(
                "EventMap",
                0x12,
                "The EventMap and Event tables result from putting the .event directive on a class.",
                null),

            new TableType(
                "Event",
                0x14,
                "The EventMap and Event tables result from putting the .event directive on a class.",
                null),

            new TableType(
                "PropertyMap",
                0x15,
                "The PropertyMap and Property tables result from putting the .property directive on a class.",
                null),

            new TableType(
                "Property",
                0x17,
                "Does a little more than group together existing rows from other tables.",
                null),

            new TableType(
                "MethodSemantics",
                0x18,
                "The rows of the MethodSemantics table are filled by .property and .event directives.",
                null),

            new TableType(
                "MethodImpl",
                0x19,
                "s let a compiler override the default inheritance rules provided by the CLI. Their original use" +
                "was to allow a class C, that inherited method M from both interfaces I and J, to provide implementations for" +
                "both methods (rather than have only one slot for M in its vtable). However, MethodImpls can be used for other" +
                "reasons too, limited only by the compiler writer‘s ingenuity within the constraints defined in the Validation rules." +
                "ILAsm uses the .override directive to specify the rows of the MethodImpl table.",
                null),

            new TableType(
                "ModuleRef",
                0x1A,
                "The rows in the ModuleRef table result from .module extern directives in the Assembly.",
                null),

            new TableType(
                "TypeSpec",
                0x1B,
                "Contains just one column, which indexes the specification of a Type, stored in the Blob heap." +
                "This provides a metadata token for that Type (rather than simply an index into the Blob heap)." +
                "This is required, typically, for array operations, such as creating, or calling methods on the array class." +
                "Note that TypeSpec tokens can be used with any of the CIL instructions that take a TypeDef or TypeRef token;" +
                "specifically, castclass, cpobj, initobj, isinst, ldelema, ldobj, mkrefany, newarr, refanyval, sizeof, stobj, box, and unbox.",
                null),

            new TableType(
                "ImplMap",
                0x1C,
                "Holds information about unmanaged methods that can be reached from managed code, using PInvoke dispatch." +
                "A row is entered in the ImplMap table for each parent Method (§15.5) that is defined with a .pinvokeimpl" +
                "interoperation attribute specifying the MappingFlags, ImportName, and ImportScope.",
                null),

            new TableType(
                "FieldRVA",
                0x1D,
                "Conceptually, each row in the FieldRVA table is an extension to exactly one row in the Field table, and records" +
                "the RVA (Relative Virtual Address) within the image file at which this field‘s initial value is stored." +
                "A row in the FieldRVA table is created for each static parent field that has specified the optional data" +
                "label.  The RVA column is the relative virtual address of the data in the PE file.",
                null),

            new TableType(
                "Assembly",
                0x20,
                "ECMA-335 §22.2.",
                null),

            new TableType(
                "AssemblyProcessor",
                0x21,
                "ECMA-335 §22.4 Shall be ignored by the CLI.",
                null),

            new TableType(
                "AssemblyOS",
                0x22,
                "ECMA-335 §22.3 Shall be ignored by the CLI.",
                null),

            new TableType(
                "AssemblyRef",
                0x23,
                "The table is defined by the .assembly extern directive (§6.3).  Its columns are filled using directives" +
                "similar to those of the Assembly table except for the PublicKeyOrToken column, which is defined using the" +
                ".publickeytoken directive.",
                null),

            new TableType(
                "AssemblyRefProcessor",
                0x24,
                "ECMA-335 §22.7 Shall be ignored by the CLI.",
                null),

            new TableType(
                "AssemblyRefOS",
                0x25,
                "ECMA-335 §22.6 Shall be ignored by the CLI.",
                null),

            new TableType(
                "File",
                0x26,
                "The rows of the File table result from .file directives in an Assembly.",
                null),

            new TableType(
                "ExportedType",
                0x27,
                "Holds a row for each type:" +
                "a. Defined within other modules of this Assembly; that is exported out of this Assembly." +
                "In essence, it stores TypeDef row numbers of all types that are marked public in other modules" +
                "that this Assembly comprises." +
                "The actual target row in a TypeDef table is given by the combination of TypeDefId (in effect, row number)" +
                "and Implementation (in effect, the module that holds the target TypeDef table)." +
                "Note that this is the only occurrence in metadata of foreign tokens;" +
                "that is, token values that have a meaning in another module." +
                "(A regular token value is an index into a table in the current module)," +
                "OR" +
                "b. Originally defined in this Assembly but now moved to another Assembly." +
                "Flags must have IsTypeForwarder set and Implementation is an AssemblyRef indicating" +
                "the Assembly the type may now be found in.",
                null),

            new TableType(
                "ManifestResource",
                0x28,
                "The rows in the table result from .mresource directives on the Assembly.",
                null),

            new TableType(
                "NestedClass",
                0x29,
                "NestedClass is defined as lexically 'inside' the text of its enclosing Type.",
                null),

            new TableType(
                "GenericParam",
                0x2A,
                "Stores the generic parameters used in generic type definitions and generic method" +
                "definitions.  These generic parameters can be constrained (i.e., generic arguments shall extend some class" +
                "and/or implement certain interfaces) or unconstrained.  (Such constraints are stored in the" +
                "GenericParamConstraint table.)" +
                "Conceptually, each row in the GenericParam table is owned by one, and only one, row in either the TypeDef or" +
                "MethodDef tables.",
                null),

            new TableType(
                "MethodSpec",
                0x2B,
                "Records the signature of an instantiated generic method." +
                "Each unique instantiation of a generic method (i.e., a combination of Method and Instantiation) shall be" +
                "represented by a single row in the table.",
                null),

            new TableType(
                "GenericParamConstraint",
                0x2C,
                "Records the constraints for each generic parameter.  Each generic parameter" +
                "can be constrained to derive from zero or one class.  Each generic parameter can be constrained to implement" +
                "zero or more interfaces." +
                "Conceptually, each row in the GenericParamConstraint table is ‗owned‘ by a row in the GenericParam table.",
                null)
        ];

        var created = [];

        for (var i = 0; i < tabs.length; i++) {
            created[tabs[i].index] = tabs[i];
            created[tabs[i].name] = tabs[i];
        }

        TableTypes = <any>created;
    };
}