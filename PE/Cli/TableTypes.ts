/// <reference path="TableDetails/TableTypeDefinitions.ts" />
/// <reference path="TableDetails/TableRowReaders.ts" />
/// <reference path="../ModuleDefinition.ts" />
/// <reference path="../TypeReference.ts" />

module Mi.PE.Cli {
    export var TableTypes: Mi.PE.Cli.TableDetails.TableTypes;

    TableTypes = <any>[];

    TableTypes.Module = new Mi.PE.Cli.TableDetails.TableType(
        "Module",
        0x00,
        "The rows in the Module table result from .module directives in the Assembly.",
        ModuleDefinition,
        Mi.PE.Cli.TableDetails.readModuleDefinition);

    TableTypes.TypeRef = new Mi.PE.Cli.TableDetails.TableType(
        "TypeRef",
        0x01,
        "Contains ResolutionScope, TypeName and TypeNamespace columns.",
        TypeReference,
        null);

    TableTypes.TypeDef = new Mi.PE.Cli.TableDetails.TableType(
        "TypeDef",
        0x02,
        "The first row of the TypeDef table represents the pseudo class that acts as parent for functions and variables" +
        "defined at module scope." +
        "If a type is generic, its parameters are defined in the GenericParam table (§22.20). Entries in the" +
        "GenericParam table reference entries in the TypeDef table; there is no reference from the TypeDef table to the" +
        "GenericParam table.",
        null, null);

    TableTypes.Field = new Mi.PE.Cli.TableDetails.TableType(
        "Field",
        0x04,
        "Each row in the Field table results from a top-level .field directive, or a .field directive inside a" +
        "Type.",
        null, null);

    TableTypes.MethodDef = new Mi.PE.Cli.TableDetails.TableType(
        "MethodDef",
        0x06,
        "Conceptually, every row in the MethodDef table is owned by one, and only one, row in the TypeDef table." +
        "The rows in the MethodDef table result from .method directives (§15). The RVA column is computed when" +
        "the image for the PE file is emitted and points to the COR_ILMETHOD structure for the body of the method.",
        null, null);

    TableTypes.Param = new Mi.PE.Cli.TableDetails.TableType(
        "Param",
        0x08,
        "Conceptually, every row in the Param table is owned by one, and only one, row in the MethodDef table." +
        "The rows in the Param table result from the parameters in a method declaration (§15.4), or from a .param" +
        "attribute attached to a method.",
        null, null);

    TableTypes.InterfaceImpl = new Mi.PE.Cli.TableDetails.TableType(
        "InterfaceImpl",
        0x09,
        "Records the interfaces a type implements explicitly.  Conceptually, each row in the" +
        "InterfaceImpl table indicates that Class implements Interface.",
        null, null);

    TableTypes.MemberRef = new Mi.PE.Cli.TableDetails.TableType(
        "MemberRef",
        0x0A,
        "Combines two sorts of references, to Methods and to Fields of a class, known as 'MethodRef' and 'FieldRef', respectively." +
        "An entry is made into the MemberRef table whenever a reference is made in the CIL code to a method or field" +
        "which is defined in another module or assembly.  (Also, an entry is made for a call to a method with a VARARG" +
        "signature, even when it is defined in the same module as the call site.)",
        null, null);

    TableTypes.Constant = new Mi.PE.Cli.TableDetails.TableType(
        "Constant",
        0x0B,
        "Used to store compile-time, constant values for fields, parameters, and properties.",
        null, null);

    TableTypes.CustomAttribute = new Mi.PE.Cli.TableDetails.TableType(
        "CustomAttribute",
        0x0C,
        "Stores data that can be used to instantiate a Custom Attribute (more precisely, an" +
        "object of the specified Custom Attribute class) at runtime." +
        "A row in the CustomAttribute table for a parent is created by the .custom attribute, which gives the value of" +
        "the Type column and optionally that of the Value column.",
        null, null);

