/// <reference path="../pe.ts" />

module test_BinaryReader {

    export function constructor_succeeds() {
        var bi = new pe.io.BinaryReader();
    }

    export function readByte_throws() {
        var bi = new pe.io.BinaryReader();
        bi.readByte.toString(); // should not be null, keep outside try/catch
        try {
            bi.readByte();
        }
        catch (expectedError) {
            // that's expected
            return;
        }

        throw "Exception must be thrown.";
    }

    export function readAtOffset_0_throws() {
        var bi = new pe.io.BinaryReader();
        bi.readAtOffset.toString(); // should not be null, keep outside try/catch
        try {
            bi.readAtOffset(0);
        }
        catch (expectedError) {
            // that's expected
            return;
        }

        throw "Exception must be thrown.";
    }

    export function readAtOffset_1_throws() {
        var bi = new pe.io.BinaryReader();
        bi.readAtOffset.toString(); // should not be null, keep outside try/catch
        try {
            bi.readAtOffset(1);
        }
        catch (expectedError) {
            // that's expected
            return;
        }

        throw "Exception must be thrown.";
    }

    export function readAtOffset_minus1_throws() {
        var bi = new pe.io.BinaryReader();
        bi.readAtOffset.toString(); // should not be null, keep outside try/catch
        try {
            bi.readAtOffset(-1);
        }
        catch (expectedError) {
            // that's expected
            return;
        }

        throw "Exception must be thrown.";
    }

    export function readBytes_0_throws() {
        var bi = new pe.io.BinaryReader();
        bi.readBytes.toString(); // should not be null, keep outside try/catch
        try {
            bi.readBytes(0);
        }
        catch (expectedError) {
            // that's expected
            return;
        }

        throw "Exception must be thrown.";
    }

    export function readBytes_1_throws() {
        var bi = new pe.io.BinaryReader();
        bi.readBytes.toString(); // should not be null, keep outside try/catch
        try {
            bi.readBytes(1);
        }
        catch (expectedError) {
            // that's expected
            return;
        }

        throw "Exception must be thrown.";
    }

    export function readBytes_minus1_throws() {
        var bi = new pe.io.BinaryReader();
        bi.readBytes.toString(); // should not be null, keep outside try/catch
        try {
            bi.readBytes(-1);
        }
        catch (expectedError) {
            // that's expected
            return;
        }

        throw "Exception must be thrown.";
    }

    export function skipBytes_0_throws() {
        var bi = new pe.io.BinaryReader();
        bi.skipBytes.toString(); // should not be null, keep outside try/catch
        try {
            bi.skipBytes(0);
        }
        catch (expectedError) {
            // that's expected
            return;
        }

        throw "Exception must be thrown.";
    }

    export function clone_throws() {
        var bi = new pe.io.BinaryReader();
        bi.clone.toString(); // should not be null, keep outside try/catch
        try {
            bi.clone();
        }
        catch (expectedError) {
            // that's expected
            return;
        }

        throw "Exception must be thrown.";
    }

    export function skipBytes_1_throws() {
        var bi = new pe.io.BinaryReader();
        bi.skipBytes.toString(); // should not be null, keep outside try/catch
        try {
            bi.skipBytes(1);
        }
        catch (expectedError) {
            // that's expected
            return;
        }

        throw "Exception must be thrown.";
    }

    export function skipBytes_minus1_throws() {
        var bi = new pe.io.BinaryReader();
        bi.skipBytes.toString(); // should not be null, keep outside try/catch
        try {
            bi.skipBytes(-1);
        }
        catch (expectedError) {
            // that's expected
            return;
        }

        throw "Exception must be thrown.";
    }

    export function readShort_combinesTwoCallsTo_readByte_0x32F8() {
        var bi = new pe.io.BinaryReader();
        bi.readByte = () => {
            var lo = 0xF8;
            var hi = 0x32;
            bi.readByte = () => hi;
            return lo;
        };

        var sh = bi.readShort();
        if (sh!==0x32F8)
            throw "0x" + sh.toString(16).toUpperCase();
    }

