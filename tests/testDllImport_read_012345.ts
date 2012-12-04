/// <reference path="../pe.ts" />

module test_DllImport_read_012345 {

    var sampleBuf = (function () {
        var buf: number[] = [];
        for (var i = 0; i < 200; i++) {
            buf[i] = 0;
        }

        buf[0] = 50;
        buf[1] = buf[2] = buf[3] = 0;
        buf[50] = 14;

        buf[12] = 100;
        buf[13] = buf[14] = buf[15] = 0;
        buf[100] = ("Y").charCodeAt(0);
        buf[101] = 0;

        return buf;
    })();

    export function read_succeds() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var imports = pe.unmanaged.DllImport.read(bi);
    }

    export function read_length_1() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var imports = pe.unmanaged.DllImport.read(bi);

        if (imports.length !== 1)
            throw imports.length;
    }

    export function read_0_dllName_Y() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var imports = pe.unmanaged.DllImport.read(bi);

        if (imports[0].dllName !== "Y")
            throw imports[0].dllName;
    }

    export function read_0_name_emptyString() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var imports = pe.unmanaged.DllImport.read(bi);

        if (imports[0].name !== "")
            throw imports[0].name;
    }

    export function read_0_ordinal_0() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var imports = pe.unmanaged.DllImport.read(bi);

        if (imports[0].ordinal !== 0)
            throw imports[0].ordinal;
    }
}