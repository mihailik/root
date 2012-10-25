/// <reference path="../IO/BinaryReader.ts" />
/// <reference path="../IO/BinaryReaderExtensions.ts" />
/// <reference path="../PEFormat/DataDirectory.ts" />

module Mi.PE.Cli {
    class StreamHeader {
        name: string;
        range: Mi.PE.PEFormat.DataDirectory;

        constructor (reader: Mi.PE.IO.BinaryReader) {
        }
    }
}