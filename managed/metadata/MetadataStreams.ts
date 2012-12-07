/// <reference path="../../io/io.ts" />
/// <reference path="../../headers/AddressRange.ts" />

module pe.managed.metadata {
    export class MetadataStreams {

        guids: string[] = [];
        strings: headers.AddressRange = null;
        blobs: headers.AddressRange = null;
        tables: headers.AddressRange = null;

        private stringHeapCache: string[] = [];

        read(metadataBaseAddress: number, streamCount: number, reader: io.BinaryReader) {

            var guidRange: headers.AddressRange;

            for (var i = 0; i < streamCount; i++) {
                var range = new headers.AddressRange(
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
                var guidReader = reader.readAtOffset(guidRange.address);

                this.guids = Array(guidRange.size / 16);
                for (var i = 0; i < this.guids.length; i++) {
                    var guid = this.readGuidForStream(guidReader);
                    this.guids[i] = guid;
                }
            }
        }

        private readAlignedNameString(reader: io.BinaryReader) {
            var result = "";
            while (true) {
                var b = reader.readByte();
                if (b == 0)
                    break;

                result += String.fromCharCode(b);
            }

            var skipCount = -1 + ((result.length + 4) & ~3) - result.length;
            reader.skipBytes(skipCount);

            return result;
        }

        private readGuidForStream(reader: io.BinaryReader) {
            var guid = "{";
            for (var i = 0; i < 4; i++) {
                var hex = reader.readInt().toString(16);
                guid +=
                    "00000000".substring(0, 8 - hex.length) + hex;
            }
            guid += "}";
            return guid;
        }

        readString(reader: io.BinaryReader): string {
            var pos: number;
            if(this.strings.size<65535)
                pos = reader.readShort();
            else
                pos = reader.readInt();

            var result: string;
            if(pos == 0 )
            {
                result = null;
            }
            else
            {
                result = this.stringHeapCache[pos];

                if (!result) {
                    if (pos > this.strings.size)
                        throw new Error("String heap position overflow.");

                    var utf8Reader = reader.readAtOffset(this.strings.address + pos);
                    result = utf8Reader.readUtf8z(1024*1024*1024); // strings longer than 1GB? Not supported for security reasons.

                    this.stringHeapCache[pos] = result;
                }
            }

            return result;
        }

        readGuid(reader: io.BinaryReader): string {
            var index: number;

            if (this.guids.length <= 65535)
                index = reader.readShort();
            else
                index = reader.readInt();

            if (index == 0)
                return null;

            return this.guids[(index-1)/16];
        }
    }
}