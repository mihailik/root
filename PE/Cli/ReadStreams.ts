/// <reference path="../IO/BinaryReader.ts" />
/// <reference path="../IO/BinaryReaderExtensions.ts" />
/// <reference path="../PEFormat/DataDirectory.ts" />

module Mi.PE.Cli {
    export class ReadStreams {

        guids: string[];
        strings: Mi.PE.PEFormat.DataDirectory;
        blobs: Mi.PE.PEFormat.DataDirectory;
        tables: Mi.PE.PEFormat.DataDirectory;

        constructor (_module: ModuleDefinition, moduleCount: number, reader: Mi.PE.IO.BinaryReader) {

            var guidRange: Mi.PE.PEFormat.DataDirectory;

            for (var i = 0; i < moduleCount; i++) {
                var range = new Mi.PE.PEFormat.DataDirectory(reader.readInt(), reader.readInt());
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
                reader.byteOffset = Mi.PE.PEFormat.mapVirtual(
                    guidRange,
                    _module.pe.sectionHeaders);

                this.guids = Array(guidRange.size / 16);
                for (var i = 0; i < this.guids.length; i++) {
                    var guid = this.readGuid(reader);
                    this.guids[i] = guid;
                }
            }
        }

        readAlignedNameString(reader: Mi.PE.IO.BinaryReader) {
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

        readGuid(reader: Mi.PE.IO.BinaryReader) {
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