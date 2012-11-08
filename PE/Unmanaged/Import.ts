/// <reference path="../IO/BinaryReader.ts" />

module Mi.PE.Unmanaged {
    export class Import {
        name: string;
        ordinal: number;
        dllName: string;

        read(reader: Mi.PE.IO.BinaryReader) {
            var originalFirstThunk = reader.readInt();
            var timeDateStamp = reader.readInt();
            var forwarderChain = reader.readInt();
            var nameRva = reader.readInt();
            var firstThunk = reader.readInt();

            var libraryName = nameRva == 0 ? null : this.readAsciiZ(reader.readAtOffset(nameRva));

            var thunkAddressPosition = originalFirstThunk == 0 ? firstThunk : originalFirstThunk;

            if (thunkAddressPosition == 0)
                return null;

            var thunkReader = reader.readAtOffset(thunkAddressPosition);

            var importPosition = reader.readInt();
            if (importPosition == 0)
                return null;

            if ((importPosition & (1 << 31)) != 0) {
                this.dllName = libraryName;
                this.ordinal = importPosition;
            }
            else {
                var fnReader = reader.readAtOffset(importPosition);

                var hint = reader.readShort();
                var fname = this.readAsciiZ(reader);

                this.dllName = libraryName;
                this.ordinal = hint;
                this.name = fname;
            }
        }

        private readAsciiZ(reader: Mi.PE.IO.BinaryReader) {
            var result = "";
            while (true) {
                var nextChar = reader.readByte();
                if (nextChar==0)
                    break;

                result += String.fromCharCode(nextChar);
            }

            return result;
        }
    }
}