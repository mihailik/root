/// <reference path="../io.ts" />

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
        if (sh!=0x32F8)
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
        if (i!=0x123A456B)
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
        if (i!=0x123A456B)
            throw "0x" + i.toString(16).toUpperCase();
    }
}