/// <reference path="../IO/BinaryReader.ts" />
/// <reference path="../IO/IO.ts" />
/// <reference path="../PEFormat/DataDirectory.ts" />

module Mi.PE.Cli {
    export class ReadStreams {

        guids: string[];
        strings: Mi.PE.PEFormat.DataDirectory;
        blobs: Mi.PE.PEFormat.DataDirectory;
        tables: Mi.PE.PEFormat.DataDirectory;

        private stringHeapCache: string[] = [];

        constructor (_module: ModuleDefinition, metadataDir: Mi.PE.PEFormat.DataDirectory, streamCount: number, reader: Mi.PE.IO.BinaryReader) {

            var guidRange: Mi.PE.PEFormat.DataDirectory;

            for (var i = 0; i < streamCount; i++) {
                var range = new Mi.PE.PEFormat.DataDirectory(
                    reader.readInt(),
                    reader.readInt());

                range.address += metadataDir.address;

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
                var guidReader = reader.readAtVirtualOffset(guidRange.address);

                this.guids = Array(guidRange.size / 16);
                for (var i = 0; i < this.guids.length; i++) {
                    var guid = this.readGuidForStream(guidReader);
                    this.guids[i] = guid;
                }
            }
        }

        private readAlignedNameString(reader: Mi.PE.IO.BinaryReader) {
            var result = "";
            while (true) {
                var b = reader.readByte();
                if (b == 0)
                    break;

                result += String.fromCharCode(b);
            }

            var skipCount = -1 + ((result.length + 4) & ~3) - result.length;

            reader.byteOffset += skipCount;

            return result;
        }

        private readGuidForStream(reader: Mi.PE.IO.BinaryReader) {
            var guid = "{";
            for (var i = 0; i < 4; i++) {
                var hex = reader.readInt().toString(16);
                guid +=
                    "00000000".substring(0, 8 - hex.length) + hex;
            }
            guid += "}";
            return guid;
        }

        readString(reader: Mi.PE.IO.BinaryReader): string {
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

                    var utf8Reader = reader.readAtVirtualOffset(this.strings.address + pos);
                    result = utf8Reader.readUtf8z(1024*1024*1024); // strings longer than 1GB? Not supported for security reasons.

                    this.stringHeapCache[pos] = result;
                }
            }

            return result;
        }

        readGuid(reader: Mi.PE.IO.BinaryReader): string {
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