    export function readShort_combinesTwoCallsTo_readShort_0x123A456B() {
        var bi = new pe.io.BinaryReader();
        bi.readShort = () => {
            var lo = 0x456B;
            var hi = 0x123A;
            bi.readShort = () => hi;
            return lo;
        };

        var i = bi.readInt();
        if (i!==0x123A456B)
            throw "0x" + i.toString(16).toUpperCase();
    }

    export function readShort_combinesFourCallsTo_readByte_0x123A456B() {
        var bi = new pe.io.BinaryReader();
        var b = [ 0x6B, 0x45, 0x3A, 0x12 ];
        var bOffset = 0;
        bi.readByte = () => {
            bOffset++;
            return b[bOffset - 1];
        };

        var i = bi.readInt();
        if (i!==0x123A456B)
            throw "0x" + i.toString(16).toUpperCase();
    }

     export function readLong_combinesTwoCallsTo_readInt_0x123A0000456B0000() {
        var bi = new pe.io.BinaryReader();
        bi.readInt = () => {
            var lo = 0x456B0000;
            var hi = 0x123A0000;
            bi.readInt = () => hi;
            return lo;
        };

        var lg = bi.readLong();
        if (lg.toString()!=="123A0000456B0000h")
            throw lg;
    }

    export function readLong_combinesFourCallsTo_readShort_0x123A0000456B0000() {
        var bi = new pe.io.BinaryReader();
        var s = [ 0x0, 0x456B, 0x0, 0x123A ];
        var sOffset = 0;
        bi.readShort = () => {
            sOffset++;
            return s[sOffset - 1];
        };

        var lg = bi.readLong();
        if (lg.toString()!=="123A0000456B0000h")
            throw lg;
    }

    export function readLong_combinesEightCallsTo_readByte_0x123A0000456B0000() {
        var bi = new pe.io.BinaryReader();
        var b = [ 0x0, 0x0, 0x6B, 0x45, 0x0, 0x0, 0x3A, 0x12 ];
        var bOffset = 0;
        bi.readByte = () => {
            bOffset++;
            return b[bOffset - 1];
        };

        var lg = bi.readLong();
        if (lg.toString()!=="123A0000456B0000h")
            throw lg;
    }

    export function readTimestamp_0_1970Jan1_000000() {
        var bi = new pe.io.BinaryReader();
        bi.readInt = () => 0;

        var dt = bi.readTimestamp();

        var expectedDate = new Date(1970, 0, 1, 0, 0, 0, 0);

        if (dt.toString() !== expectedDate.toString())
            throw dt + " expected " + expectedDate;

        if (dt.getTime() !== expectedDate.getTime())
            throw dt.getTime() + " expected " + expectedDate.getTime();
    }

    export function readTimestamp_1_1970Jan1_000001() {
        var bi = new pe.io.BinaryReader();
        bi.readInt = () => 1;

        var dt = bi.readTimestamp();

        var expectedDate = new Date(1970, 0, 1, 0, 0, 1, 0);

        if (dt.toString() !== expectedDate.toString())
            throw dt + " expected " + expectedDate;

        if (dt.getTime() !== expectedDate.getTime())
            throw dt.getTime() + " expected " + expectedDate.getTime();
    }

    export function readTimestamp_999999999_2001Sep9_034639() {
        var bi = new pe.io.BinaryReader();
        bi.readInt = () => 999999999;

        var dt = bi.readTimestamp();

        var expectedDate = new Date(2001, 8, 9, 3, 46, 39, 0);

        if (dt.toString() !== expectedDate.toString())
            throw dt + " expected " + expectedDate;

        if (dt.getTime() !== expectedDate.getTime())
            throw dt.getTime() + " expected " + expectedDate.getTime();
    }

    export function readZeroFilledAscii_1_0_emptyString() {
        var bi = new pe.io.BinaryReader();
        bi.readByte = () => 0;

        var str = bi.readZeroFilledAscii(1);

        if (str !== "")
            throw str;
    }

    export function readZeroFilledAscii_1_32_space() {
        var bi = new pe.io.BinaryReader();
        bi.readByte = () => 32;

        var str = bi.readZeroFilledAscii(1);

        if (str !== " ")
            throw str;
    }

