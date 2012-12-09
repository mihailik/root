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
            this.tables = Array(TableKind.length);

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

            if (TableKind[tableIndex].ctor) {
                for (var i = 0; i < rowCount; i++) {
                    if (!tableRows[i]) {
                        var ctor = TableKind[tableIndex].ctor;
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

            for (var tableIndex = 0; tableIndex < TableKind.length; tableIndex++) {
                var tableRows = this.tables[tableIndex];

                if (!tableRows)
                    continue;

                var ttype = TableKind[tableIndex];

                if (!ttype.read)
                    continue;

                for (var i = 0; i < tableRows.length; i++) {
                    if (!tableRows[i])
                        continue; // until all the reading is implemented

                    ttype.read(tableRows[i], tableStreamReader);
                }
            }
        }
    }
}