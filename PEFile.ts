/// <reference path="BinaryReader.ts" />

var mzSignature = 23117;
var DosHeaderSize = 64;

interface PEFileSuccess {
    (peFile: PEFile);
}

class PEFile {
    static dosHeaderSize: number = 64;

    machine: number;
    numberOfSections: number;
    timestamp: Date;
    imageCharacteristics: number;
    addressOfEntryPoint: number;
    majorOSVersion: number;
    minorOSVersion: number;
    majorImageVersion: number;
    minorImageVersion: number;
    win32Version: number;
    subsystem: number;
    dllCharacteristics: number;

    static read(
        reader: BinaryReader,
        onsuccess: PEFileSuccess,
        onfailure: Failure) {

        reader.readUint32(
            DosHeaderSize / 4,
            (mzArray: Uint32Array) => {
                var mzPlus = mzArray[0];

                mzPlus = mzPlus & 0xFFFF;

                var lfanew = mzArray[mzArray.length - 1];

                reader.offset = lfanew;

                if (mzPlus != mzSignature) {
                    onfailure(new Error("MZ signature is invalid."));
                    return;
                }

                var pe = new PEFile();

                reader.readUint32(
                    6,
                    peHeader => {
                        pe.parsePEHeader(
                            reader,
                            peHeader,
                            onsuccess,
                            onfailure);
                    },
                    onfailure);
            },
            onfailure);
    };

    private parsePEHeader(
        reader: BinaryReader,
        peHeader: Uint32Array,
        onsuccess: PEFileSuccess,
        onfailure: Failure) {
        var peSignature = 17744;

        if (peHeader[0] != peSignature) {
            onfailure(new Error("PE signature is invalid."));
            return;
        }

        this.machine = peHeader[1] & 0xFFFF;
        this.numberOfSections = peHeader[1] >> 16;

        var timestampSecondsFromEpochUtc = peHeader[2];
        this.timestamp = new Date(timestampSecondsFromEpochUtc * 1000);
        this.timestamp = new Date(
            Date.UTC(
                this.timestamp.getFullYear(),
                this.timestamp.getMonth(),
                this.timestamp.getDate(),
                this.timestamp.getHours(),
                this.timestamp.getMinutes(),
                this.timestamp.getSeconds(),
                this.timestamp.getMilliseconds()));

        var sizeOfOptionalHeader = peHeader[5] & 0xFFFF;
        this.imageCharacteristics = peHeader[5] >> 16;

        reader.readUint32(
            sizeOfOptionalHeader,
            optionalHeader =>
                this.parseOptionalHeader(
                    reader,
                    optionalHeader,
                    onsuccess,
                    onfailure),
            onfailure);
        };

    private parseOptionalHeader(
        reader: BinaryReader,
        optionalHeader: Uint32Array,
        onsuccess: PEFileSuccess,
        onfailure: Failure) {

        var nt32Magic = 0x010B;
        var nt64Magic = 0x020B;

        var magic = optionalHeader[0] & 0xFFFF;
        if (magic != nt32Magic && magic != nt64Magic) {
            onfailure(new Error("PE magic field is invalid."));
            return;
        }

        this.addressOfEntryPoint = optionalHeader[4];

        var debug: any = this;

        debug.sectionAlignment = optionalHeader[8];
        debug.fileAlignment = optionalHeader[9];

        this.majorOSVersion = optionalHeader[10] & 0xFFFF;
        this.minorOSVersion = optionalHeader[10] >> 16;

        this.majorImageVersion = optionalHeader[11] & 0xFFFF;
        this.minorImageVersion = optionalHeader[11] >> 16;

        this.win32Version = optionalHeader[12];

        this.subsystem = optionalHeader[16] & 0xFFFF;
        this.dllCharacteristics = optionalHeader[16] >> 16;

        onsuccess(this);
    };
}

    

var Machine = 
{
    Unknown: 0x0000,
    I386: 0x014C,
    R3000: 0x0162,
    R4000: 0x0166,
    R10000: 0x0168,
    WCEMIPSV2: 0x0169,
    Alpha: 0x0184,
    SH3: 0x01a2,
    SH3DSP: 0x01a3,
    SH3E: 0x01a4,
    SH4: 0x01a6,
    SH5: 0x01a8,
    ARM: 0x01c0,
    Thumb: 0x01c2,
    AM33: 0x01d3,
    PowerPC: 0x01F0,
    PowerPCFP: 0x01f1,
    IA64: 0x0200,
    MIPS16: 0x0266,
    Alpha64: 0x0284,
    MIPSFPU: 0x0366,
    MIPSFPU16: 0x0466,
    Tricore: 0x0520,
    CEF: 0x0CEF,
    EBC: 0x0EBC,
    AMD64: 0x8664,
    M32R: 0x9041,
    CEE: 0xC0EE
}