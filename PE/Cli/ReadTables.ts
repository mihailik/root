/// <reference path="../IO/BinaryReader.ts" />
/// <reference path="../IO/BinaryReaderExtensions.ts" />

/// <reference path="../PEFormat/PEFileReader.ts" />

/// <reference path="../ModuleDefinition.ts" />

/// <reference path="ReadClrDirectory.ts" />
/// <reference path="ReadStreams.ts" />
/// <reference path="TableKind.ts" />
/// <reference path="../Internal/FormatEnum.ts" />

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

            var tables = this.populateRowCounts(reader, valid.lo, valid.hi);
            this.readTables(_module, streams, reader, tables);
        }

        private populateRowCounts(reader: Mi.PE.IO.BinaryReader, lo: number, hi: number): any[][] {
            var result: any[][] = Array(64);

            var bits = lo;
            for (var tableIndex = 0; tableIndex < 32; tableIndex++) {
                if (bits & 1) {
                    result[tableIndex] = Array(reader.readInt());
                }
                bits = bits >> 1;
            }

            bits = hi;
            for (var i = 0; i < 32; i++) {
                var tableIndex = i + 32;
                if (bits & 1) {
                    result[i] = Array(reader.readInt());
                }
                bits = bits >> 1;
            }

            return result;
        }

        readTables(_module: ModuleDefinition, streams: ReadStreams, reader: Mi.PE.IO.BinaryReader, tables: any[][]) {
            if (!tables[TableKind.Module]
                || tables[TableKind.Module].length!=1)
                throw new Error("Exactly one module record is required in each binary CLR module.");

            _module.generation = reader.readShort();
            _module.name = streams.readString(reader);
            _module.mvid = streams.readGuid(reader);
            _module.encId = streams.readGuid(reader);
            _module.encBaseId = streams.readGuid(reader);
        }
    }
}