    TableTypes.FieldMarshal = new Mi.PE.Cli.TableDetails.TableType(
        "FieldMarshal",
        0x0D,
        "The FieldMarshal table  'links' an existing row in the Field or Param table, to information" +
        "in the Blob heap that defines how that field or parameter (which, as usual, covers the method return, as" +
        "parameter number 0) shall be marshalled when calling to or from unmanaged code via PInvoke dispatch." +
        "A row in the FieldMarshal table is created if the .field directive for the parent field has specified a marshal attribute.",
        null, null);

    TableTypes.DeclSecurity = new Mi.PE.Cli.TableDetails.TableType(
        "DeclSecurity",
        0x0E,
        "The rows of the DeclSecurity table are filled by attaching a .permission or .permissionset directive" +
        "that specifies the Action and PermissionSet on a parent assembly or parent type or method.",
        null, null);

    TableTypes.ClassLayout = new Mi.PE.Cli.TableDetails.TableType(
        "ClassLayout",
        0x0F,
        "Used to define how the fields of a class or value type shall be laid out by the CLI." +
        "(Normally, the CLI is free to reorder and/or insert gaps between the fields defined for a class or value type.)",
        null, null);

    TableTypes.FieldLayout = new Mi.PE.Cli.TableDetails.TableType(
        "FieldLayout",
        0x10,
        "A row in the FieldLayout table is created if the .field directive for the parent field has specified a field offset.",
        null, null);

    TableTypes.StandAloneSig = new Mi.PE.Cli.TableDetails.TableType(
        "StandAloneSig",
        0x11,
        "Signatures are stored in the metadata Blob heap.  In most cases, they are indexed by a column in some table —" +
        "Field.Signature, Method.Signature, MemberRef.Signature, etc.  However, there are two cases that require a" +
        "metadata token for a signature that is not indexed by any metadata table.  The StandAloneSig table fulfils this" +
        "need.  It has just one column, which points to a Signature in the Blob heap.",
        null, null);

    TableTypes.EventMap = new Mi.PE.Cli.TableDetails.TableType(
        "EventMap",
        0x12,
        "The EventMap and Event tables result from putting the .event directive on a class.",
        null, null);

    TableTypes.Event = new Mi.PE.Cli.TableDetails.TableType(
        "Event",
        0x14,
        "The EventMap and Event tables result from putting the .event directive on a class.",
        null, null);

    TableTypes.PropertyMap = new Mi.PE.Cli.TableDetails.TableType(
        "PropertyMap",
        0x15,
        "The PropertyMap and Property tables result from putting the .property directive on a class.",
        null, null);

    TableTypes.Property = new Mi.PE.Cli.TableDetails.TableType(
        "Property",
        0x17,
        "Does a little more than group together existing rows from other tables.",
        null, null);

    TableTypes.MethodSemantics = new Mi.PE.Cli.TableDetails.TableType(
        "MethodSemantics",
        0x18,
        "The rows of the MethodSemantics table are filled by .property and .event directives.",
        null, null);

    TableTypes.MethodImpl = new Mi.PE.Cli.TableDetails.TableType(
        "MethodImpl",
        0x19,
        "s let a compiler override the default inheritance rules provided by the CLI. Their original use" +
        "was to allow a class C, that inherited method M from both interfaces I and J, to provide implementations for" +
        "both methods (rather than have only one slot for M in its vtable). However, MethodImpls can be used for other" +
        "reasons too, limited only by the compiler writer‘s ingenuity within the constraints defined in the Validation rules." +
        "ILAsm uses the .override directive to specify the rows of the MethodImpl table.",
        null, null);

    TableTypes.ModuleRef = new Mi.PE.Cli.TableDetails.TableType(
        "ModuleRef",
        0x1A,
        "The rows in the ModuleRef table result from .module extern directives in the Assembly.",
        null, null);

    TableTypes.TypeSpec = new Mi.PE.Cli.TableDetails.TableType(
        "TypeSpec",
        0x1B,
        "Contains just one column, which indexes the specification of a Type, stored in the Blob heap." +
        "This provides a metadata token for that Type (rather than simply an index into the Blob heap)." +
        "This is required, typically, for array operations, such as creating, or calling methods on the array class." +
        "Note that TypeSpec tokens can be used with any of the CIL instructions that take a TypeDef or TypeRef token;" +
        "specifically, castclass, cpobj, initobj, isinst, ldelema, ldobj, mkrefany, newarr, refanyval, sizeof, stobj, box, and unbox.",
        null, null);

