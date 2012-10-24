/// <reference path="../BinaryReader.ts" />

module Mi.PE.Internal {
    export function readZeroFilledString(reader: BinaryReader, maxLength: number) {
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

    export function readGuid(reader: BinaryReader) {
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