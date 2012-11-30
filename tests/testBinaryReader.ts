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
}