    TableTypes.ImplMap = new Mi.PE.Cli.TableDetails.TableType(
        "ImplMap",
        0x1C,
        "Holds information about unmanaged methods that can be reached from managed code, using PInvoke dispatch." +
        "A row is entered in the ImplMap table for each parent Method (§15.5) that is defined with a .pinvokeimpl" +
        "interoperation attribute specifying the MappingFlags, ImportName, and ImportScope.",
        null, null);

    TableTypes.FieldRVA = new Mi.PE.Cli.TableDetails.TableType(
        "FieldRVA",
        0x1D,
        "Conceptually, each row in the FieldRVA table is an extension to exactly one row in the Field table, and records" +
        "the RVA (Relative Virtual Address) within the image file at which this field‘s initial value is stored." +
        "A row in the FieldRVA table is created for each static parent field that has specified the optional data" +
        "label.  The RVA column is the relative virtual address of the data in the PE file.",
        null, null);

    TableTypes.Assembly = new Mi.PE.Cli.TableDetails.TableType(
        "Assembly",
        0x20,
        "ECMA-335 §22.2.",
        null, null);

    TableTypes.AssemblyProcessor = new Mi.PE.Cli.TableDetails.TableType(
        "AssemblyProcessor",
        0x21,
        "ECMA-335 §22.4 Shall be ignored by the CLI.",
        null, null);

    TableTypes.AssemblyOS = new Mi.PE.Cli.TableDetails.TableType(
        "AssemblyOS",
        0x22,
        "ECMA-335 §22.3 Shall be ignored by the CLI.",
        null, null);

    TableTypes.AssemblyRef = new Mi.PE.Cli.TableDetails.TableType(
        "AssemblyRef",
        0x23,
        "The table is defined by the .assembly extern directive (§6.3).  Its columns are filled using directives" +
        "similar to those of the Assembly table except for the PublicKeyOrToken column, which is defined using the" +
        ".publickeytoken directive.",
        null, null);

    TableTypes.AssemblyRefProcessor = new Mi.PE.Cli.TableDetails.TableType(
        "AssemblyRefProcessor",
        0x24,
        "ECMA-335 §22.7 Shall be ignored by the CLI.",
        null, null);

    TableTypes.AssemblyRefOS = new Mi.PE.Cli.TableDetails.TableType(
        "AssemblyRefOS",
        0x25,
        "ECMA-335 §22.6 Shall be ignored by the CLI.",
        null, null);

    TableTypes.File = new Mi.PE.Cli.TableDetails.TableType(
        "File",
        0x26,
        "The rows of the File table result from .file directives in an Assembly.",
        null, null);

    TableTypes.ExportedType = new Mi.PE.Cli.TableDetails.TableType(
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
        "(A regular token value is an index into a table in the current module);" +
        "OR" +
        "b. Originally defined in this Assembly but now moved to another Assembly." +
        "Flags must have IsTypeForwarder set and Implementation is an AssemblyRef indicating" +
        "the Assembly the type may now be found in.",
        null, null);

    TableTypes.ManifestResource = new Mi.PE.Cli.TableDetails.TableType(
        "ManifestResource",
        0x28,
        "The rows in the table result from .mresource directives on the Assembly.",
        null, null);

    TableTypes.NestedClass = new Mi.PE.Cli.TableDetails.TableType(
        "NestedClass",
        0x29,
        "NestedClass is defined as lexically 'inside' the text of its enclosing Type.",
        null, null);

    TableTypes.GenericParam = new Mi.PE.Cli.TableDetails.TableType(
        "GenericParam",
        0x2A,
        "Stores the generic parameters used in generic type definitions and generic method" +
        "definitions.  These generic parameters can be constrained (i.e., generic arguments shall extend some class" +
        "and/or implement certain interfaces) or unconstrained.  (Such constraints are stored in the" +
        "GenericParamConstraint table.)" +
        "Conceptually, each row in the GenericParam table is owned by one, and only one, row in either the TypeDef or" +
        "MethodDef tables.",
        null, null);

