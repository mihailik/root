/// <reference path="../../MethodDefinition.ts" />

module Mi.PE.Cli.Tables {
    export class MethodDef {
        method = new MethodDefinition();

        rva: number;
        signature: any;
        paramList: number;
    }
}