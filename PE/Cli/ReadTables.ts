/// <reference path="../IO/BinaryReader.ts" />
/// <reference path="../IO/IO.ts" />

/// <reference path="../PEFormat/PEFileReader.ts" />

/// <reference path="../ModuleDefinition.ts" />
/// <reference path="../TypeReference.ts" />

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

        tables: any[][];

        constructor (_module: ModuleDefinition, streams: ReadStreams, reader: Mi.PE.IO.BinaryReader) {
            
            var tableStreamRange = new Mi.PE.PEFormat.DataDirectory(
                streams.tables.address,
                streams.tables.size);
            
            reader.virtualByteOffset = tableStreamRange.address;

            this.reserved0 = reader.readInt();

            // Note those are bytes, not shorts!
            _module.tableStreamVersion = new Version(reader.readByte(), reader.readByte());

            this.heapSizes = reader.readByte();
            this.reserved1 = reader.readByte();
            var valid = reader.readLong();
            var sorted = reader.readLong();

            var rowCounts = this.readRowCounts(reader, valid.lo, valid.hi);
            this.tables = Array(rowCounts.length);
            for (var i = 0; i < rowCounts.length; i++) {
                if (rowCounts[i])
                    this.tables[i] = Array(rowCounts[i]);
            }

            if (this.tables[TableKind.Module]
                && this.tables[TableKind.Module].length>0) {
                this.tables[TableKind.Module][0] = _module;
            }

            this.readTables(_module, streams, reader);
        }

        private readRowCounts(reader: Mi.PE.IO.BinaryReader, lo: number, hi: number): number[] {
            var result: number[] = [];

            var bits = lo;
            for (var tableIndex = 0; tableIndex < 32; tableIndex++) {
                if (bits & 1) {
                    result[tableIndex] = reader.readInt();
                }
                bits = bits >> 1;
            }

            bits = hi;
            for (var i = 0; i < 32; i++) {
                var tableIndex = i + 32;
                if (bits & 1) {
                    result[i] = reader.readInt();
                }
                bits = bits >> 1;
            }

            return result;
        }

        readTables(_module: ModuleDefinition, streams: ReadStreams, reader: Mi.PE.IO.BinaryReader) {
            if (!this.tables[TableKind.Module]
                || this.tables[TableKind.Module].length<1)
                throw new Error("At least one module record is required in each binary CLR module.");

            if (this.tables[TableKind.Module]) {
                for (var i = 0; i < this.tables[TableKind.Module].length; i++) {
                    if (!this.tables[TableKind.Module][i])
                        this.tables[TableKind.Module][i] = new ModuleDefinition();
                    this.readModuleRow(this.tables[TableKind.Module][i], streams, reader);
                }
            }

            if (this.tables[TableKind.Module]) {
                for (var i = 0; i < this.tables[TableKind.Module].length; i++) {
                    this.tables[TableKind.Module][i] = new TypeReference();
                    this.readTypeRefRow(this.tables[TableKind.Module][i], streams, reader);
                }
            }
        }

        readModuleRow(_module: ModuleDefinition, streams: ReadStreams, reader: Mi.PE.IO.BinaryReader) {
            _module.generation = reader.readShort();
            _module.name = streams.readString(reader);
            _module.mvid = streams.readGuid(reader);
            _module.encId = streams.readGuid(reader);
            _module.encBaseId = streams.readGuid(reader);
        }

        readTypeRefRow(typeRef: TypeReference, streams: ReadStreams, reader: Mi.PE.IO.BinaryReader) {
            
        }
    }
}