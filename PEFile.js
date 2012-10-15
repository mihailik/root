var mzSignature = 23117;
var DosHeaderSize = 64;
var PEFile = (function () {
    function PEFile() { }
    PEFile.dosHeaderSize = 64;
    PEFile.read = function read(reader, onsuccess, onfailure) {
        reader.readUint32(DosHeaderSize / 4, function (mzArray) {
            var mzPlus = mzArray[0];
            mzPlus = mzPlus & 65535;
            var lfanew = mzArray[mzArray.length - 1];
            reader.offset = lfanew;
            if(mzPlus != mzSignature) {
                onfailure(new Error("MZ signature is invalid."));
                return;
            }
            var pe = new PEFile();
            reader.readUint32(6, function (peHeader) {
                pe.parsePEHeader(reader, peHeader, onsuccess, onfailure);
            }, onfailure);
        }, onfailure);
    }
    PEFile.prototype.parsePEHeader = function (reader, peHeader, onsuccess, onfailure) {
        var _this = this;
        var peSignature = 17744;
        if(peHeader[0] != peSignature) {
            onfailure(new Error("PE signature is invalid."));
            return;
        }
        this.machine = peHeader[1] & 65535;
        this.numberOfSections = peHeader[1] >> 16;
        var timestampSecondsFromEpochUtc = peHeader[2];
        this.timestamp = new Date(timestampSecondsFromEpochUtc * 1000);
        this.timestamp = new Date(Date.UTC(this.timestamp.getFullYear(), this.timestamp.getMonth(), this.timestamp.getDate(), this.timestamp.getHours(), this.timestamp.getMinutes(), this.timestamp.getSeconds(), this.timestamp.getMilliseconds()));
        var sizeOfOptionalHeader = peHeader[5] & 65535;
        this.imageCharacteristics = peHeader[5] >> 16;
        reader.readUint32(sizeOfOptionalHeader, function (optionalHeader) {
            return _this.parseOptionalHeader(reader, optionalHeader, onsuccess, onfailure);
        }, onfailure);
    };
    PEFile.prototype.parseOptionalHeader = function (reader, optionalHeader, onsuccess, onfailure) {
        var nt32Magic = 267;
        var nt64Magic = 523;
        var magic = optionalHeader[0] & 65535;
        if(magic != nt32Magic && magic != nt64Magic) {
            onfailure(new Error("PE magic field is invalid."));
            return;
        }
        this.addressOfEntryPoint = optionalHeader[4];
        var debug = this;
        debug.sectionAlignment = optionalHeader[8];
        debug.fileAlignment = optionalHeader[9];
        this.majorOSVersion = optionalHeader[10] & 65535;
        this.minorOSVersion = optionalHeader[10] >> 16;
        this.majorImageVersion = optionalHeader[11] & 65535;
        this.minorImageVersion = optionalHeader[11] >> 16;
        this.win32Version = optionalHeader[12];
        this.subsystem = optionalHeader[16] & 65535;
        this.dllCharacteristics = optionalHeader[16] >> 16;
        onsuccess(this);
    };
    return PEFile;
})();
var Machine = {
    Unknown: 0,
    I386: 332,
    R3000: 354,
    R4000: 358,
    R10000: 360,
    WCEMIPSV2: 361,
    Alpha: 388,
    SH3: 418,
    SH3DSP: 419,
    SH3E: 420,
    SH4: 422,
    SH5: 424,
    ARM: 448,
    Thumb: 450,
    AM33: 467,
    PowerPC: 496,
    PowerPCFP: 497,
    IA64: 512,
    MIPS16: 614,
    Alpha64: 644,
    MIPSFPU: 870,
    MIPSFPU16: 1126,
    Tricore: 1312,
    CEF: 3311,
    EBC: 3772,
    AMD64: 34404,
    M32R: 36929,
    CEE: 49390
};
