/// <reference path="../pe.ts" />

module test_DataViewBinaryReader {

    export function constructor_succeeds() {
        var dr = new pe.io.DataViewBinaryReader(<any>{}, 0);
    }

    export function readByte_getUint8() {
        var dr = new pe.io.DataViewBinaryReader(<any>{
            getUint8: (offset) => 84
        }, 0);

        var b = dr.readByte();

        if (b !== 84)
            throw dr;
    }

    export function readShort_getUint16() {
        var dr = new pe.io.DataViewBinaryReader(<any>{
            getUint16: (offset) => 21402
        }, 0);

        var s = dr.readShort();

        if (s !== 21402)
            throw dr;
    }

    export function readInt_getUint32() {
        var dr = new pe.io.DataViewBinaryReader(<any>{
            getUint32: (offset) => 21456082
        }, 0);

        var i = dr.readInt();

        if (i !== 21456082)
            throw dr;
    }

    export function readBytes_invokes_createUint32Array() {
        var dr = new pe.io.DataViewBinaryReader(<any>{
            getUint8: (offset) => 0
        }, 0);

        var wasInvoked = false;
        dr.createUint32Array = <any>function () {
            wasInvoked = true;
            return [];
        };

        dr.readBytes(2);

        if (!wasInvoked)
            throw "override constructor for Uint8Array has not been invoked";
    }

    export function readBytes_7_calls_getUint8_7times() {
        var callCount = 0;

        var dr = new pe.io.DataViewBinaryReader(<any>{
            getUint8: (offset) =>
            {
                callCount++;
                return 0;
            }
        }, 0);

        dr.createUint32Array = <any>() =>[];

        dr.readBytes(7);

        if (callCount !== 7)
            throw callCount;
    }

    export function readBytes_7_0123456() {
        var dr = new pe.io.DataViewBinaryReader(<any>{
            getUint8: (offset) => offset
        }, 0);

        dr.createUint32Array = <any>() =>[];

        var b = dr.readBytes(7);

        var bArray = [];
        for (var i = 0; i < b.length; i++) {
            bArray[i] = b[i];
        }

        var bStr = bArray.join(",");
        if (bStr !== "0,1,2,3,4,5,6")
            throw bStr;
    }

    export function skipBytes_2_0123_fromStart_2() {
        var dr = new pe.io.DataViewBinaryReader(<any>{
            getUint8: (offset) => offset
        }, 0);

        dr.createUint32Array = <any>() =>[];

        dr.skipBytes(2);
        var b = dr.readByte();

        if (b !== 2)
            throw b;
    }

    export function skipBytes_2_then3_01234567_5() {
        var dr = new pe.io.DataViewBinaryReader(<any>{
            getUint8: (offset) => offset
        }, 0);

        dr.createUint32Array = <any>() =>[];

        dr.skipBytes(2);
        dr.skipBytes(3);
        var b = dr.readByte();

        if (b !== 5)
            throw b;
    }

    export function clone_0() {
        var dr = new pe.io.DataViewBinaryReader(<any>{
            getUint8: (offset) => offset
        }, 0);

        var clo = dr.clone();

        dr.skipBytes(2);
        
        var b = clo.readByte();

        if (b !== 0)
            throw b;
    }

    export function clone_1() {
        var dr = new pe.io.DataViewBinaryReader(<any>{
            getUint8: (offset) => offset
        }, 0);

        dr.readByte();

        var clo = dr.clone();

        dr.skipBytes(2);
        
        var b = clo.readByte();

        if (b !== 1)
            throw b;
    }
}