/// <reference path="../pe.ts" />

module pe.unmanaged {
    export class DllImport {
        name: string = "";
        ordinal: number = 0;
        dllName: string = "";

        static read(reader: pe.io.BinaryReader, result?: DllImport[]): DllImport[] {
            if (!result)
                result = [];

            var readLength = 0;
            while (true) {

                var originalFirstThunk = reader.readInt();
                var timeDateStamp = reader.readInt();
                var forwarderChain = reader.readInt();
                var nameRva = reader.readInt();
                var firstThunk = reader.readInt();

                var thunkAddressPosition = originalFirstThunk == 0 ? firstThunk : originalFirstThunk;
                if (thunkAddressPosition == 0)
                    break;

                var thunkReader = reader.readAtOffset(thunkAddressPosition);

                var libraryName = nameRva == 0 ? null : reader.readAtOffset(nameRva).readAsciiZ();

                while (true) {
                    var newEntry = result[readLength];
                    if (!newEntry) {
                        newEntry = new DllImport();
                        result[readLength] = newEntry;
                    }

                    if (!newEntry.readEntry(thunkReader))
                        break;

                    newEntry.dllName = libraryName;
                    readLength++;
                }
            }

            result.length = readLength;

            return result;
        }

        private readEntry(thunkReader: pe.io.BinaryReader): bool {
            var importPosition = thunkReader.readInt();
            if (importPosition == 0)
                return false;

            if ((importPosition & (1 << 31)) != 0) {
                this.ordinal = importPosition;
                this.name = null;
            }
            else {
                var fnReader = thunkReader.readAtOffset(importPosition);

                var hint = thunkReader.readShort();
                var fname = thunkReader.readAsciiZ();

                this.ordinal = hint;
                this.name = fname;
            }

            return true;
        }
    }
}