    export function readZeroFilledAscii_1_0_readsOnlyOnce() {
        var bi = new pe.io.BinaryReader();
        var readCount = 0;
        bi.readByte = () => {
            readCount++;
            return 0;
        }

        bi.readZeroFilledAscii(1);

        if (readCount !== 1)
            throw readCount;
    }

    export function readZeroFilledAscii_2_00_emptyString() {
        var bi = new pe.io.BinaryReader();
        bi.readByte = () => 0;

        var str = bi.readZeroFilledAscii(2);

        if (str !== "")
            throw str;
    }

    export function readZeroFilledAscii_2_320_space() {
        var bi = new pe.io.BinaryReader();
        bi.readByte = () => {
            bi.readByte = () => 0;
            return 32;
        }

        var str = bi.readZeroFilledAscii(2);

        if (str !== " ")
            throw str;
    }

    export function readZeroFilledAscii_2_032_space() {
        var bi = new pe.io.BinaryReader();
        bi.readByte = () => {
            bi.readByte = () => 32;
            return 0;
        }

        var str = bi.readZeroFilledAscii(2);

        if (str !== " ")
            throw str;
    }

    export function readZeroFilledAscii_2_00_readsTwice() {
        var bi = new pe.io.BinaryReader();
        var readCount = 0;
        bi.readByte = () => {
            readCount++;
            return 0;
        }

        bi.readZeroFilledAscii(2);

        if (readCount !== 2)
            throw readCount;
    }

    export function readZeroFilledAscii_3_65066_AB() {
        var bi = new pe.io.BinaryReader();
        var b = [65, 0, 66];
        var bIndex = 0;
        bi.readByte = () => {
            bIndex++;
            return b[bIndex - 1];
        }

        var str = bi.readZeroFilledAscii(3);

        if (str !== "AB")
            throw str;
    }

    export function readAsciiZ_0_emptyString() {
        var bi = new pe.io.BinaryReader();
        bi.readByte = () => 0;

        var str = bi.readAsciiZ();

        if (str !== "")
            throw str;
    }
    export function readAsciiZ_6566670_ABC() {
        var bi = new pe.io.BinaryReader();
        var b = [65, 66, 67, 0];
        var bIndex = 0;
        bi.readByte = () => {
            bIndex++;
            return b[bIndex - 1];
        };

        var str = bi.readAsciiZ();

        if (str !== "ABC")
            throw str;
    }

    export function readUtf8Z_20_PrivetExclamation() {
        var bi = new pe.io.BinaryReader();
        var b = [0xD0, 0x9F, 0xD1, 0x80, 0xD0, 0xB8, 0xD0, 0xB2, 0xD0, 0xB5, 0xD1, 0x82, 0x21, 0];
        var bIndex = 0;
        bi.readByte = () => {
            bIndex++;
            return b[bIndex - 1];
        };

        var str = bi.readUtf8z(20);

        var expected = "\u041F\u0440\u0438\u0432\u0435\u0442\u0021";

        if (str !== expected)
            throw str + " expected " + expected;
    }

    export function readUtf8Z_13_PrivetExclamation() {
        var bi = new pe.io.BinaryReader();
        var b = [0xD0, 0x9F, 0xD1, 0x80, 0xD0, 0xB8, 0xD0, 0xB2, 0xD0, 0xB5, 0xD1, 0x82, 0x21, 0];
        var bIndex = 0;
        bi.readByte = () => {
            bIndex++;
            return b[bIndex - 1];
        };

        var str = bi.readUtf8z(13);

        var expected = "\u041F\u0440\u0438\u0432\u0435\u0442\u0021";

        if (str !== expected)
            throw str + " expected " + expected;
    }

    export function readUtf8Z_4_PrivetExclamation_Pr() {
        var bi = new pe.io.BinaryReader();
        var b = [0xD0, 0x9F, 0xD1, 0x80, 0xD0, 0xB8, 0xD0, 0xB2, 0xD0, 0xB5, 0xD1, 0x82, 0x21, 0];
        var bIndex = 0;
        bi.readByte = () => {
            bIndex++;
            return b[bIndex - 1];
        };

        var str = bi.readUtf8z(4);

        var expected = "\u041F\u0440\u0438\u0432\u0435\u0442\u0021".substring(0,2);

        if (str !== expected)
            throw str + " expected " + expected;
    }
}