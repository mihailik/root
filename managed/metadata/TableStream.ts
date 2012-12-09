/// <reference path="MetadataStreams.ts" />
/// <reference path="rowEnums.ts" />
/// <reference path="TableStreamReader.ts" />

module pe.managed.metadata {
    export class TableStream {
        reserved0: number = 0;
        version: string = "";

        // byte
        heapSizes: number = 0;

        reserved1: number = 0;

        tables: any[][];

        read(tableReader: io.BinaryReader, streams: MetadataStreams) {
            this.reserved0 = tableReader.readInt();

            // Note those are bytes, not shorts!
            this.version = tableReader.readByte() + "." + tableReader.readByte();

            this.heapSizes = tableReader.readByte();
            this.reserved1 = tableReader.readByte();

            var valid = tableReader.readLong();
            var sorted = tableReader.readLong();

            this.initTables(tableReader, valid);
            this.readTables(tableReader, streams);
        }

        private initTables(reader: io.BinaryReader, valid: Long) {
            this.tables = [];
            var tableTypes = [];

            for (var tk in TableKind) {
                if (!TableKind.hasOwnProperty(tk))
                    continue;

                var tkValue = TableKind[tk];
                if (typeof(tkValue)!=="number")
                    continue;

                tableTypes[tkValue] = metadata[tk];
            }

            var bits = valid.lo;
            for (var tableIndex = 0; tableIndex < 32; tableIndex++) {
                if (bits & 1) {
                    var rowCount = reader.readInt();
                    this.initTable(tableIndex, rowCount, tableTypes[tableIndex]);
                }
                bits = bits >> 1;
            }

            bits = valid.hi;
            for (var i = 0; i < 32; i++) {
                var tableIndex = i + 32;
                if (bits & 1) {
                    var rowCount = reader.readInt();
                    this.initTable(tableIndex, rowCount, tableTypes[tableIndex]);
                }
                bits = bits >> 1;
            }
        }

        private initTable(tableIndex: number, rowCount: number, TableType) {
            var tableRows = this.tables[tableIndex] = Array(rowCount);

            if (TableKind[tableIndex].ctor) {
                for (var i = 0; i < rowCount; i++) {
                    if (!tableRows[i]) {
                        var ctor = new TableType();
                        tableRows[i] = new ctor();
                    }
                }
            }
        }

        private readTables(reader: io.BinaryReader, streams: MetadataStreams) {
            var tableStreamReader = new TableStreamReader(
                reader,
                streams,
                this.tables);

            for (var tableIndex = 0; tableIndex < 64; tableIndex++) {
                var tableRows = this.tables[tableIndex];

                if (!tableRows)
                    continue;

                for (var i = 0; i < tableRows.length; i++) {
                    tableRows[i].read(tableStreamReader);
                }
            }
        }
    }
}