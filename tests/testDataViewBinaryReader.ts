/// <reference path="../io.ts" />

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

    export function readBytes_new_staticUint8ArrayConstructor() {
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

}