/// <reference path="../../TypeDefinition.ts" />
/// <reference path="../../IO/BinaryReader.ts" />
/// <reference path="TableTypeDefinitions.ts" />

module Mi.PE.Cli.Tables {
    export class TypeDef {
        type = new TypeDefinition();
        fieldList: number;
        methodList: number;

        read(reader: Mi.PE.IO.BinaryReader, cliReader: CliReader) {
            this.type.attributes = reader.readInt();
            this.type.name = cliReader.readString();
            this.type.namespace = cliReader.readString();
            this.type.extendsType = cliReader.readTypeDefOrRef();
            this.fieldList = cliReader.readTableRowIndex(TableTypes.Field.index);
            this.methodList = cliReader.readTableRowIndex(TableTypes.MethodDef.index);
        }
    }
}