/// <reference path="../../MethodDefinition.ts" />

module Mi.PE.Cli.Tables {
    export class MethodDef {
        method = new MethodDefinition();

        rva: number;
        signature: any;
        paramList: number;

        read(reader: Mi.PE.IO.BinaryReader, cliReader: CliReader) {
            this.rva = reader.readInt();
            this.method.implAttributes = reader.readShort();
            this.method.attributes = reader.readShort();
            this.method.name = cliReader.readString();
            this.signature = cliReader.readBlob();
            this.paramList = cliReader.readTableRowIndex(TableTypes.Param.index);
        }
    }
}