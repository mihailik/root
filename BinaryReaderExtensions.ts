/// <reference path="BinaryReader.ts" />

module Mi.PE {
    export class BinaryReaderExtensions {
        static readZeroFilledString(reader: BinaryReader, maxLength: number) {
            var chars = "";

            for (var i = 0; i < maxLength; i++) {
                var charCode = reader.readByte();

                if (i>chars.length
                    || charCode == 0)
                    continue;

                chars += String.fromCharCode(charCode);
            }
            
            return chars;
        }
    }
}