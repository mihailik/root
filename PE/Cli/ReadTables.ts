/// <reference path="../IO/BinaryReader.ts" />
/// <reference path="../IO/IO.ts" />

/// <reference path="../PEFormat/PEFileReader.ts" />

/// <reference path="../ModuleDefinition.ts" />
/// <reference path="../TypeReference.ts" />

/// <reference path="ReadClrDirectory.ts" />
/// <reference path="ReadStreams.ts" />
/// <reference path="TableKind.ts" />
/// <reference path="../Internal/FormatEnum.ts" />

/// <reference path="TableTypes.ts" />
/// <reference path="TableDetails/TableTypes.ts" />


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

            this.tables = Array(TableTypes.length);

            this.initTableRowCounts(_module, reader, valid.lo, valid.hi);
            
            this.readTables(_module, streams, reader);
        }

        private initTableRowCounts(_module: ModuleDefinition, reader: Mi.PE.IO.BinaryReader, lo: number, hi: number) {
            var bits = lo;
            for (var tableIndex = 0; tableIndex < 32; tableIndex++) {
                if (bits & 1) {
                    var rowCount = reader.readInt();
                    this.initTable(tableIndex, rowCount, _module);
                }
                bits = bits >> 1;
            }

            bits = hi;
            for (var i = 0; i < 32; i++) {
                var tableIndex = i + 32;
                if (bits & 1) {
                    var rowCount = reader.readInt();
                    this.initTable(tableIndex, rowCount, _module);
                }
                bits = bits >> 1;
            }
        }

        private initTable(tableIndex: number, rowCount: number, _module: ModuleDefinition) {
            var tableRows = this.tables[tableIndex] = Array(rowCount);

            if (tableIndex == TableTypes.Module.index
                && tableRows.length>0) {
                tableRows[0] = _module;
            }

            if (TableTypes[tableIndex].ctor) {
                for (var i = 0; i < rowCount; i++) {
                    if (!tableRows[i])
                        tableRows[i] = new TableTypes[tableIndex].ctor();
                }
            }
        }

       private  readTables(_module: ModuleDefinition, streams: ReadStreams, reader: Mi.PE.IO.BinaryReader) {
            for (var tableIndex = 0; tableIndex < TableTypes.length; tableIndex++) {
                var tableRows = this.tables[tableIndex];

                if (!tableRows)
                    continue;

                var read = TableTypes[tableIndex].read;

                if (!read)
                    continue;

                for (var i = 0; i < tableRows.length; i++) {
                    read(tableRows[i], streams, reader);
                }
            }
        }

        private createCodedIndexReader(...tableTypes: Mi.PE.Cli.TableDetails.TableType[]): (reader: Mi.PE.IO.BinaryReader) => any {
            var mask = 65535 >> tableTypes.length;

            var length = 0;
            for (var i = 0; i < tableTypes.length; i++)
            {
                var tableType = tableTypes[i];
                if (!tableType)
                    continue;

                var tableRows = this.tables[i];

                if (!tableRows)
                    continue;
                
                length = Math.max(length, tableRows.length);
            }

            var readResult: (reader: Mi.PE.IO.BinaryReader) => number;

            var result;

            if ((length & ~mask) == 0)
                readResult = reader => reader.readShort();
            else
                readResult = reader => reader.readInt();

            function calcTableKindBitCount(tableCount) {
                var bitMask = tableCount - 1;
                var result = 0;

                while (bitMask != 0)
                {
                    result++;
                    bitMask >>= 1;
                }

                return result;
            }

            var tableKindBitCount = calcTableKindBitCount(tableTypes.length);

            return (reader: Mi.PE.IO.BinaryReader) => {
                var result = readResult(reader);

                var resultIndex = result >> tableKindBitCount;
                var resultTableIndex = result - (resultIndex << tableKindBitCount);

                var table = this.tables[resultTableIndex][resultIndex];
            };
        }
    }
}