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
        function DosHeader() {
            this.mz = MZSignature.MZ;
            this.cblp = 0;
            this.cp = 0;
            this.crlc = 0;
            this.cparhdr = 0;
            this.minalloc = 0;
            this.maxalloc = 0;
            this.ss = 0;
            this.sp = 0;
            this.csum = 0;
            this.ip = 0;
            this.cs = 0;
            this.lfarlc = 0;
            this.ovno = 0;
            this.res1 = new pe.Long(0, 0);
            this.oemid = 0;
            this.oeminfo = 0;
            this.reserved = [
                0, 
                0, 
                0, 
                0, 
                0
            ];
            this.lfanew = 0;
        }
        DosHeader.prototype.toString = function () {
            var result = "[" + (this.mz === MZSignature.MZ ? "MZ" : typeof this.mz === "number" ? (this.mz).toString(16).toUpperCase() + "h" : typeof this.mz) + "]" + ".lfanew=" + (typeof this.lfanew === "number" ? this.lfanew.toString(16).toUpperCase() + "h" : typeof this.lfanew);
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
        function PEHeader() {
            this.pe = PESignature.PE;
            this.machine = Machine.I386;
            this.numberOfSections = 0;
            this.timestamp = new Date(0);
            this.pointerToSymbolTable = 0;
            this.numberOfSymbols = 0;
            this.sizeOfOptionalHeader = 0;
            this.characteristics = ImageCharacteristics.Dll;
        }
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
        function OptionalHeader() {
            this.peMagic = PEMagic.NT32;
            this.linkerVersion = "";
            this.sizeOfCode = 0;
            this.sizeOfInitializedData = 0;
            this.sizeOfUninitializedData = 0;
            this.addressOfEntryPoint = 0;
            this.baseOfCode = 0;
            this.baseOfData = 0;
            this.imageBase = 0;
            this.sectionAlignment = 0;
            this.fileAlignment = 0;
            this.operatingSystemVersion = "";
            this.imageVersion = "";
            this.subsystemVersion = "";
            this.win32VersionValue = 0;
            this.sizeOfImage = 0;
            this.sizeOfHeaders = 0;
            this.checkSum = 0;
            this.subsystem = Subsystem.WindowsCUI;
            this.dllCharacteristics = DllCharacteristics.NxCompatible;
            this.sizeOfStackReserve = 0;
            this.sizeOfStackCommit = 0;
            this.sizeOfHeapReserve = 0;
            this.sizeOfHeapCommit = 0;
            this.loaderFlags = 0;
            this.numberOfRvaAndSizes = 0;
            this.dataDirectories = [];
        }
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
                    if(!this.dataDirectories[i] || this.dataDirectories[i].size <= 0) {
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
        function SectionHeader() {
            this.name = "";
            this.virtualRange = new pe.DataDirectory(0, 0);
            this.rawData = new pe.DataDirectory(0, 0);
            this.pointerToRelocations = 0;
            this.pointerToLinenumbers = 0;
            this.numberOfRelocations = 0;
            this.numberOfLinenumbers = 0;
            this.characteristics = SectionCharacteristics.ContainsCode;
        }
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
    function constructor_succeeds() {
        var pefi = new pe.PEFile();
    }
    test_PEFile.constructor_succeeds = constructor_succeeds;
    function dosHeader_defaultNotNull() {
        var pefi = new pe.PEFile();
        if(!pefi.dosHeader) {
            throw pefi.dosHeader;
        }
    }
    test_PEFile.dosHeader_defaultNotNull = dosHeader_defaultNotNull;
    function peHeader_defaultNotNull() {
        var pefi = new pe.PEFile();
        if(!pefi.peHeader) {
            throw pefi.peHeader;
        }
    }
    test_PEFile.peHeader_defaultNotNull = peHeader_defaultNotNull;
    function optionalHeader_defaultNotNull() {
        var pefi = new pe.PEFile();
        if(!pefi.optionalHeader) {
            throw pefi.optionalHeader;
        }
    }
    test_PEFile.optionalHeader_defaultNotNull = optionalHeader_defaultNotNull;
    function sectionHeaders_defaultZeroLength() {
        var pefi = new pe.PEFile();
        if(pefi.sectionHeaders.length !== 0) {
            throw pefi.sectionHeaders.length;
        }
    }
    test_PEFile.sectionHeaders_defaultZeroLength = sectionHeaders_defaultZeroLength;
    function toString_default() {
        var pefi = new pe.PEFile();
        var expectedToString = "dosHeader: " + pefi.dosHeader + " dosStub: null" + " peHeader: [" + pefi.peHeader.machine + "]" + " optionalHeader: [" + pefi.optionalHeader.subsystem + "," + pefi.optionalHeader.imageVersion + "]" + " sectionHeaders: [0]";
        if(pefi.toString() !== expectedToString) {
            throw pefi.toString() + " instead of expected " + expectedToString;
        }
    }
    test_PEFile.toString_default = toString_default;
})(test_PEFile || (test_PEFile = {}));
var test_DosHeader;
(function (test_DosHeader) {
    function constructor_succeeds() {
        var doh = new pe.DosHeader();
    }
    test_DosHeader.constructor_succeeds = constructor_succeeds;
    function mz_defaultMZ() {
        var doh = new pe.DosHeader();
        if(doh.mz !== pe.MZSignature.MZ) {
            throw doh.mz;
        }
    }
    test_DosHeader.mz_defaultMZ = mz_defaultMZ;
    function cblp_default0() {
        var doh = new pe.DosHeader();
        if(doh.cblp !== 0) {
            throw doh.cblp;
        }
    }
    test_DosHeader.cblp_default0 = cblp_default0;
    function cp_default0() {
        var doh = new pe.DosHeader();
        if(doh.cp !== 0) {
            throw doh.cp;
        }
    }
    test_DosHeader.cp_default0 = cp_default0;
    function crlc_default0() {
        var doh = new pe.DosHeader();
        if(doh.crlc !== 0) {
            throw doh.crlc;
        }
    }
    test_DosHeader.crlc_default0 = crlc_default0;
    function cparhdr_default0() {
        var doh = new pe.DosHeader();
        if(doh.cparhdr !== 0) {
            throw doh.cparhdr;
        }
    }
    test_DosHeader.cparhdr_default0 = cparhdr_default0;
    function minalloc_default0() {
        var doh = new pe.DosHeader();
        if(doh.minalloc !== 0) {
            throw doh.minalloc;
        }
    }
    test_DosHeader.minalloc_default0 = minalloc_default0;
    function maxalloc_default0() {
        var doh = new pe.DosHeader();
        if(doh.maxalloc !== 0) {
            throw doh.maxalloc;
        }
    }
    test_DosHeader.maxalloc_default0 = maxalloc_default0;
    function ss_default0() {
        var doh = new pe.DosHeader();
        if(doh.ss !== 0) {
            throw doh.ss;
        }
    }
    test_DosHeader.ss_default0 = ss_default0;
    function sp_default0() {
        var doh = new pe.DosHeader();
        if(doh.sp !== 0) {
            throw doh.sp;
        }
    }
    test_DosHeader.sp_default0 = sp_default0;
    function csum_default0() {
        var doh = new pe.DosHeader();
        if(doh.csum !== 0) {
            throw doh.csum;
        }
    }
    test_DosHeader.csum_default0 = csum_default0;
    function cs_default0() {
        var doh = new pe.DosHeader();
        if(doh.cs !== 0) {
            throw doh.cs;
        }
    }
    test_DosHeader.cs_default0 = cs_default0;
    function lfarlc_default0() {
        var doh = new pe.DosHeader();
        if(doh.lfarlc !== 0) {
            throw doh.lfarlc;
        }
    }
    test_DosHeader.lfarlc_default0 = lfarlc_default0;
    function ovno_default0() {
        var doh = new pe.DosHeader();
        if(doh.ovno !== 0) {
            throw doh.ovno;
        }
    }
    test_DosHeader.ovno_default0 = ovno_default0;
    function res1_default0() {
        var doh = new pe.DosHeader();
        if(doh.res1.hi !== 0 || doh.res1.lo !== 0) {
            throw doh.res1;
        }
    }
    test_DosHeader.res1_default0 = res1_default0;
    function oemid_default0() {
        var doh = new pe.DosHeader();
        if(doh.oemid !== 0) {
            throw doh.oemid;
        }
    }
    test_DosHeader.oemid_default0 = oemid_default0;
    function oeminfo_default0() {
        var doh = new pe.DosHeader();
        if(doh.oeminfo !== 0) {
            throw doh.oeminfo;
        }
    }
    test_DosHeader.oeminfo_default0 = oeminfo_default0;
    function reserved_defaultArray5() {
        var doh = new pe.DosHeader();
        if(doh.reserved.length !== 5 || doh.reserved[0] !== 0 || doh.reserved[1] !== 0 || doh.reserved[2] !== 0 || doh.reserved[3] !== 0 || doh.reserved[4] !== 0) {
            throw doh.reserved;
        }
    }
    test_DosHeader.reserved_defaultArray5 = reserved_defaultArray5;
    function lfanew_default0() {
        var doh = new pe.DosHeader();
        if(doh.lfanew !== 0) {
            throw doh.lfanew;
        }
    }
    test_DosHeader.lfanew_default0 = lfanew_default0;
    function toString_default() {
        var doh = new pe.DosHeader();
        if(doh.toString() !== "[MZ].lfanew=0h") {
            throw doh.toString();
        }
    }
    test_DosHeader.toString_default = toString_default;
    function toString_mz_oxEA() {
        var doh = new pe.DosHeader();
        doh.mz = 234;
        if(doh.toString() !== "[EAh].lfanew=0h") {
            throw doh.toString();
        }
    }
    test_DosHeader.toString_mz_oxEA = toString_mz_oxEA;
    function toString_lfanew_oxFF803() {
        var doh = new pe.DosHeader();
        doh.lfanew = 1046531;
        if(doh.toString() !== "[MZ].lfanew=FF803h") {
            throw doh.toString();
        }
    }
    test_DosHeader.toString_lfanew_oxFF803 = toString_lfanew_oxFF803;
})(test_DosHeader || (test_DosHeader = {}));
var test_PEHeader;
(function (test_PEHeader) {
    function constructor_succeeds() {
        var peh = new pe.PEHeader();
    }
    test_PEHeader.constructor_succeeds = constructor_succeeds;
    function pe_defaultPE() {
        var peh = new pe.PEHeader();
        if(peh.pe !== pe.PESignature.PE) {
            throw peh.pe;
        }
    }
    test_PEHeader.pe_defaultPE = pe_defaultPE;
    function machine_defaultI386() {
        var peh = new pe.PEHeader();
        if(peh.machine !== pe.Machine.I386) {
            throw peh.machine;
        }
    }
    test_PEHeader.machine_defaultI386 = machine_defaultI386;
    function numberOfSections_default0() {
        var peh = new pe.PEHeader();
        if(peh.numberOfSections !== 0) {
            throw peh.numberOfSections;
        }
    }
    test_PEHeader.numberOfSections_default0 = numberOfSections_default0;
    function timestamp_defaultZeroDate() {
        var peh = new pe.PEHeader();
        if(peh.timestamp.getTime() !== new Date(0).getTime()) {
            throw peh.timestamp;
        }
    }
    test_PEHeader.timestamp_defaultZeroDate = timestamp_defaultZeroDate;
    function pointerToSymbolTable_default0() {
        var peh = new pe.PEHeader();
        if(peh.pointerToSymbolTable !== 0) {
            throw peh.pointerToSymbolTable;
        }
    }
    test_PEHeader.pointerToSymbolTable_default0 = pointerToSymbolTable_default0;
    function numberOfSymbols_default0() {
        var peh = new pe.PEHeader();
        if(peh.numberOfSymbols !== 0) {
            throw peh.numberOfSymbols;
        }
    }
    test_PEHeader.numberOfSymbols_default0 = numberOfSymbols_default0;
    function sizeOfOptionalHeader_default0() {
        var peh = new pe.PEHeader();
        if(peh.sizeOfOptionalHeader !== 0) {
            throw peh.sizeOfOptionalHeader;
        }
    }
    test_PEHeader.sizeOfOptionalHeader_default0 = sizeOfOptionalHeader_default0;
    function characteristics_defaultDll() {
        var peh = new pe.PEHeader();
        if(peh.characteristics !== pe.ImageCharacteristics.Dll) {
            throw peh.characteristics;
        }
    }
    test_PEHeader.characteristics_defaultDll = characteristics_defaultDll;
    function toString_default() {
        var peh = new pe.PEHeader();
        if(peh.toString() !== peh.machine + " " + peh.characteristics + " Sections[0]") {
            throw peh.toString();
        }
    }
    test_PEHeader.toString_default = toString_default;
})(test_PEHeader || (test_PEHeader = {}));
var test_OptionalHeader;
(function (test_OptionalHeader) {
    function constructor_succeeds() {
        var oph = new pe.OptionalHeader();
    }
    test_OptionalHeader.constructor_succeeds = constructor_succeeds;
    function peMagic_defaultNT32() {
        var oph = new pe.OptionalHeader();
        if(oph.peMagic !== pe.PEMagic.NT32) {
            throw oph.peMagic;
        }
    }
    test_OptionalHeader.peMagic_defaultNT32 = peMagic_defaultNT32;
    function linkerVersion_defaultEmptyString() {
        var oph = new pe.OptionalHeader();
        if(oph.linkerVersion !== "") {
            throw oph.linkerVersion;
        }
    }
    test_OptionalHeader.linkerVersion_defaultEmptyString = linkerVersion_defaultEmptyString;
    function sizeOfCode_default0() {
        var oph = new pe.OptionalHeader();
        if(oph.sizeOfCode !== 0) {
            throw oph.sizeOfCode;
        }
    }
    test_OptionalHeader.sizeOfCode_default0 = sizeOfCode_default0;
    function sizeOfInitializedData_default0() {
        var oph = new pe.OptionalHeader();
        if(oph.sizeOfInitializedData !== 0) {
            throw oph.sizeOfInitializedData;
        }
    }
    test_OptionalHeader.sizeOfInitializedData_default0 = sizeOfInitializedData_default0;
    function sizeOfUninitializedData_default0() {
        var oph = new pe.OptionalHeader();
        if(oph.sizeOfUninitializedData !== 0) {
            throw oph.sizeOfUninitializedData;
        }
    }
    test_OptionalHeader.sizeOfUninitializedData_default0 = sizeOfUninitializedData_default0;
    function addressOfEntryPoint_default0() {
        var oph = new pe.OptionalHeader();
        if(oph.addressOfEntryPoint !== 0) {
            throw oph.addressOfEntryPoint;
        }
    }
    test_OptionalHeader.addressOfEntryPoint_default0 = addressOfEntryPoint_default0;
    function baseOfCode_default0() {
        var oph = new pe.OptionalHeader();
        if(oph.baseOfCode !== 0) {
            throw oph.baseOfCode;
        }
    }
    test_OptionalHeader.baseOfCode_default0 = baseOfCode_default0;
    function baseOfData_default0() {
        var oph = new pe.OptionalHeader();
        if(oph.baseOfData !== 0) {
            throw oph.baseOfData;
        }
    }
    test_OptionalHeader.baseOfData_default0 = baseOfData_default0;
    function imageBase_default0() {
        var oph = new pe.OptionalHeader();
        if(oph.imageBase !== 0) {
            throw oph.imageBase;
        }
    }
    test_OptionalHeader.imageBase_default0 = imageBase_default0;
    function sectionAlignment_default0() {
        var oph = new pe.OptionalHeader();
        if(oph.sectionAlignment !== 0) {
            throw oph.sectionAlignment;
        }
    }
    test_OptionalHeader.sectionAlignment_default0 = sectionAlignment_default0;
    function fileAlignment_default0() {
        var oph = new pe.OptionalHeader();
        if(oph.fileAlignment !== 0) {
            throw oph.fileAlignment;
        }
    }
    test_OptionalHeader.fileAlignment_default0 = fileAlignment_default0;
    function operatingSystemVersion_defaultEmptyString() {
        var oph = new pe.OptionalHeader();
        if(oph.operatingSystemVersion !== "") {
            throw oph.operatingSystemVersion;
        }
    }
    test_OptionalHeader.operatingSystemVersion_defaultEmptyString = operatingSystemVersion_defaultEmptyString;
    function imageVersion_defaultEmptyString() {
        var oph = new pe.OptionalHeader();
        if(oph.imageVersion !== "") {
            throw oph.imageVersion;
        }
    }
    test_OptionalHeader.imageVersion_defaultEmptyString = imageVersion_defaultEmptyString;
    function subsystemVersion_defaultEmptyString() {
        var oph = new pe.OptionalHeader();
        if(oph.subsystemVersion !== "") {
            throw oph.subsystemVersion;
        }
    }
    test_OptionalHeader.subsystemVersion_defaultEmptyString = subsystemVersion_defaultEmptyString;
    function win32VersionValue_default0() {
        var oph = new pe.OptionalHeader();
        if(oph.win32VersionValue !== 0) {
            throw oph.win32VersionValue;
        }
    }
    test_OptionalHeader.win32VersionValue_default0 = win32VersionValue_default0;
    function sizeOfImage_default0() {
        var oph = new pe.OptionalHeader();
        if(oph.sizeOfImage !== 0) {
            throw oph.sizeOfImage;
        }
    }
    test_OptionalHeader.sizeOfImage_default0 = sizeOfImage_default0;
    function sizeOfHeaders_default0() {
        var oph = new pe.OptionalHeader();
        if(oph.sizeOfHeaders !== 0) {
            throw oph.sizeOfHeaders;
        }
    }
    test_OptionalHeader.sizeOfHeaders_default0 = sizeOfHeaders_default0;
    function checkSum_default0() {
        var oph = new pe.OptionalHeader();
        if(oph.checkSum !== 0) {
            throw oph.checkSum;
        }
    }
    test_OptionalHeader.checkSum_default0 = checkSum_default0;
    function subsystem_defaultWindowsCUI() {
        var oph = new pe.OptionalHeader();
        if(oph.subsystem !== pe.Subsystem.WindowsCUI) {
            throw oph.subsystem;
        }
    }
    test_OptionalHeader.subsystem_defaultWindowsCUI = subsystem_defaultWindowsCUI;
    function dllCharacteristics_defaultNxCompatible() {
        var oph = new pe.OptionalHeader();
        if(oph.dllCharacteristics !== pe.DllCharacteristics.NxCompatible) {
            throw oph.dllCharacteristics;
        }
    }
    test_OptionalHeader.dllCharacteristics_defaultNxCompatible = dllCharacteristics_defaultNxCompatible;
    function sizeOfStackReserve_default0() {
        var oph = new pe.OptionalHeader();
        if(oph.sizeOfStackReserve !== 0) {
            throw oph.sizeOfStackReserve;
        }
    }
    test_OptionalHeader.sizeOfStackReserve_default0 = sizeOfStackReserve_default0;
    function sizeOfStackCommit_default0() {
        var oph = new pe.OptionalHeader();
        if(oph.sizeOfStackCommit !== 0) {
            throw oph.sizeOfStackCommit;
        }
    }
    test_OptionalHeader.sizeOfStackCommit_default0 = sizeOfStackCommit_default0;
    function sizeOfHeapReserve_default0() {
        var oph = new pe.OptionalHeader();
        if(oph.sizeOfHeapReserve !== 0) {
            throw oph.sizeOfHeapReserve;
        }
    }
    test_OptionalHeader.sizeOfHeapReserve_default0 = sizeOfHeapReserve_default0;
    function sizeOfHeapCommit_default0() {
        var oph = new pe.OptionalHeader();
        if(oph.sizeOfHeapCommit !== 0) {
            throw oph.sizeOfHeapCommit;
        }
    }
    test_OptionalHeader.sizeOfHeapCommit_default0 = sizeOfHeapCommit_default0;
    function loaderFlags_default0() {
        var oph = new pe.OptionalHeader();
        if(oph.loaderFlags !== 0) {
            throw oph.loaderFlags;
        }
    }
    test_OptionalHeader.loaderFlags_default0 = loaderFlags_default0;
    function numberOfRvaAndSizes_default0() {
        var oph = new pe.OptionalHeader();
        if(oph.numberOfRvaAndSizes !== 0) {
            throw oph.numberOfRvaAndSizes;
        }
    }
    test_OptionalHeader.numberOfRvaAndSizes_default0 = numberOfRvaAndSizes_default0;
    function dataDirectories_defaultZeroLength() {
        var oph = new pe.OptionalHeader();
        if(oph.dataDirectories.length !== 0) {
            throw oph.dataDirectories.length;
        }
    }
    test_OptionalHeader.dataDirectories_defaultZeroLength = dataDirectories_defaultZeroLength;
    function toString_default() {
        var oph = new pe.OptionalHeader();
        var expectedString = oph.peMagic + " " + oph.subsystem + " " + oph.dllCharacteristics + " dataDirectories[]";
        if(oph.toString() !== expectedString) {
            throw oph.toString() + " expected " + expectedString;
        }
    }
    test_OptionalHeader.toString_default = toString_default;
})(test_OptionalHeader || (test_OptionalHeader = {}));
var test_SectionHeader;
(function (test_SectionHeader) {
    function constructor_succeeds() {
        var seh = new pe.SectionHeader();
    }
    test_SectionHeader.constructor_succeeds = constructor_succeeds;
    function name_defaultEmptyString() {
        var seh = new pe.SectionHeader();
        if(seh.name !== "") {
            throw seh.name;
        }
    }
    test_SectionHeader.name_defaultEmptyString = name_defaultEmptyString;
    function virtualRange_default() {
        var seh = new pe.SectionHeader();
        if(seh.virtualRange.address !== 0 || seh.virtualRange.size !== 0) {
            throw seh.virtualRange;
        }
    }
    test_SectionHeader.virtualRange_default = virtualRange_default;
    function pointerToRelocations_default0() {
        var seh = new pe.SectionHeader();
        if(seh.pointerToRelocations !== 0) {
            throw seh.pointerToRelocations;
        }
    }
    test_SectionHeader.pointerToRelocations_default0 = pointerToRelocations_default0;
})(test_SectionHeader || (test_SectionHeader = {}));
var test_DataDirectory;
(function (test_DataDirectory) {
    function constructor_succeeds() {
        var dd = new pe.DataDirectory(0, 0);
    }
    test_DataDirectory.constructor_succeeds = constructor_succeeds;
    function constructor_assigns_address_654201() {
        var dd = new pe.DataDirectory(654201, 0);
        if(dd.address !== 654201) {
            throw dd.address;
        }
    }
    test_DataDirectory.constructor_assigns_address_654201 = constructor_assigns_address_654201;
    function constructor_assigns_size_900114() {
        var dd = new pe.DataDirectory(0, 900114);
        if(dd.size !== 900114) {
            throw dd.size;
        }
    }
    test_DataDirectory.constructor_assigns_size_900114 = constructor_assigns_size_900114;
    function toString_0xCEF_0x36A() {
        var dd = new pe.DataDirectory(3311, 874);
        if(dd.toString() !== "CEF:36Ah") {
            throw dd.toString();
        }
    }
    test_DataDirectory.toString_0xCEF_0x36A = toString_0xCEF_0x36A;
})(test_DataDirectory || (test_DataDirectory = {}));
var TestRunner;
(function (TestRunner) {
    function collectTests(moduleName, moduleObj) {
        if(!moduleObj) {
            moduleObj = moduleName;
            moduleName = "";
        }
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
        collectTestsCore(moduleName ? moduleName + "." : "", moduleObj, false);
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
            logPrint(typeof (syncError) === "object" ? (syncError.stack ? syncError.stack : syncError.message) : syncError === null ? "null" : (syncError + ""));
            test.success = false;
            onfinish();
            return;
        }
        var openBracketPos = test.testMethod.toString().indexOf("(");
        if(openBracketPos > 0 && test.testMethod.toString().substring(openBracketPos + 1, openBracketPos + 2) === ")") {
            if(test.success === false) {
                return;
            }
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
    function runTests(moduleName, moduleObj, onfinished) {
        if(typeof (moduleName) !== "string") {
            onfinished = moduleObj;
            moduleObj = moduleName;
            moduleName = "";
        }
        var tests = collectTests(moduleName, moduleObj);
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
            var failedTests = [];
            for(var i = 0; i < tests.length; i++) {
                if(tests[i].success === false) {
                    failedTests.push(tests[i]);
                }
            }
            if(failedTests.length > 0) {
                sysLog(failedTests.length + " tests failed out of " + tests.length + ":");
                for(var i = 0; i < failedTests.length; i++) {
                    sysLog("  " + failedTests[i].name);
                }
                sysLog("All results:");
            } else {
                sysLog("All " + tests.length + " tests succeeded:");
            }
            for(var i = 0; i < tests.length; i++) {
                sysLog(tests[i].name + ": " + (tests[i].executionTimeMsec / 1000) + "s " + (tests[i].success ? "OK" : "******FAIL******") + " " + tests[i].logText);
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
TestRunner.runTests({
    test_PEFile: test_PEFile,
    test_DosHeader: test_DosHeader,
    test_PEHeader: test_PEHeader,
    test_OptionalHeader: test_OptionalHeader,
    test_SectionHeader: test_SectionHeader,
    test_DataDirectory: test_DataDirectory
});
//@ sourceMappingURL=tests.js.map
