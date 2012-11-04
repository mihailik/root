/// <reference path="../../FieldDefinition.ts" />
/// <reference path="../../IO/BinaryReader.ts" />
/// <reference path="TableTypeDefinitions.ts" />

module Mi.PE.Cli.Tables {
    export class FieldDef {
        field = new FieldDefinition();
        signature: any;

        read(reader: Mi.PE.IO.BinaryReader, cliReader: CliReader) {
            this.field.attributes = reader.readShort();
            this.field.name = cliReader.readString();
            this.signature = cliReader.readBlob();
        }
    }
}