/// <reference path="../ModuleDefinition.ts" />

/// <reference path="../IO/BinaryReader.ts" />

/// <reference path="ReadClrDirectory.ts" />
/// <reference path="ReadClrMetadata.ts" />

module Mi.PE.Cli.ModuleReader {

    function readModule(_module: ModuleDefinition, reader: Mi.PE.IO.BinaryReader) {
        var clrDirectory = new ReadClrDirectory(_module, reader);
        var clrMetadata = new ReadClrMetadata(_module, clrDirectory, reader);
    }
}