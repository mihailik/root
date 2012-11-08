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

            var libraryName = nameRva == 0 ? null : reader.readAtOffset(nameRva).readAsciiZ();

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
                var fname = reader.readAsciiZ();

                this.dllName = libraryName;
                this.ordinal = hint;
                this.name = fname;
            }
        }
    }
}