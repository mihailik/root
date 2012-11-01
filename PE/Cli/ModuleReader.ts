/// <reference path="../ModuleDefinition.ts" />

/// <reference path="../IO/BinaryReader.ts" />

/// <reference path="ReadClrDirectory.ts" />
/// <reference path="ReadClrMetadata.ts" />
/// <reference path="ReadStreams.ts" />
/// <reference path="ReadTables.ts" />

module Mi.PE.Cli.ModuleReader {

    export function readModule(_module: ModuleDefinition, reader: Mi.PE.IO.BinaryReaderWithAsciiz) {
        var clrDirectory = new ReadClrDirectory(_module, reader);
        var clrMetadata = new ReadClrMetadata(_module, clrDirectory, reader);
        var streams = new ReadStreams(_module, clrMetadata.streamCount, reader);
        var tables = new ReadTables(_module, clrDirectory, streams, reader);
    }
}