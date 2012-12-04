/// <reference path="../pe.ts" />

module test_OptionalHeader {

    export function constructor_succeeds() {
        var oph = new pe.OptionalHeader();
    }

    export function peMagic_defaultNT32() {
        var oph = new pe.OptionalHeader();
        if (oph.peMagic !== pe.PEMagic.NT32)
            throw oph.peMagic;
    }

    export function linkerVersion_defaultEmptyString() {
        var oph = new pe.OptionalHeader();
        if (oph.linkerVersion !== "")
            throw oph.linkerVersion;
    }

    export function sizeOfCode_default0() {
        var oph = new pe.OptionalHeader();
        if (oph.sizeOfCode !== 0)
            throw oph.sizeOfCode;
    }

    export function sizeOfInitializedData_default0() {
        var oph = new pe.OptionalHeader();
        if (oph.sizeOfInitializedData !== 0)
            throw oph.sizeOfInitializedData;
    }

    export function sizeOfUninitializedData_default0() {
        var oph = new pe.OptionalHeader();
        if (oph.sizeOfUninitializedData !== 0)
            throw oph.sizeOfUninitializedData;
    }

    export function addressOfEntryPoint_default0() {
        var oph = new pe.OptionalHeader();
        if (oph.addressOfEntryPoint !== 0)
            throw oph.addressOfEntryPoint;
    }

    export function baseOfCode_default0x2000() {
        var oph = new pe.OptionalHeader();
        if (oph.baseOfCode !== 0x2000)
            throw oph.baseOfCode;
    }

    export function baseOfData_default0x4000() {
        var oph = new pe.OptionalHeader();
        if (oph.baseOfData !== 0x4000)
            throw oph.baseOfData;
    }

    export function imageBase_default0x4000() {
        var oph = new pe.OptionalHeader();
        if (oph.imageBase !== 0x4000)
            throw oph.imageBase;
    }

    export function sectionAlignment_default0x2000() {
        var oph = new pe.OptionalHeader();
        if (oph.sectionAlignment !== 0x2000)
            throw oph.sectionAlignment;
    }

    export function fileAlignment_default0x200() {
        var oph = new pe.OptionalHeader();
        if (oph.fileAlignment !== 0x200)
            throw oph.fileAlignment;
    }

    export function operatingSystemVersion_defaultEmptyString() {
        var oph = new pe.OptionalHeader();
        if (oph.operatingSystemVersion !== "")
            throw oph.operatingSystemVersion;
    }

    export function imageVersion_defaultEmptyString() {
        var oph = new pe.OptionalHeader();
        if (oph.imageVersion !== "")
            throw oph.imageVersion;
    }

    export function subsystemVersion_defaultEmptyString() {
        var oph = new pe.OptionalHeader();
        if (oph.subsystemVersion !== "")
            throw oph.subsystemVersion;
    }

    export function win32VersionValue_default0() {
        var oph = new pe.OptionalHeader();
        if (oph.win32VersionValue !== 0)
            throw oph.win32VersionValue;
    }

    export function sizeOfImage_default0() {
        var oph = new pe.OptionalHeader();
        if (oph.sizeOfImage !== 0)
            throw oph.sizeOfImage;
    }

    export function sizeOfHeaders_default0() {
        var oph = new pe.OptionalHeader();
        if (oph.sizeOfHeaders !== 0)
            throw oph.sizeOfHeaders;
    }

    export function checkSum_default0() {
        var oph = new pe.OptionalHeader();
        if (oph.checkSum !== 0)
            throw oph.checkSum;
    }

    export function subsystem_defaultWindowsCUI() {
        var oph = new pe.OptionalHeader();
        if (oph.subsystem !== pe.Subsystem.WindowsCUI)
            throw oph.subsystem;
    }

    export function dllCharacteristics_defaultNxCompatible() {
        var oph = new pe.OptionalHeader();
        if (oph.dllCharacteristics !== pe.DllCharacteristics.NxCompatible)
            throw oph.dllCharacteristics;
    }

    export function sizeOfStackReserve_default0x100000() {
        var oph = new pe.OptionalHeader();
        if (oph.sizeOfStackReserve !== 0x100000)
            throw oph.sizeOfStackReserve;
    }

    export function sizeOfStackCommit_default0x1000() {
        var oph = new pe.OptionalHeader();
        if (oph.sizeOfStackCommit !== 0x1000)
            throw oph.sizeOfStackCommit;
    }

    export function sizeOfHeapReserve_default0x100000() {
        var oph = new pe.OptionalHeader();
        if (oph.sizeOfHeapReserve !== 0x100000)
            throw oph.sizeOfHeapReserve;
    }

    export function sizeOfHeapCommit_default0x1000() {
        var oph = new pe.OptionalHeader();
        if (oph.sizeOfHeapCommit !== 0x1000)
            throw oph.sizeOfHeapCommit;
    }

    export function loaderFlags_default0() {
        var oph = new pe.OptionalHeader();
        if (oph.loaderFlags !== 0)
            throw oph.loaderFlags;
    }

    export function numberOfRvaAndSizes_default16() {
        var oph = new pe.OptionalHeader();
        if (oph.numberOfRvaAndSizes !== 16)
            throw oph.numberOfRvaAndSizes;
    }

    export function dataDirectories_defaultZeroLength() {
        var oph = new pe.OptionalHeader();
        if (oph.dataDirectories.length !== 0)
            throw oph.dataDirectories.length;
    }

    export function toString_default() {
        var oph = new pe.OptionalHeader();
        var expectedString =
            oph.peMagic + " " +
            oph.subsystem + " " +
            oph.dllCharacteristics +
            " dataDirectories[]";

        if (oph.toString() !== expectedString)
            throw oph.toString() + " expected " + expectedString;
    }

    export function toString_dataDirectories_1and7() {
        var oph = new pe.OptionalHeader();
        oph.dataDirectories[1] = new pe.DataDirectory(1, 1);
        oph.dataDirectories[7] = new pe.DataDirectory(2, 2);
        var expectedString =
            oph.peMagic + " " +
            oph.subsystem + " " +
            oph.dllCharacteristics +
            " dataDirectories[1,7]";

        if (oph.toString() !== expectedString)
            throw oph.toString() + " expected " + expectedString;
    }

}