    TableTypes.MethodSpec = new Mi.PE.Cli.TableDetails.TableType(
        "MethodSpec",
        0x2B,
        "Records the signature of an instantiated generic method." +
        "Each unique instantiation of a generic method (i.e., a combination of Method and Instantiation) shall be" +
        "represented by a single row in the table.",
        null, null);

    TableTypes.GenericParamConstraint = new Mi.PE.Cli.TableDetails.TableType(
        "GenericParamConstraint",
        0x2C,
        "Records the constraints for each generic parameter.  Each generic parameter" +
        "can be constrained to derive from zero or one class.  Each generic parameter can be constrained to implement" +
        "zero or more interfaces." +
        "Conceptually, each row in the GenericParamConstraint table is ‗owned‘ by a row in the GenericParam table.",
        null, null);

    (<any[]><any>TableTypes)[0x00] = TableTypes.Module;
    (<any[]><any>TableTypes)[0x01] = TableTypes.TypeRef;
    (<any[]><any>TableTypes)[0x02] = TableTypes.TypeDef;
    (<any[]><any>TableTypes)[0x04] = TableTypes.Field;
    (<any[]><any>TableTypes)[0x06] = TableTypes.MethodDef;
    (<any[]><any>TableTypes)[0x08] = TableTypes.Param;
    (<any[]><any>TableTypes)[0x09] = TableTypes.InterfaceImpl;
    (<any[]><any>TableTypes)[0x0A] = TableTypes.MemberRef;
    (<any[]><any>TableTypes)[0x0B] = TableTypes.Constant;
    (<any[]><any>TableTypes)[0x0C] = TableTypes.CustomAttribute;
    (<any[]><any>TableTypes)[0x0D] = TableTypes.FieldMarshal;
    (<any[]><any>TableTypes)[0x0E] = TableTypes.DeclSecurity;
    (<any[]><any>TableTypes)[0x0F] = TableTypes.ClassLayout;
    (<any[]><any>TableTypes)[0x10] = TableTypes.FieldLayout;
    (<any[]><any>TableTypes)[0x11] = TableTypes.StandAloneSig;
    (<any[]><any>TableTypes)[0x12] = TableTypes.EventMap;
    (<any[]><any>TableTypes)[0x14] = TableTypes.Event;
    (<any[]><any>TableTypes)[0x15] = TableTypes.PropertyMap;
    (<any[]><any>TableTypes)[0x17] = TableTypes.Property;
    (<any[]><any>TableTypes)[0x18] = TableTypes.MethodSemantics;
    (<any[]><any>TableTypes)[0x19] = TableTypes.MethodImpl;
    (<any[]><any>TableTypes)[0x1A] = TableTypes.ModuleRef;
    (<any[]><any>TableTypes)[0x1B] = TableTypes.TypeSpec;
    (<any[]><any>TableTypes)[0x1C] = TableTypes.ImplMap;
    (<any[]><any>TableTypes)[0x1D] = TableTypes.FieldRVA;
    (<any[]><any>TableTypes)[0x20] = TableTypes.Assembly;
    (<any[]><any>TableTypes)[0x21] = TableTypes.AssemblyProcessor;
    (<any[]><any>TableTypes)[0x22] = TableTypes.AssemblyOS;
    (<any[]><any>TableTypes)[0x23] = TableTypes.AssemblyRef;
    (<any[]><any>TableTypes)[0x24] = TableTypes.AssemblyRefProcessor;
    (<any[]><any>TableTypes)[0x25] = TableTypes.AssemblyRefOS;
    (<any[]><any>TableTypes)[0x26] = TableTypes.File;
    (<any[]><any>TableTypes)[0x27] = TableTypes.ExportedType;
    (<any[]><any>TableTypes)[0x28] = TableTypes.ManifestResource;
    (<any[]><any>TableTypes)[0x29] = TableTypes.NestedClass;
    (<any[]><any>TableTypes)[0x2A] = TableTypes.GenericParam;
    (<any[]><any>TableTypes)[0x2B] = TableTypes.MethodSpec;
    (<any[]><any>TableTypes)[0x2C] = TableTypes.GenericParamConstraint;
}