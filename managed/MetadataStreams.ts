/// <reference path="../io.ts" />

module pe.managed {
    export class MetadataStreams {

        guids: string[] = [];
        strings: io.AddressRange = null;
        blobs: io.AddressRange = null;
        tables: io.AddressRange = null;

        read(metadataBaseAddress: number, streamCount: number, reader: io.BufferReader) {

            var guidRange: io.AddressRange;

            for (var i = 0; i < streamCount; i++) {
                var range = new io.AddressRange(
                    reader.readInt(),
                    reader.readInt());

                range.address += metadataBaseAddress;

                var name = this.readAlignedNameString(reader);


                switch (name) {
                    case "#GUID":
                        guidRange = range;
                        continue;

                    case "#Strings":
                        this.strings = range;
                        continue;

                    case "#Blob":
                        this.blobs = range;
                        continue;

                    case "#~":
                    case "#-":
                        this.tables = range;
                        continue;
                }

                (<any>this)[name] = range;
            }

            if (guidRange) {
            	var saveOffset = reader.offset;
                reader.setVirtualOffset(guidRange.address);

                this.guids = Array(guidRange.size / 16);
                for (var i = 0; i < this.guids.length; i++) {
                    var guid = this.readGuidForStream(reader);
                    this.guids[i] = guid;
                }

                reader.offset = saveOffset;
            }
        }

        private readAlignedNameString(reader: io.BufferReader) {
            var result = "";
            while (true) {
                var b = reader.readByte();
                if (b == 0)
                    break;

                result += String.fromCharCode(b);
            }

            var skipCount = -1 + ((result.length + 4) & ~3) - result.length;
            for (var i = 0; i < skipCount; i++) {
            	reader.readByte();
            }

            return result;
        }

        private readGuidForStream(reader: io.BufferReader) {
            var guid = "{";
            for (var i = 0; i < 4; i++) {
                var hex = reader.readInt().toString(16);
                guid +=
                    "00000000".substring(0, 8 - hex.length) + hex;
            }
            guid += "}";
            return guid;
        }
    }
}