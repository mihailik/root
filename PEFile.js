var mzSignature = 23117;
var DosHeaderSize = 64;
var PEFile = (function () {
    function PEFile() { }
    PEFile.dosHeaderSize = 64;
    PEFile.peHeaderSize = 6;
    PEFile.sectionHeaderSize = 10;
    PEFile.read = function read(reader, onsuccess, onfailure) {
        var pe = new PEFile();
        pe.readCore(reader, function () {
            return onsuccess(pe);
        }, onfailure);
    }
    PEFile.prototype.readCore = function (reader, onsuccess, onfailure) {
        var _this = this;
        reader.readUint32(DosHeaderSize / 4, function (dosHeader) {
            var lfanew = _this.parseDosHeader(dosHeader);
            reader.offset = lfanew;
            reader.readUint32(PEFile.peHeaderSize, function (peHeader) {
                var peHeaderOutput = _this.parsePEHeader(peHeader);
                reader.readUint32(peHeaderOutput.sizeOfOptionalHeader, function (optionalHeader) {
                    var optionalHeaderOutput = _this.parseOptionalHeader(optionalHeader);
                    reader.offset = optionalHeaderOutput.sectionsStartOffset;
                    reader.readUint32(peHeaderOutput.numberOfSections * PEFile.sectionHeaderSize, function (sectionHeaders) {
                        _this.parseSectionHeaders(sectionHeaders, peHeaderOutput.numberOfSections);
                        onsuccess();
                    }, onfailure);
                }, onfailure);
            }, onfailure);
        }, onfailure);
    };
    PEFile.prototype.parseDosHeader = function (dosHeader) {
        var mzPlus = dosHeader[0];
        mzPlus = mzPlus & 65535;
        if(mzPlus != mzSignature) {
            throw new Error("MZ signature is invalid.");
        }
        var lfanew = dosHeader[dosHeader.length - 1];
        return lfanew;
    };
    PEFile.prototype.parsePEHeader = function (peHeader) {
        var peSignature = 17744;
        if(peHeader[0] != peSignature) {
            throw new Error("PE signature is invalid.");
        }
        this.machine = peHeader[1] & 65535;
        var numberOfSections = peHeader[1] >> 16;
        var timestampSecondsFromEpochUtc = peHeader[2];
        this.timestamp = new Date(timestampSecondsFromEpochUtc * 1000);
        this.timestamp = new Date(Date.UTC(this.timestamp.getFullYear(), this.timestamp.getMonth(), this.timestamp.getDate(), this.timestamp.getHours(), this.timestamp.getMinutes(), this.timestamp.getSeconds(), this.timestamp.getMilliseconds()));
        var sizeOfOptionalHeader = peHeader[5] & 65535;
        this.imageCharacteristics = peHeader[5] >> 16;
        return {
            numberOfSections: numberOfSections,
            sizeOfOptionalHeader: sizeOfOptionalHeader
        };
    };
    PEFile.prototype.parseOptionalHeader = function (optionalHeader) {
        var nt32Magic = 267;
        var nt64Magic = 523;
        var magic = optionalHeader[0] & 65535;
        if(magic != nt32Magic && magic != nt64Magic) {
            throw new Error("PE magic field is invalid.");
        }
        this.addressOfEntryPoint = optionalHeader[4];
        this.majorOSVersion = optionalHeader[10] & 65535;
        this.minorOSVersion = optionalHeader[10] >> 16;
        this.majorImageVersion = optionalHeader[11] & 65535;
        this.minorImageVersion = (optionalHeader[11] >> 16) & 65535;
        this.win32Version = optionalHeader[12];
        this.subsystem = optionalHeader[17] & 65535;
        this.dllCharacteristics = (optionalHeader[17] >> 16) & 65535;
        var rvaCountHeaderOffset = magic == nt32Magic ? 23 : 23 + 4;
        var numberOfRvaAndSizes = optionalHeader[rvaCountHeaderOffset];
        var clrDataDirectoryIndex = 14;
        if(numberOfRvaAndSizes < clrDataDirectoryIndex + 1) {
            throw new Error("PE image does not contain CLR directory.");
        }
        var clrDirHeaderOffset = rvaCountHeaderOffset + 4 + clrDataDirectoryIndex * 4;
        var clrDirVA = optionalHeader[clrDirHeaderOffset];
        var clrDirSize = optionalHeader[clrDirHeaderOffset + 4];
        return {
            numberOfRvaAndSizes: numberOfRvaAndSizes,
            sectionsStartOffset: rvaCountHeaderOffset + 4 + numberOfRvaAndSizes * 4,
            clrDirVA: clrDirVA,
            clrDirSize: clrDirSize
        };
    };
    PEFile.prototype.parseSectionHeaders = function (sectionHeaders, numberOfSections) {
    };
    return PEFile;
})();
