/// <reference path="MetadataStreams.ts" />
/// <reference path="../tables/TableTypes.ts" />

module pe.managed.metadata {
    export class TableStream {
        reserved0: number;
        version: string;
        
        // byte
        heapSizes: number;

        reserved1: number;

        tables: any[][];

        readInitRowCounts(tableReader: io.BinaryReader) {
            this.reserved0 = tableReader.readInt();

            // Note those are bytes, not shorts!
            this.version = tableReader.readByte() + "." + tableReader.readByte();

            this.heapSizes = tableReader.readByte();
            this.reserved1 = tableReader.readByte();

            var valid = tableReader.readLong();
            var sorted = tableReader.readLong();

            this.tables = Array(tables.TableTypes.length);

            this.initTableRowCounts(tableReader, valid);
        }
            
        private initTableRowCounts(reader: io.BinaryReader, valid: Long) {
            var bits = valid.lo;
            for (var tableIndex = 0; tableIndex < 32; tableIndex++) {
                if (bits & 1) {
                    var rowCount = reader.readInt();
                    this.initTable(tableIndex, rowCount);
                }
                bits = bits >> 1;
            }

            bits = valid.hi;
            for (var i = 0; i < 32; i++) {
                var tableIndex = i + 32;
                if (bits & 1) {
                    var rowCount = reader.readInt();
                    this.initTable(tableIndex, rowCount);
                }
                bits = bits >> 1;
            }
        }

        private initTable(tableIndex: number, rowCount: number) {
            var tableRows = this.tables[tableIndex] = Array(rowCount);

            if (tables.TableTypes[tableIndex].ctor) {
                for (var i = 0; i < rowCount; i++) {
                    if (!tableRows[i])
                        tableRows[i] = new tables.TableTypes[tableIndex].ctor();
                }
            }
        }

       readTables(reader: io.BinaryReader, streams: MetadataStreams) {
            for (var tableIndex = 0; tableIndex < tables.TableTypes.length; tableIndex++) {
                var tableRows = this.tables[tableIndex];

                if (!tableRows)
                    continue;

                var read = tables.TableTypes[tableIndex].read;

                if (!read)
                    continue;

                var tableStreamReader = new tables.TableStreamReader(
                    reader,
                    streams,
                    this.tables);

                for (var i = 0; i < tableRows.length; i++) {
                    read(tableRows[i], tableStreamReader);
                }
            }
        }
    }
}