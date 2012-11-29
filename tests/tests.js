var pe;
(function (pe) {
    var Long = (function () {
        function Long(lo, hi) {
            this.lo = lo;
            this.hi = hi;
        }
        Long.prototype.toString = function () {
            var result;
            result = this.lo.toString(16);
            if(this.hi != 0) {
                result = ("0000").substring(result.length) + result;
                result = this.hi.toString(16) + result;
            }
            result = result.toUpperCase() + "h";
            return result;
        };
        return Long;
    })();
    pe.Long = Long;    
})(pe || (pe = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var io;
(function (io) {
    var BinaryReader = (function () {
        function BinaryReader() {
        }
        BinaryReader.prototype.readByte = function () {
            throw new Error("Not implemented.");
        };
        BinaryReader.prototype.readAtOffset = function (offset) {
            throw new Error("Not implemented.");
        };
        BinaryReader.prototype.readBytes = function (count) {
            throw new Error("Not implemented.");
        };
        BinaryReader.prototype.skipBytes = function (count) {
            throw new Error("Not implemented.");
        };
        BinaryReader.prototype.readShort = function () {
            var lo = this.readByte();
            var hi = this.readByte();
            return lo | (hi << 8);
        };
        BinaryReader.prototype.readInt = function () {
            var lo = this.readShort();
            var hi = this.readShort();
            return lo | (hi * 65536);
        };
        BinaryReader.prototype.readLong = function () {
            var lo = this.readInt();
            var hi = this.readInt();
            return new pe.Long(lo, hi);
        };
        BinaryReader.prototype.readTimestamp = function () {
            var timestampNum = this.readInt();
            var timestamp = new Date(timestampNum * 1000);
            var timestamp = new Date(Date.UTC(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), timestamp.getHours(), timestamp.getMinutes(), timestamp.getSeconds(), timestamp.getMilliseconds()));
            return timestamp;
        };
        BinaryReader.prototype.readZeroFilledAscii = function (length) {
            var chars = "";
            for(var i = 0; i < length || length === null || typeof length == "undefined"; i++) {
                var charCode = this.readByte();
                if(i > chars.length || charCode == 0) {
                    continue;
                }
                chars += String.fromCharCode(charCode);
            }
            return chars;
        };
        BinaryReader.prototype.readAsciiZ = function () {
            var result = "";
            while(true) {
                var nextChar = this.readByte();
                if(nextChar == 0) {
                    break;
                }
                result += String.fromCharCode(nextChar);
            }
            return result;
        };
        BinaryReader.prototype.readUtf8z = function (maxLength) {
            var buffer = "";
            var isConversionRequired = false;
            for(var i = 0; !maxLength || i < maxLength; i++) {
                var b = this.readByte();
                if(b == 0) {
                    break;
                }
                if(isConversionRequired) {
                    buffer += "%" + b.toString(16);
                } else {
                    if(b < 127) {
                        buffer += String.fromCharCode(b);
                    } else {
                        buffer = encodeURIComponent(buffer);
                        isConversionRequired = true;
                        buffer += "%" + b.toString(16);
                    }
                }
            }
            if(isConversionRequired) {
                buffer = decodeURIComponent(buffer);
            }
            return buffer;
        };
        return BinaryReader;
    })();
    io.BinaryReader = BinaryReader;    
    var DataViewBinaryReader = (function (_super) {
        __extends(DataViewBinaryReader, _super);
        function DataViewBinaryReader(dataView, byteOffset) {
            if (typeof byteOffset === "undefined") { byteOffset = 0; }
                _super.call(this);
            this.dataView = dataView;
            this.byteOffset = byteOffset;
        }
        DataViewBinaryReader.prototype.readByte = function () {
            var result = this.dataView.getUint8(this.byteOffset);
            this.byteOffset++;
            return result;
        };
        DataViewBinaryReader.prototype.readShort = function () {
            var result = this.dataView.getUint16(this.byteOffset, true);
            this.byteOffset += 2;
            return result;
        };
        DataViewBinaryReader.prototype.readInt = function () {
            var result = this.dataView.getUint32(this.byteOffset, true);
            this.byteOffset += 4;
            return result;
        };
        DataViewBinaryReader.prototype.readBytes = function (count) {
            var result = new Uint8Array(count);
            for(var i = 0; i < count; i++) {
                result[i] = this.dataView.getUint8(this.byteOffset + i);
            }
            this.byteOffset += count;
            return result;
        };
        DataViewBinaryReader.prototype.skipBytes = function (count) {
            this.byteOffset += count;
        };
        DataViewBinaryReader.prototype.readAtOffset = function (absoluteByteOffset) {
            return new DataViewBinaryReader(this.dataView, absoluteByteOffset);
        };
        return DataViewBinaryReader;
    })(BinaryReader);
    io.DataViewBinaryReader = DataViewBinaryReader;    
    var BufferBinaryReader = (function (_super) {
        __extends(BufferBinaryReader, _super);
        function BufferBinaryReader(arrayOfBytes, byteOffset) {
            if (typeof byteOffset === "undefined") { byteOffset = 0; }
                _super.call(this);
            this.arrayOfBytes = arrayOfBytes;
            this.byteOffset = byteOffset;
        }
        BufferBinaryReader.prototype.readByte = function () {
            var result = this.arrayOfBytes[this.byteOffset];
            this.byteOffset++;
            return result;
        };
        BufferBinaryReader.prototype.readBytes = function (count) {
            var result = Array(count);
            for(var i = 0; i < count; i++) {
                result[i] = this.arrayOfBytes[this.byteOffset + i];
            }
            this.byteOffset += count;
            return result;
        };
        BufferBinaryReader.prototype.skipBytes = function (count) {
            this.byteOffset += count;
        };
        BufferBinaryReader.prototype.readAtOffset = function (absoluteByteOffset) {
            return new BufferBinaryReader(this.arrayOfBytes, absoluteByteOffset);
        };
        return BufferBinaryReader;
    })(BinaryReader);
    io.BufferBinaryReader = BufferBinaryReader;    
    function getFileBinaryReader(file, onsuccess, onfailure) {
        var reader = new FileReader();
        reader.onerror = onfailure;
        reader.onloadend = function () {
            if(reader.readyState != 2) {
                onfailure(reader.error);
                return;
            }
            var result;
            try  {
                var resultArrayBuffer;
                resultArrayBuffer = reader.result;
                var resultDataView = new DataView(resultArrayBuffer);
                result = new DataViewBinaryReader(resultDataView);
            } catch (error) {
                onfailure(error);
            }
            onsuccess(result);
        };
        reader.readAsArrayBuffer(file);
    }
    io.getFileBinaryReader = getFileBinaryReader;
    function getUrlBinaryReader(url, onsuccess, onfailure) {
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";
        var requestLoadCompleteCalled = false;
        function requestLoadComplete() {
            if(requestLoadCompleteCalled) {
                return;
            }
            requestLoadCompleteCalled = true;
            var result;
            try  {
                var response = request.response;
                if(response) {
                    var resultDataView = new DataView(response);
                    result = new DataViewBinaryReader(resultDataView);
                } else {
                    var responseBody = new VBArray(request.responseBody).toArray();
                    var result = new BufferBinaryReader(responseBody);
                }
            } catch (error) {
                onfailure(error);
                return;
            }
            onsuccess(result);
        }
        ; ;
        request.onerror = onfailure;
        request.onloadend = function () {
            return requestLoadComplete;
        };
        request.onreadystatechange = function () {
            if(request.readyState == 4) {
                requestLoadComplete();
            }
        };
        request.send();
    }
    io.getUrlBinaryReader = getUrlBinaryReader;
})(io || (io = {}));
var pe;
(function (pe) {
    var DosHeader = (function () {
        function DosHeader() { }
        DosHeader.prototype.toString = function () {
            var result = "[" + (this.mz == MZSignature.MZ ? "MZ" : typeof this.mz == "number" ? (this.mz).toString(16) + "h" : typeof this.mz) + "]" + ".lfanew=" + (typeof this.lfanew == "number" ? this.lfanew.toString(16) + "h" : typeof this.lfanew);
            return result;
        };
        DosHeader.prototype.read = function (reader) {
            this.mz = reader.readShort();
            if(this.mz != MZSignature.MZ) {
                throw new Error("MZ signature is invalid: " + ((this.mz)).toString(16).toUpperCase() + "h.");
            }
            this.cblp = reader.readShort();
            this.cp = reader.readShort();
            this.crlc = reader.readShort();
            this.cparhdr = reader.readShort();
            this.minalloc = reader.readShort();
            this.maxalloc = reader.readShort();
            this.ss = reader.readShort();
            this.sp = reader.readShort();
            this.csum = reader.readShort();
            this.ip = reader.readShort();
            this.cs = reader.readShort();
            this.lfarlc = reader.readShort();
            this.ovno = reader.readShort();
            this.res1 = reader.readLong();
            this.oemid = reader.readShort();
            this.oeminfo = reader.readShort();
            this.reserved = [
                reader.readInt(), 
                reader.readInt(), 
                reader.readInt(), 
                reader.readInt(), 
                reader.readInt()
            ];
            this.lfanew = reader.readInt();
        };
        return DosHeader;
    })();
    pe.DosHeader = DosHeader;    
    (function (MZSignature) {
        MZSignature._map = [];
        MZSignature.MZ = "M".charCodeAt(0) + ("Z".charCodeAt(0) << 8);
    })(pe.MZSignature || (pe.MZSignature = {}));
    var MZSignature = pe.MZSignature;
})(pe || (pe = {}));
var pe;
(function (pe) {
    var PEHeader = (function () {
        function PEHeader() { }
        PEHeader.prototype.toString = function () {
            var result = this.machine + " " + this.characteristics + " " + "Sections[" + this.numberOfSections + "]";
            return result;
        };
        PEHeader.prototype.read = function (reader) {
            this.pe = reader.readInt();
            if(this.pe != PESignature.PE) {
                throw new Error("PE signature is invalid: " + ((this.pe)).toString(16).toUpperCase() + "h.");
            }
            this.machine = reader.readShort();
            this.numberOfSections = reader.readShort();
            this.timestamp = reader.readTimestamp();
            this.pointerToSymbolTable = reader.readInt();
            this.numberOfSymbols = reader.readInt();
            this.sizeOfOptionalHeader = reader.readShort();
            this.characteristics = reader.readShort();
        };
        return PEHeader;
    })();
    pe.PEHeader = PEHeader;    
    (function (PESignature) {
        PESignature._map = [];
        PESignature.PE = "P".charCodeAt(0) + ("E".charCodeAt(0) << 8);
    })(pe.PESignature || (pe.PESignature = {}));
    var PESignature = pe.PESignature;
    (function (Machine) {
        Machine._map = [];
        Machine.Unknown = 0;
        Machine.I386 = 332;
        Machine.R3000 = 354;
        Machine.R4000 = 358;
        Machine.R10000 = 360;
        Machine.WCEMIPSV2 = 361;
        Machine.Alpha = 388;
        Machine.SH3 = 418;
        Machine.SH3DSP = 419;
        Machine.SH3E = 420;
        Machine.SH4 = 422;
        Machine.SH5 = 424;
        Machine.ARM = 448;
        Machine.Thumb = 450;
        Machine.AM33 = 467;
        Machine.PowerPC = 496;
        Machine.PowerPCFP = 497;
        Machine.IA64 = 512;
        Machine.MIPS16 = 614;
        Machine.Alpha64 = 644;
        Machine.MIPSFPU = 870;
        Machine.MIPSFPU16 = 1126;
        Machine.AXP64 = Machine.Alpha64;
        Machine.Tricore = 1312;
        Machine.CEF = 3311;
        Machine.EBC = 3772;
        Machine.AMD64 = 34404;
        Machine.M32R = 36929;
        Machine.CEE = 49390;
    })(pe.Machine || (pe.Machine = {}));
    var Machine = pe.Machine;
    (function (ImageCharacteristics) {
        ImageCharacteristics._map = [];
        ImageCharacteristics.RelocsStripped = 1;
        ImageCharacteristics.ExecutableImage = 2;
        ImageCharacteristics.LineNumsStripped = 4;
        ImageCharacteristics.LocalSymsStripped = 8;
        ImageCharacteristics.AggressiveWsTrim = 16;
        ImageCharacteristics.LargeAddressAware = 32;
        ImageCharacteristics.BytesReversedLo = 128;
        ImageCharacteristics.Bit32Machine = 256;
        ImageCharacteristics.DebugStripped = 512;
        ImageCharacteristics.RemovableRunFromSwap = 1024;
        ImageCharacteristics.NetRunFromSwap = 2048;
        ImageCharacteristics.System = 4096;
        ImageCharacteristics.Dll = 8192;
        ImageCharacteristics.UpSystemOnly = 16384;
        ImageCharacteristics.BytesReversedHi = 32768;
    })(pe.ImageCharacteristics || (pe.ImageCharacteristics = {}));
    var ImageCharacteristics = pe.ImageCharacteristics;
})(pe || (pe = {}));
var pe;
(function (pe) {
    var DataDirectory = (function () {
        function DataDirectory(address, size) {
            this.address = address;
            this.size = size;
        }
        DataDirectory.prototype.contains = function (address) {
            return address >= this.address && address < this.address + this.size;
        };
        DataDirectory.prototype.toString = function () {
            return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "h";
        };
        return DataDirectory;
    })();
    pe.DataDirectory = DataDirectory;    
})(pe || (pe = {}));
var pe;
(function (pe) {
    var OptionalHeader = (function () {
        function OptionalHeader() { }
        OptionalHeader.prototype.toString = function () {
            var result = [];
            var peMagicText = this.peMagic;
            if(peMagicText) {
                result.push(peMagicText);
            }
            var subsystemText = this.subsystem;
            if(subsystemText) {
                result.push(subsystemText);
            }
            var dllCharacteristicsText = this.dllCharacteristics;
            if(dllCharacteristicsText) {
                result.push(dllCharacteristicsText);
            }
            var nonzeroDataDirectoriesText = [];
            if(this.dataDirectories) {
                for(var i = 0; i < this.dataDirectories.length; i++) {
                    if(this.dataDirectories[i].size <= 0) {
                        continue;
                    }
                    var kind = i;
                    nonzeroDataDirectoriesText.push(kind);
                }
            }
            result.push("dataDirectories[" + nonzeroDataDirectoriesText.join(",") + "]");
            var resultText = result.join(" ");
            return resultText;
        };
        OptionalHeader.prototype.read = function (reader) {
            this.peMagic = reader.readShort();
            if(this.peMagic != PEMagic.NT32 && this.peMagic != PEMagic.NT64) {
                throw Error("Unsupported PE magic value " + (this.peMagic).toString(16).toUpperCase() + "h.");
            }
            this.linkerVersion = reader.readByte() + "." + reader.readByte();
            this.sizeOfCode = reader.readInt();
            this.sizeOfInitializedData = reader.readInt();
            this.sizeOfUninitializedData = reader.readInt();
            this.addressOfEntryPoint = reader.readInt();
            this.baseOfCode = reader.readInt();
            if(this.peMagic == PEMagic.NT32) {
                this.baseOfData = reader.readInt();
                this.imageBase = reader.readInt();
            } else {
                this.imageBase = reader.readLong();
            }
            this.sectionAlignment = reader.readInt();
            this.fileAlignment = reader.readInt();
            this.operatingSystemVersion = reader.readShort() + "." + reader.readShort();
            this.imageVersion = reader.readShort() + "." + reader.readShort();
            this.subsystemVersion = reader.readShort() + "." + reader.readShort();
            this.win32VersionValue = reader.readInt();
            this.sizeOfImage = reader.readInt();
            this.sizeOfHeaders = reader.readInt();
            this.checkSum = reader.readInt();
            this.subsystem = reader.readShort();
            this.dllCharacteristics = reader.readShort();
            if(this.peMagic == PEMagic.NT32) {
                this.sizeOfStackReserve = reader.readInt();
                this.sizeOfStackCommit = reader.readInt();
                this.sizeOfHeapReserve = reader.readInt();
                this.sizeOfHeapCommit = reader.readInt();
            } else {
                this.sizeOfStackReserve = reader.readLong();
                this.sizeOfStackCommit = reader.readLong();
                this.sizeOfHeapReserve = reader.readLong();
                this.sizeOfHeapCommit = reader.readLong();
            }
            this.loaderFlags = reader.readInt();
            this.numberOfRvaAndSizes = reader.readInt();
            if(this.dataDirectories == null || this.dataDirectories.length != this.numberOfRvaAndSizes) {
                this.dataDirectories = (Array(this.numberOfRvaAndSizes));
            }
            for(var i = 0; i < this.numberOfRvaAndSizes; i++) {
                if(this.dataDirectories[i]) {
                    this.dataDirectories[i].address = reader.readInt();
                    this.dataDirectories[i].size = reader.readInt();
                } else {
                    this.dataDirectories[i] = new pe.DataDirectory(reader.readInt(), reader.readInt());
                }
            }
        };
        return OptionalHeader;
    })();
    pe.OptionalHeader = OptionalHeader;    
    (function (PEMagic) {
        PEMagic._map = [];
        PEMagic.NT32 = 267;
        PEMagic.NT64 = 523;
        PEMagic.ROM = 263;
    })(pe.PEMagic || (pe.PEMagic = {}));
    var PEMagic = pe.PEMagic;
    (function (Subsystem) {
        Subsystem._map = [];
        Subsystem.Unknown = 0;
        Subsystem.Native = 1;
        Subsystem.WindowsGUI = 2;
        Subsystem.WindowsCUI = 3;
        Subsystem.OS2CUI = 5;
        Subsystem.POSIXCUI = 7;
        Subsystem.NativeWindows = 8;
        Subsystem.WindowsCEGUI = 9;
        Subsystem.EFIApplication = 10;
        Subsystem.EFIBootServiceDriver = 11;
        Subsystem.EFIRuntimeDriver = 12;
        Subsystem.EFIROM = 13;
        Subsystem.XBOX = 14;
        Subsystem.BootApplication = 16;
    })(pe.Subsystem || (pe.Subsystem = {}));
    var Subsystem = pe.Subsystem;
    (function (DllCharacteristics) {
        DllCharacteristics._map = [];
        DllCharacteristics.ProcessInit = 1;
        DllCharacteristics.ProcessTerm = 2;
        DllCharacteristics.ThreadInit = 4;
        DllCharacteristics.ThreadTerm = 8;
        DllCharacteristics.DynamicBase = 64;
        DllCharacteristics.ForceIntegrity = 128;
        DllCharacteristics.NxCompatible = 256;
        DllCharacteristics.NoIsolation = 512;
        DllCharacteristics.NoSEH = 1024;
        DllCharacteristics.NoBind = 2048;
        DllCharacteristics.AppContainer = 4096;
        DllCharacteristics.WdmDriver = 8192;
        DllCharacteristics.Reserved = 16384;
        DllCharacteristics.TerminalServerAware = 32768;
    })(pe.DllCharacteristics || (pe.DllCharacteristics = {}));
    var DllCharacteristics = pe.DllCharacteristics;
    (function (DataDirectoryKind) {
        DataDirectoryKind._map = [];
        DataDirectoryKind.ExportSymbols = 0;
        DataDirectoryKind.ImportSymbols = 1;
        DataDirectoryKind.Resources = 2;
        DataDirectoryKind.Exception = 3;
        DataDirectoryKind.Security = 4;
        DataDirectoryKind.BaseRelocation = 5;
        DataDirectoryKind.Debug = 6;
        DataDirectoryKind.CopyrightString = 7;
        DataDirectoryKind.Unknown = 8;
        DataDirectoryKind.ThreadLocalStorage = 9;
        DataDirectoryKind.LoadConfiguration = 10;
        DataDirectoryKind.BoundImport = 11;
        DataDirectoryKind.ImportAddressTable = 12;
        DataDirectoryKind.DelayImport = 13;
        DataDirectoryKind.Clr = 14;
    })(pe.DataDirectoryKind || (pe.DataDirectoryKind = {}));
    var DataDirectoryKind = pe.DataDirectoryKind;
})(pe || (pe = {}));
var pe;
(function (pe) {
    var SectionHeader = (function () {
        function SectionHeader() { }
        SectionHeader.prototype.toString = function () {
            var result = this.name + " [" + this.rawData + "]=>[" + this.virtualRange + "]";
            return result;
        };
        SectionHeader.prototype.read = function (reader) {
            this.name = reader.readZeroFilledAscii(8);
            var virtualSize = reader.readInt();
            var virtualAddress = reader.readInt();
            this.virtualRange = new pe.DataDirectory(virtualAddress, virtualSize);
            var sizeOfRawData = reader.readInt();
            var pointerToRawData = reader.readInt();
            this.rawData = new pe.DataDirectory(pointerToRawData, sizeOfRawData);
            this.pointerToRelocations = reader.readInt();
            this.pointerToLinenumbers = reader.readInt();
            this.numberOfRelocations = reader.readShort();
            this.numberOfLinenumbers = reader.readShort();
            this.characteristics = reader.readInt();
        };
        return SectionHeader;
    })();
    pe.SectionHeader = SectionHeader;    
    (function (SectionCharacteristics) {
        SectionCharacteristics._map = [];
        SectionCharacteristics.Reserved_0h = 0;
        SectionCharacteristics.Reserved_1h = 1;
        SectionCharacteristics.Reserved_2h = 2;
        SectionCharacteristics.Reserved_4h = 4;
        SectionCharacteristics.NoPadding = 8;
        SectionCharacteristics.Reserved_10h = 16;
        SectionCharacteristics.ContainsCode = 32;
        SectionCharacteristics.ContainsInitializedData = 64;
        SectionCharacteristics.ContainsUninitializedData = 128;
        SectionCharacteristics.LinkerOther = 256;
        SectionCharacteristics.LinkerInfo = 512;
        SectionCharacteristics.Reserved_400h = 1024;
        SectionCharacteristics.LinkerRemove = 2048;
        SectionCharacteristics.LinkerCOMDAT = 4096;
        SectionCharacteristics.Reserved_2000h = 8192;
        SectionCharacteristics.NoDeferredSpeculativeExecution = 16384;
        SectionCharacteristics.GlobalPointerRelative = 32768;
        SectionCharacteristics.Reserved_10000h = 65536;
        SectionCharacteristics.MemoryPurgeable = 131072;
        SectionCharacteristics.MemoryLocked = 262144;
        SectionCharacteristics.MemoryPreload = 524288;
        SectionCharacteristics.Align1Bytes = 1048576;
        SectionCharacteristics.Align2Bytes = 2097152;
        SectionCharacteristics.Align4Bytes = 3145728;
        SectionCharacteristics.Align8Bytes = 4194304;
        SectionCharacteristics.Align16Bytes = 5242880;
        SectionCharacteristics.Align32Bytes = 6291456;
        SectionCharacteristics.Align64Bytes = 7340032;
        SectionCharacteristics.Align128Bytes = 8388608;
        SectionCharacteristics.Align256Bytes = 9437184;
        SectionCharacteristics.Align512Bytes = 10485760;
        SectionCharacteristics.Align1024Bytes = 11534336;
        SectionCharacteristics.Align2048Bytes = 12582912;
        SectionCharacteristics.Align4096Bytes = 13631488;
        SectionCharacteristics.Align8192Bytes = 14680064;
        SectionCharacteristics.LinkerRelocationOverflow = 16777216;
        SectionCharacteristics.MemoryDiscardable = 33554432;
        SectionCharacteristics.MemoryNotCached = 67108864;
        SectionCharacteristics.MemoryNotPaged = 134217728;
        SectionCharacteristics.MemoryShared = 268435456;
        SectionCharacteristics.MemoryExecute = 536870912;
        SectionCharacteristics.MemoryRead = 1073741824;
        SectionCharacteristics.MemoryWrite = 2147483648;
    })(pe.SectionCharacteristics || (pe.SectionCharacteristics = {}));
    var SectionCharacteristics = pe.SectionCharacteristics;
})(pe || (pe = {}));
var pe;
(function (pe) {
    var PEFile = (function () {
        function PEFile() {
            this.dosHeader = new pe.DosHeader();
            this.peHeader = new pe.PEHeader();
            this.optionalHeader = new pe.OptionalHeader();
            this.sectionHeaders = [];
        }
        PEFile.prototype.toString = function () {
            var result = "dosHeader: " + (this.dosHeader ? this.dosHeader + "" : "null") + " " + "dosStub: " + (this.dosStub ? "[" + this.dosStub.length + "]" : "null") + " " + "peHeader: " + (this.peHeader ? "[" + this.peHeader.machine + "]" : "null") + " " + "optionalHeader: " + (this.optionalHeader ? "[" + this.optionalHeader.subsystem + "," + this.optionalHeader.imageVersion + "]" : "null") + " " + "sectionHeaders: " + (this.sectionHeaders ? "[" + this.sectionHeaders.length + "]" : "null");
            return result;
        };
        PEFile.prototype.read = function (reader) {
            var dosHeaderSize = 64;
            if(!this.dosHeader) {
                this.dosHeader = new pe.DosHeader();
            }
            this.dosHeader.read(reader);
            if(this.dosHeader.lfanew > dosHeaderSize) {
                this.dosStub = reader.readBytes(this.dosHeader.lfanew - dosHeaderSize);
            } else {
                this.dosStub = null;
            }
            if(!this.peHeader) {
                this.peHeader = new pe.PEHeader();
            }
            this.peHeader.read(reader);
            if(!this.optionalHeader) {
                this.optionalHeader = new pe.OptionalHeader();
            }
            this.optionalHeader.read(reader);
            if(this.peHeader.numberOfSections > 0) {
                if(!this.sectionHeaders || this.sectionHeaders.length != this.peHeader.numberOfSections) {
                    this.sectionHeaders = Array(this.peHeader.numberOfSections);
                }
                for(var i = 0; i < this.sectionHeaders.length; i++) {
                    if(!this.sectionHeaders[i]) {
                        this.sectionHeaders[i] = new pe.SectionHeader();
                    }
                    this.sectionHeaders[i].read(reader);
                }
            }
        };
        return PEFile;
    })();
    pe.PEFile = PEFile;    
})(pe || (pe = {}));
var test_PEFile;
(function (test_PEFile) {
    function constructor_succeeds(ts) {
        var pefi = new pe.PEFile();
        ts.ok();
    }
    test_PEFile.constructor_succeeds = constructor_succeeds;
    function dosHeader_notNull(ts) {
        var pefi = new pe.PEFile();
        if(!pefi.dosHeader) {
            ts.fail();
        } else {
            ts.ok();
        }
    }
    test_PEFile.dosHeader_notNull = dosHeader_notNull;
})(test_PEFile || (test_PEFile = {}));
var TestRunner;
(function (TestRunner) {
    function collectTests(moduleObj) {
        var testList = [];
        function collectTestsCore(namePrefix, moduleObj, test_prefixOnly) {
            for(var testName in moduleObj) {
                if(moduleObj.hasOwnProperty && !moduleObj.hasOwnProperty(testName)) {
                    continue;
                }
                if(test_prefixOnly) {
                    if(testName.substring(0, "test_".length) !== "test_") {
                        continue;
                    }
                }
                var test = moduleObj[testName];
                if(typeof (test) === "function") {
                    var testName = test.name;
                    if(!testName) {
                        testName = test.toString();
                        testName = testName.substring(0, testName.indexOf("("));
                        testName = testName.replace(/function /g, "");
                    }
                    testList.push(new TestCase(namePrefix + testName, test));
                    continue;
                }
                if(typeof (test) === "object") {
                    collectTestsCore(namePrefix + testName + ".", test, false);
                }
            }
        }
        collectTestsCore("", moduleObj, false);
        return testList;
    }
    function runTest(test, onfinish) {
        var logPrint = function (s) {
            test.logText += (test.logText.length > 0 ? "\n" : "") + s;
        };
        var startTime = new Date().getTime();
        var updateTime = function () {
            var endTime = new Date().getTime();
            test.executionTimeMsec = endTime - startTime;
        };
        try  {
            var ts = {
                ok: function (message) {
                    if(test.success === false) {
                        return;
                    }
                    if(message) {
                        logPrint(message);
                    }
                    test.success = true;
                    updateTime();
                    onfinish();
                },
                fail: function (message) {
                    if(message) {
                        logPrint(message);
                    }
                    test.success = false;
                    updateTime();
                    onfinish();
                },
                log: function (message) {
                    if(message) {
                        logPrint(message);
                    }
                }
            };
            test.testMethod(ts);
        } catch (syncError) {
            logPrint(syncError.stack ? syncError.stack : syncError.message);
            test.success = false;
            onfinish();
        }
        var openBracketPos = test.testMethod.toString().indexOf("(");
        if(openBracketPos > 0 && test.testMethod.toString().substring(openBracketPos + 1, openBracketPos + 2) === ")") {
            test.success = true;
            onfinish();
        }
    }
    var TestCase = (function () {
        function TestCase(name, testMethod) {
            this.name = name;
            this.testMethod = testMethod;
            this.success = null;
            this.logText = "";
            this.executionTimeMsec = null;
        }
        return TestCase;
    })();
    TestRunner.TestCase = TestCase;    
    function runTests(moduleObj, onfinished) {
        var tests = collectTests(moduleObj);
        function defaultOnFinished(tests) {
            var _this = this;
            var sysLog;
            if(this.WScript) {
                sysLog = function (msg) {
                    return _this.WScript.Echo(msg);
                };
            } else {
                if(this.htmlConsole) {
                    sysLog = function (msg) {
                        return _this.htmlConsole.log(msg);
                    };
                } else {
                    sysLog = function (msg) {
                        return _this.console.log(msg);
                    };
                }
            }
            for(var i = 0; i < tests.length; i++) {
                sysLog(tests[i].name + ": " + (tests[i].executionTimeMsec / 1000) + "s " + (tests[i].success ? "OK" : "FAIL") + " " + tests[i].logText + "\n\n");
            }
        }
        var i = 0;
        function next() {
            if(i >= tests.length) {
                if(onfinished) {
                    onfinished(tests);
                } else {
                    defaultOnFinished(tests);
                }
                return;
            }
            runTest(tests[i], function () {
                i++;
                next();
            });
        }
        next();
    }
    TestRunner.runTests = runTests;
})(TestRunner || (TestRunner = {}));
TestRunner.runTests(test_PEFile);
//@ sourceMappingURL=tests.js.map
