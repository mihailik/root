/// <reference path="../IO/BinaryReader.ts" />
/// <reference path="../IO/BinaryReaderExtensions.ts" />

/// <reference path="../PEFormat/PEFileReader.ts" />

/// <reference path="../ModuleDefinition.ts" />

/// <reference path="ReadClrDirectory.ts" />
/// <reference path="ReadStreams.ts" />

module Mi.PE.Cli {
    export class ReadTables {
        reserved0: number;
        version: Version;
        
        // byte
        heapSizes: number;

        reserved1: number;

        constructor (_module: ModuleDefinition, clrDirectory: ReadClrDirectory, streams: ReadStreams, reader: Mi.PE.IO.BinaryReader) {
            
            var tableStreamRange = new Mi.PE.PEFormat.DataDirectory(
                clrDirectory.metadataDir.address + streams.tables.address,
                streams.tables.size);
            
            reader.byteOffset = Mi.PE.PEFormat.mapVirtual(tableStreamRange, _module.pe.sectionHeaders);

            this.reserved0 = reader.readInt();

            // Note those are bytes, not shorts!
            _module.tableStreamVersion = new Version(reader.readByte(), reader.readByte());

            this.heapSizes = reader.readByte();
            this.reserved1 = reader.readByte();
            var valid = reader.readLong();
            var sorted = reader.readLong();

            var rowCounts = this.readRowCounts(reader, valid.lo, valid.hi);
            //ReadTables(reader);
        }

        readRowCounts(reader: Mi.PE.IO.BinaryReader, lo: number, hi: number): number[] {
            var result: number[] = Array(12);

            return result;
        }
    }
}