/// <reference path="BinaryReader.ts" />

module Mi.PE.IO {
    export function readZeroFilledString(reader: Mi.PE.IO.BinaryReader, maxLength: number) {
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