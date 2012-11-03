/// <reference path="../../IO/BinaryReader.ts" />

module Mi.PE.Cli.TableDetails {
    export interface CliReader {
        readString(): string;
        readGuid(): string;

        readResolutionScope(): any;
    }

    export class TableType {
        constructor (
            public name: string,
            public index: number,
            public comments: string,
            public ctor: any,
            public read: (
                row: any,
                reader: Mi.PE.IO.BinaryReader,
                cliReader: CliReader) => void) {
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
}