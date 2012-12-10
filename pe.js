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
var pe;
(function (pe) {
    (function (io) {
        var BinaryReader = (function () {
            function BinaryReader() {
            }
            BinaryReader.prototype.readByte = function () {
                throw new Error("Not implemented.");
            };
            BinaryReader.prototype.readAtOffset = function (absoluteByteOffset) {
                throw new Error("Not implemented.");
            };
            BinaryReader.prototype.readBytes = function (count) {
                throw new Error("Not implemented.");
            };
            BinaryReader.prototype.skipBytes = function (count) {
                throw new Error("Not implemented.");
            };
            BinaryReader.prototype.clone = function () {
                throw new Error("Not implemented.");
            };
            BinaryReader.prototype.readShort = function () {
                var lo = this.readByte();
                var hi = this.readByte();
                return lo + (hi << 8);
            };
            BinaryReader.prototype.readInt = function () {
                var lo = this.readShort();
                var hi = this.readShort();
                return lo + (hi * 65536);
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
                for(var i = 0; i < length; i++) {
                    var charCode = this.readByte();
                    if(charCode == 0) {
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
    })(pe.io || (pe.io = {}));
    var io = pe.io;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (headers) {
        var DosHeader = (function () {
            function DosHeader() {
                this.mz = MZSignature.MZ;
                this.cblp = 144;
                this.cp = 3;
                this.crlc = 0;
                this.cparhdr = 4;
                this.minalloc = 0;
                this.maxalloc = 65535;
                this.ss = 0;
                this.sp = 184;
                this.csum = 0;
                this.ip = 0;
                this.cs = 0;
                this.lfarlc = 64;
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
        headers.DosHeader = DosHeader;        
        (function (MZSignature) {
            MZSignature._map = [];
            MZSignature.MZ = "M".charCodeAt(0) + ("Z".charCodeAt(0) << 8);
        })(headers.MZSignature || (headers.MZSignature = {}));
        var MZSignature = headers.MZSignature;
    })(pe.headers || (pe.headers = {}));
    var headers = pe.headers;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (headers) {
        var PEHeader = (function () {
            function PEHeader() {
                this.pe = PESignature.PE;
                this.machine = Machine.I386;
                this.numberOfSections = 0;
                this.timestamp = new Date(0);
                this.pointerToSymbolTable = 0;
                this.numberOfSymbols = 0;
                this.sizeOfOptionalHeader = 0;
                this.characteristics = ImageCharacteristics.Dll | ImageCharacteristics.Bit32Machine;
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
        headers.PEHeader = PEHeader;        
        (function (PESignature) {
            PESignature._map = [];
            PESignature.PE = "P".charCodeAt(0) + ("E".charCodeAt(0) << 8);
        })(headers.PESignature || (headers.PESignature = {}));
        var PESignature = headers.PESignature;
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
        })(headers.Machine || (headers.Machine = {}));
        var Machine = headers.Machine;
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
        })(headers.ImageCharacteristics || (headers.ImageCharacteristics = {}));
        var ImageCharacteristics = headers.ImageCharacteristics;
    })(pe.headers || (pe.headers = {}));
    var headers = pe.headers;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (headers) {
        var AddressRange = (function () {
            function AddressRange(address, size) {
                this.address = address;
                this.size = size;
            }
            AddressRange.prototype.contains = function (address) {
                return address >= this.address && address < this.address + this.size;
            };
            AddressRange.prototype.toString = function () {
                return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "h";
            };
            return AddressRange;
        })();
        headers.AddressRange = AddressRange;        
    })(pe.headers || (pe.headers = {}));
    var headers = pe.headers;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (headers) {
        var OptionalHeader = (function () {
            function OptionalHeader() {
                this.peMagic = PEMagic.NT32;
                this.linkerVersion = "";
                this.sizeOfCode = 0;
                this.sizeOfInitializedData = 0;
                this.sizeOfUninitializedData = 0;
                this.addressOfEntryPoint = 0;
                this.baseOfCode = 8192;
                this.baseOfData = 16384;
                this.imageBase = 16384;
                this.sectionAlignment = 8192;
                this.fileAlignment = 512;
                this.operatingSystemVersion = "";
                this.imageVersion = "";
                this.subsystemVersion = "";
                this.win32VersionValue = 0;
                this.sizeOfImage = 0;
                this.sizeOfHeaders = 0;
                this.checkSum = 0;
                this.subsystem = Subsystem.WindowsCUI;
                this.dllCharacteristics = DllCharacteristics.NxCompatible;
                this.sizeOfStackReserve = 1048576;
                this.sizeOfStackCommit = 4096;
                this.sizeOfHeapReserve = 1048576;
                this.sizeOfHeapCommit = 4096;
                this.loaderFlags = 0;
                this.numberOfRvaAndSizes = 16;
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
                        this.dataDirectories[i] = new headers.AddressRange(reader.readInt(), reader.readInt());
                    }
                }
            };
            return OptionalHeader;
        })();
        headers.OptionalHeader = OptionalHeader;        
        (function (PEMagic) {
            PEMagic._map = [];
            PEMagic.NT32 = 267;
            PEMagic.NT64 = 523;
            PEMagic.ROM = 263;
        })(headers.PEMagic || (headers.PEMagic = {}));
        var PEMagic = headers.PEMagic;
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
        })(headers.Subsystem || (headers.Subsystem = {}));
        var Subsystem = headers.Subsystem;
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
        })(headers.DllCharacteristics || (headers.DllCharacteristics = {}));
        var DllCharacteristics = headers.DllCharacteristics;
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
        })(headers.DataDirectoryKind || (headers.DataDirectoryKind = {}));
        var DataDirectoryKind = headers.DataDirectoryKind;
    })(pe.headers || (pe.headers = {}));
    var headers = pe.headers;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (headers) {
        var SectionHeader = (function () {
            function SectionHeader() {
                this.name = "";
                this.virtualRange = new headers.AddressRange(0, 0);
                this.physicalRange = new headers.AddressRange(0, 0);
                this.pointerToRelocations = 0;
                this.pointerToLinenumbers = 0;
                this.numberOfRelocations = 0;
                this.numberOfLinenumbers = 0;
                this.characteristics = SectionCharacteristics.ContainsCode;
            }
            SectionHeader.prototype.toString = function () {
                var result = this.name + " [" + this.physicalRange + "]=>[" + this.virtualRange + "]";
                return result;
            };
            SectionHeader.prototype.read = function (reader) {
                this.name = reader.readZeroFilledAscii(8);
                var virtualSize = reader.readInt();
                var virtualAddress = reader.readInt();
                this.virtualRange = new headers.AddressRange(virtualAddress, virtualSize);
                var sizeOfRawData = reader.readInt();
                var pointerToRawData = reader.readInt();
                this.physicalRange = new headers.AddressRange(pointerToRawData, sizeOfRawData);
                this.pointerToRelocations = reader.readInt();
                this.pointerToLinenumbers = reader.readInt();
                this.numberOfRelocations = reader.readShort();
                this.numberOfLinenumbers = reader.readShort();
                this.characteristics = reader.readInt();
            };
            return SectionHeader;
        })();
        headers.SectionHeader = SectionHeader;        
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
        })(headers.SectionCharacteristics || (headers.SectionCharacteristics = {}));
        var SectionCharacteristics = headers.SectionCharacteristics;
    })(pe.headers || (pe.headers = {}));
    var headers = pe.headers;
})(pe || (pe = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var pe;
(function (pe) {
    (function (io) {
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
                var result = this.createUint32Array(count);
                for(var i = 0; i < count; i++) {
                    result[i] = this.dataView.getUint8(this.byteOffset + i);
                }
                this.byteOffset += count;
                return result;
            };
            DataViewBinaryReader.prototype.skipBytes = function (count) {
                this.byteOffset += count;
            };
            DataViewBinaryReader.prototype.clone = function () {
                return new DataViewBinaryReader(this.dataView, this.byteOffset);
            };
            DataViewBinaryReader.prototype.readAtOffset = function (absoluteByteOffset) {
                return new DataViewBinaryReader(this.dataView, absoluteByteOffset);
            };
            DataViewBinaryReader.prototype.createUint32Array = function (count) {
                return new Uint32Array(count);
            };
            return DataViewBinaryReader;
        })(io.BinaryReader);
        io.DataViewBinaryReader = DataViewBinaryReader;        
    })(pe.io || (pe.io = {}));
    var io = pe.io;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (io) {
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
            BufferBinaryReader.prototype.clone = function () {
                return new BufferBinaryReader(this.arrayOfBytes, this.byteOffset);
            };
            BufferBinaryReader.prototype.readAtOffset = function (absoluteByteOffset) {
                return new BufferBinaryReader(this.arrayOfBytes, absoluteByteOffset);
            };
            return BufferBinaryReader;
        })(io.BinaryReader);
        io.BufferBinaryReader = BufferBinaryReader;        
    })(pe.io || (pe.io = {}));
    var io = pe.io;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (io) {
        var RvaBinaryReader = (function (_super) {
            __extends(RvaBinaryReader, _super);
            function RvaBinaryReader(baseReader, virtualByteOffset, sections) {
                if (typeof sections === "undefined") { sections = []; }
                        _super.call(this);
                this.virtualByteOffset = virtualByteOffset;
                this.sections = sections;
                for(var i = 0; i < this.sections.length; i++) {
                    if(this.sections[i].virtualRange.contains(virtualByteOffset)) {
                        var newByteOffset = this.sections[i].physicalRange.address + (virtualByteOffset - this.sections[i].virtualRange.address);
                        this.baseReader = baseReader.readAtOffset(newByteOffset);
                        this.virtualByteOffset = virtualByteOffset;
                        return;
                    }
                }
                throw new Error("Virtual address " + virtualByteOffset.toString(16).toUpperCase() + "h does not fall into any of " + this.sections.length + " sections (" + this.sections.join(" ") + ").");
            }
            RvaBinaryReader.prototype.readAtOffset = function (offset) {
                return new RvaBinaryReader(this.baseReader, offset, this.sections);
            };
            RvaBinaryReader.prototype.readByte = function () {
                this.beforeRead(1);
                return this.baseReader.readByte();
            };
            RvaBinaryReader.prototype.readShort = function () {
                this.beforeRead(2);
                return this.baseReader.readShort();
            };
            RvaBinaryReader.prototype.readInt = function () {
                this.beforeRead(4);
                return this.baseReader.readInt();
            };
            RvaBinaryReader.prototype.readLong = function () {
                this.beforeRead(8);
                return this.baseReader.readLong();
            };
            RvaBinaryReader.prototype.readBytes = function (count) {
                this.beforeRead(count);
                return this.baseReader.readBytes(count);
            };
            RvaBinaryReader.prototype.skipBytes = function (count) {
                this.beforeRead(count);
                return this.baseReader.skipBytes(count);
            };
            RvaBinaryReader.prototype.clone = function () {
                return new RvaBinaryReader(this.baseReader, this.virtualByteOffset, this.sections);
            };
            RvaBinaryReader.prototype.beforeRead = function (size) {
                this.virtualByteOffset += size;
            };
            return RvaBinaryReader;
        })(io.BinaryReader);
        io.RvaBinaryReader = RvaBinaryReader;        
    })(pe.io || (pe.io = {}));
    var io = pe.io;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (io) {
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
                    result = new io.DataViewBinaryReader(resultDataView);
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
                        result = new io.DataViewBinaryReader(resultDataView);
                    } else {
                        var responseBody = new VBArray(request.responseBody).toArray();
                        var result = new io.BufferBinaryReader(responseBody);
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
    })(pe.io || (pe.io = {}));
    var io = pe.io;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (headers) {
        var PEFile = (function () {
            function PEFile() {
                this.dosHeader = new headers.DosHeader();
                this.peHeader = new headers.PEHeader();
                this.optionalHeader = new headers.OptionalHeader();
                this.sectionHeaders = [];
            }
            PEFile.prototype.toString = function () {
                var result = "dosHeader: " + (this.dosHeader ? this.dosHeader + "" : "null") + " " + "dosStub: " + (this.dosStub ? "[" + this.dosStub.length + "]" : "null") + " " + "peHeader: " + (this.peHeader ? "[" + this.peHeader.machine + "]" : "null") + " " + "optionalHeader: " + (this.optionalHeader ? "[" + this.optionalHeader.subsystem + "," + this.optionalHeader.imageVersion + "]" : "null") + " " + "sectionHeaders: " + (this.sectionHeaders ? "[" + this.sectionHeaders.length + "]" : "null");
                return result;
            };
            PEFile.prototype.read = function (reader) {
                var dosHeaderSize = 64;
                if(!this.dosHeader) {
                    this.dosHeader = new headers.DosHeader();
                }
                this.dosHeader.read(reader);
                if(this.dosHeader.lfanew > dosHeaderSize) {
                    this.dosStub = reader.readBytes(this.dosHeader.lfanew - dosHeaderSize);
                } else {
                    this.dosStub = null;
                }
                if(!this.peHeader) {
                    this.peHeader = new headers.PEHeader();
                }
                this.peHeader.read(reader);
                if(!this.optionalHeader) {
                    this.optionalHeader = new headers.OptionalHeader();
                }
                this.optionalHeader.read(reader);
                if(this.peHeader.numberOfSections > 0) {
                    if(!this.sectionHeaders || this.sectionHeaders.length != this.peHeader.numberOfSections) {
                        this.sectionHeaders = Array(this.peHeader.numberOfSections);
                    }
                    for(var i = 0; i < this.sectionHeaders.length; i++) {
                        if(!this.sectionHeaders[i]) {
                            this.sectionHeaders[i] = new headers.SectionHeader();
                        }
                        this.sectionHeaders[i].read(reader);
                    }
                }
            };
            return PEFile;
        })();
        headers.PEFile = PEFile;        
    })(pe.headers || (pe.headers = {}));
    var headers = pe.headers;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (unmanaged) {
        var DllImport = (function () {
            function DllImport() {
                this.name = "";
                this.ordinal = 0;
                this.dllName = "";
            }
            DllImport.read = function read(reader, result) {
                if(!result) {
                    result = [];
                }
                var readLength = 0;
                while(true) {
                    var originalFirstThunk = reader.readInt();
                    var timeDateStamp = reader.readInt();
                    var forwarderChain = reader.readInt();
                    var nameRva = reader.readInt();
                    var firstThunk = reader.readInt();
                    var thunkAddressPosition = originalFirstThunk == 0 ? firstThunk : originalFirstThunk;
                    if(thunkAddressPosition == 0) {
                        break;
                    }
                    var thunkReader = reader.readAtOffset(thunkAddressPosition);
                    var libraryName = nameRva == 0 ? null : reader.readAtOffset(nameRva).readAsciiZ();
                    while(true) {
                        var newEntry = result[readLength];
                        if(!newEntry) {
                            newEntry = new DllImport();
                            result[readLength] = newEntry;
                        }
                        if(!newEntry.readEntry(thunkReader)) {
                            break;
                        }
                        newEntry.dllName = libraryName;
                        readLength++;
                    }
                }
                result.length = readLength;
                return result;
            }
            DllImport.prototype.readEntry = function (thunkReader) {
                var importPosition = thunkReader.readInt();
                if(importPosition == 0) {
                    return false;
                }
                if(importPosition & (1 << 31)) {
                    this.ordinal = importPosition & (4294967295 / 2);
                    this.name = null;
                } else {
                    var fnReader = thunkReader.readAtOffset(importPosition);
                    var hint = fnReader.readShort();
                    var fname = fnReader.readAsciiZ();
                    this.ordinal = hint;
                    this.name = fname;
                }
                return true;
            };
            return DllImport;
        })();
        unmanaged.DllImport = DllImport;        
    })(pe.unmanaged || (pe.unmanaged = {}));
    var unmanaged = pe.unmanaged;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (unmanaged) {
        var DllExport = (function () {
            function DllExport() { }
            DllExport.readExports = function readExports(reader, range) {
                var result = [];
                result.flags = reader.readInt();
                result.timestamp = reader.readTimestamp();
                var majorVersion = reader.readShort();
                var minorVersion = reader.readShort();
                result.version = majorVersion + "." + minorVersion;
                var nameRva = reader.readInt();
                result.ordinalBase = reader.readInt();
                var addressTableEntries = reader.readInt();
                var numberOfNamePointers = reader.readInt();
                var exportAddressTableRva = reader.readInt();
                var namePointerRva = reader.readInt();
                var ordinalTableRva = reader.readInt();
                if(nameRva == 0) {
                    result.dllName = null;
                } else {
                    result.dllName = reader.readAtOffset(nameRva).readAsciiZ();
                }
                result.length = addressTableEntries;
                for(var i = 0; i < addressTableEntries; i++) {
                    var exportEntry = new DllExport();
                    exportEntry.readExportEntry(reader, range);
                    exportEntry.ordinal = i + this.ordinalBase;
                    result[i] = exportEntry;
                }
                if(numberOfNamePointers != 0 && namePointerRva != 0 && ordinalTableRva != 0) {
                    for(var i = 0; i < numberOfNamePointers; i++) {
                        var ordinalReader = reader.readAtOffset(ordinalTableRva + 2 * i);
                        var ordinal = ordinalReader.readShort();
                        var fnRvaReader = reader.readAtOffset(namePointerRva + 4 * i);
                        var functionNameRva = fnRvaReader.readInt();
                        var functionName;
                        if(functionNameRva == 0) {
                            functionName = null;
                        } else {
                            var fnReader = reader.readAtOffset(functionNameRva);
                            functionName = fnReader.readAsciiZ();
                        }
                        this.exports[ordinal].name = functionName;
                    }
                }
                return result;
            }
            DllExport.prototype.readExportEntry = function (reader, range) {
                var exportOrForwarderRva = reader.readInt();
                if(range.contains(exportOrForwarderRva)) {
                    this.exportRva = 0;
                    var forwarderRva = reader.readInt();
                    if(forwarderRva == 0) {
                        this.forwarder = null;
                    } else {
                        this.forwarder = reader.readAtOffset(forwarderRva).readAsciiZ();
                    }
                } else {
                    this.exportRva = reader.readInt();
                    this.forwarder = null;
                }
                this.name = null;
            };
            return DllExport;
        })();
        unmanaged.DllExport = DllExport;        
    })(pe.unmanaged || (pe.unmanaged = {}));
    var unmanaged = pe.unmanaged;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (unmanaged) {
        var ResourceDirectoryEntry = (function () {
            function ResourceDirectoryEntry() {
                this.name = "";
                this.integerId = 0;
                this.directory = new unmanaged.ResourceDirectory();
            }
            return ResourceDirectoryEntry;
        })();
        unmanaged.ResourceDirectoryEntry = ResourceDirectoryEntry;        
    })(pe.unmanaged || (pe.unmanaged = {}));
    var unmanaged = pe.unmanaged;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (unmanaged) {
        var ResourceDataEntry = (function () {
            function ResourceDataEntry() {
                this.name = "";
                this.integerId = 0;
                this.dataRva = 0;
                this.size = 0;
                this.codepage = 0;
                this.reserved = 0;
            }
            return ResourceDataEntry;
        })();
        unmanaged.ResourceDataEntry = ResourceDataEntry;        
    })(pe.unmanaged || (pe.unmanaged = {}));
    var unmanaged = pe.unmanaged;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (unmanaged) {
        var ResourceDirectory = (function () {
            function ResourceDirectory() {
                this.characteristics = 0;
                this.timestamp = null;
                this.version = "";
                this.subdirectories = [];
                this.dataEntries = [];
            }
            ResourceDirectory.prototype.read = function (reader) {
                this.readCore(reader, reader.clone());
            };
            ResourceDirectory.prototype.readCore = function (reader, baseReader) {
                this.characteristics = reader.readInt();
                var timestampNum = reader.readInt();
                this.version = reader.readShort() + "." + reader.readShort();
                var nameEntryCount = reader.readShort();
                var idEntryCount = reader.readShort();
                var dataEntryCount = 0;
                var directoryEntryCount = 0;
                for(var i = 0; i < nameEntryCount + idEntryCount; i++) {
                    var idOrNameRva = reader.readInt();
                    var contentRva = reader.readInt();
                    var name;
                    var id;
                    var highBit = 1 << 31;
                    if((idOrNameRva & highBit) == 0) {
                        id = idOrNameRva;
                        name = null;
                    } else {
                        id = 0;
                        var nameReader = baseReader.clone();
                        nameReader.skipBytes(idOrNameRva - highBit);
                        name = this.readName(nameReader);
                    }
                    if((contentRva & highBit) == 0) {
                        var dataEntry = this.dataEntries[dataEntryCount];
                        if(!dataEntry) {
                            this.dataEntries[dataEntryCount] = dataEntry = new unmanaged.ResourceDataEntry();
                        }
                        dataEntry.name = name;
                        dataEntry.integerId = id;
                        var dataEntryReader = baseReader.clone();
                        dataEntryReader.skipBytes(contentRva);
                        dataEntry.dataRva = dataEntryReader.readInt();
                        dataEntry.size = dataEntryReader.readInt();
                        dataEntry.codepage = dataEntryReader.readInt();
                        dataEntry.reserved = dataEntryReader.readInt();
                        dataEntryCount++;
                    } else {
                        contentRva = contentRva - highBit;
                        var dataEntryReader = baseReader.clone();
                        dataEntryReader.skipBytes(contentRva);
                        var directoryEntry = this.subdirectories[directoryEntryCount];
                        if(!directoryEntry) {
                            this.subdirectories[directoryEntryCount] = directoryEntry = new unmanaged.ResourceDirectoryEntry();
                        }
                        directoryEntry.name = name;
                        directoryEntry.integerId = id;
                        directoryEntry.directory = new ResourceDirectory();
                        directoryEntry.directory.readCore(reader, baseReader);
                        directoryEntryCount++;
                    }
                }
                this.dataEntries.length = dataEntryCount;
                this.subdirectories.length = directoryEntryCount;
            };
            ResourceDirectory.prototype.readName = function (reader) {
                var length = reader.readShort();
                var result = "";
                for(var i = 0; i < length; i++) {
                    result += String.fromCharCode(reader.readShort());
                }
                return result;
            };
            return ResourceDirectory;
        })();
        unmanaged.ResourceDirectory = ResourceDirectory;        
    })(pe.unmanaged || (pe.unmanaged = {}));
    var unmanaged = pe.unmanaged;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            (function (ClrImageFlags) {
                ClrImageFlags._map = [];
                ClrImageFlags.ILOnly = 1;
                ClrImageFlags._32BitRequired = 2;
                ClrImageFlags.ILLibrary = 4;
                ClrImageFlags.StrongNameSigned = 8;
                ClrImageFlags.NativeEntryPoint = 16;
                ClrImageFlags.TrackDebugData = 65536;
                ClrImageFlags.IsIbcoptimized = 131072;
            })(metadata.ClrImageFlags || (metadata.ClrImageFlags = {}));
            var ClrImageFlags = metadata.ClrImageFlags;
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var ClrDirectory = (function () {
                function ClrDirectory() {
                    this.cb = 0;
                    this.runtimeVersion = "";
                    this.imageFlags = 0;
                    this.metadataDir = null;
                    this.entryPointToken = 0;
                    this.resourcesDir = null;
                    this.strongNameSignatureDir = null;
                    this.codeManagerTableDir = null;
                    this.vtableFixupsDir = null;
                    this.exportAddressTableJumpsDir = null;
                    this.managedNativeHeaderDir = null;
                }
                ClrDirectory.clrHeaderSize = 72;
                ClrDirectory.prototype.read = function (readerAtClrDataDirectory) {
                    var clrDirReader = readerAtClrDataDirectory;
                    this.cb = clrDirReader.readInt();
                    if(this.cb < ClrDirectory.clrHeaderSize) {
                        throw new Error("Unexpectedly short CLR header structure " + this.cb + " reported by Cb field " + "(expected at least " + ClrDirectory.clrHeaderSize + ").");
                    }
                    this.runtimeVersion = clrDirReader.readShort() + "." + clrDirReader.readShort();
                    this.metadataDir = new pe.headers.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.imageFlags = clrDirReader.readInt();
                    this.entryPointToken = clrDirReader.readInt();
                    this.resourcesDir = new pe.headers.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.strongNameSignatureDir = new pe.headers.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.codeManagerTableDir = new pe.headers.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.vtableFixupsDir = new pe.headers.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.exportAddressTableJumpsDir = new pe.headers.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.managedNativeHeaderDir = new pe.headers.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                };
                return ClrDirectory;
            })();
            metadata.ClrDirectory = ClrDirectory;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            (function (ClrMetadataSignature) {
                ClrMetadataSignature._map = [];
                ClrMetadataSignature.Signature = 1112167234;
            })(metadata.ClrMetadataSignature || (metadata.ClrMetadataSignature = {}));
            var ClrMetadataSignature = metadata.ClrMetadataSignature;
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var ClrMetadata = (function () {
                function ClrMetadata() {
                    this.mdSignature = metadata.ClrMetadataSignature.Signature;
                    this.metadataVersion = "";
                    this.runtimeVersion = "";
                    this.mdReserved = 0;
                    this.mdFlags = 0;
                    this.streamCount = 0;
                }
                ClrMetadata.prototype.read = function (clrDirReader) {
                    this.mdSignature = clrDirReader.readInt();
                    if(this.mdSignature != metadata.ClrMetadataSignature.Signature) {
                        throw new Error("Invalid CLR metadata signature field " + (this.mdSignature).toString(16) + "h (expected " + (metadata.ClrMetadataSignature.Signature).toString(16).toUpperCase() + "h).");
                    }
                    this.metadataVersion = clrDirReader.readShort() + "." + clrDirReader.readShort();
                    this.mdReserved = clrDirReader.readInt();
                    var metadataStringVersionLength = clrDirReader.readInt();
                    this.runtimeVersion = clrDirReader.readZeroFilledAscii(metadataStringVersionLength);
                    this.mdFlags = clrDirReader.readShort();
                    this.streamCount = clrDirReader.readShort();
                };
                return ClrMetadata;
            })();
            metadata.ClrMetadata = ClrMetadata;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var MetadataStreams = (function () {
                function MetadataStreams() {
                    this.guids = [];
                    this.strings = null;
                    this.blobs = null;
                    this.tables = null;
                }
                MetadataStreams.prototype.read = function (metadataBaseAddress, streamCount, reader) {
                    var guidRange;
                    for(var i = 0; i < streamCount; i++) {
                        var range = new pe.headers.AddressRange(reader.readInt(), reader.readInt());
                        range.address += metadataBaseAddress;
                        var name = this.readAlignedNameString(reader);
                        switch(name) {
                            case "#GUID": {
                                guidRange = range;
                                continue;

                            }
                            case "#Strings": {
                                this.strings = range;
                                continue;

                            }
                            case "#Blob": {
                                this.blobs = range;
                                continue;

                            }
                            case "#~":
                            case "#-": {
                                this.tables = range;
                                continue;

                            }
                        }
                        (this)[name] = range;
                    }
                    if(guidRange) {
                        var guidReader = reader.readAtOffset(guidRange.address);
                        this.guids = Array(guidRange.size / 16);
                        for(var i = 0; i < this.guids.length; i++) {
                            var guid = this.readGuidForStream(guidReader);
                            this.guids[i] = guid;
                        }
                    }
                };
                MetadataStreams.prototype.readAlignedNameString = function (reader) {
                    var result = "";
                    while(true) {
                        var b = reader.readByte();
                        if(b == 0) {
                            break;
                        }
                        result += String.fromCharCode(b);
                    }
                    var skipCount = -1 + ((result.length + 4) & ~3) - result.length;
                    reader.skipBytes(skipCount);
                    return result;
                };
                MetadataStreams.prototype.readGuidForStream = function (reader) {
                    var guid = "{";
                    for(var i = 0; i < 4; i++) {
                        var hex = reader.readInt().toString(16);
                        guid += "00000000".substring(0, 8 - hex.length) + hex;
                    }
                    guid += "}";
                    return guid;
                };
                return MetadataStreams;
            })();
            metadata.MetadataStreams = MetadataStreams;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            (function (AssemblyHashAlgorithm) {
                AssemblyHashAlgorithm._map = [];
                AssemblyHashAlgorithm.None = 0;
                AssemblyHashAlgorithm.Reserved = 32771;
                AssemblyHashAlgorithm.Sha1 = 32772;
            })(metadata.AssemblyHashAlgorithm || (metadata.AssemblyHashAlgorithm = {}));
            var AssemblyHashAlgorithm = metadata.AssemblyHashAlgorithm;
            (function (AssemblyFlags) {
                AssemblyFlags._map = [];
                AssemblyFlags.PublicKey = 1;
                AssemblyFlags.Retargetable = 256;
                AssemblyFlags.DisableJITcompileOptimizer = 16384;
                AssemblyFlags.EnableJITcompileTracking = 32768;
            })(metadata.AssemblyFlags || (metadata.AssemblyFlags = {}));
            var AssemblyFlags = metadata.AssemblyFlags;
            (function (ElementType) {
                ElementType._map = [];
                ElementType.End = 0;
                ElementType.Void = 1;
                ElementType.Boolean = 2;
                ElementType.Char = 3;
                ElementType.I1 = 4;
                ElementType.U1 = 5;
                ElementType.I2 = 6;
                ElementType.U2 = 7;
                ElementType.I4 = 8;
                ElementType.U4 = 9;
                ElementType.I8 = 10;
                ElementType.U8 = 11;
                ElementType.R4 = 12;
                ElementType.R8 = 13;
                ElementType.String = 14;
                ElementType.Ptr = 15;
                ElementType.ByRef = 16;
                ElementType.ValueType = 17;
                ElementType.Class = 18;
                ElementType.Var = 19;
                ElementType.Array = 20;
                ElementType.GenericInst = 21;
                ElementType.TypedByRef = 22;
                ElementType.I = 24;
                ElementType.U = 25;
                ElementType.FnPtr = 27;
                ElementType.Object = 28;
                ElementType.SZArray = 29;
                ElementType.MVar = 30;
                ElementType.CMod_ReqD = 31;
                ElementType.CMod_Opt = 32;
                ElementType.Internal = 33;
                ElementType.Modifier = 64;
                ElementType.Sentinel = 1 | ElementType.Modifier;
                ElementType.Pinned = 5 | ElementType.Modifier;
                ElementType.R4_Hfa = 6 | ElementType.Modifier;
                ElementType.R8_Hfa = 7 | ElementType.Modifier;
                ElementType.ArgumentType_ = 16 | ElementType.Modifier;
                ElementType.CustomAttribute_BoxedObject_ = 17 | ElementType.Modifier;
                ElementType.CustomAttribute_Field_ = 19 | ElementType.Modifier;
                ElementType.CustomAttribute_Property_ = 20 | ElementType.Modifier;
                ElementType.CustomAttribute_Enum_ = 85;
            })(metadata.ElementType || (metadata.ElementType = {}));
            var ElementType = metadata.ElementType;
            (function (SecurityAction) {
                SecurityAction._map = [];
                SecurityAction.Assert = 3;
                SecurityAction.Demand = 2;
                SecurityAction.Deny = 4;
                SecurityAction.InheritanceDemand = 7;
                SecurityAction.LinkDemand = 6;
                SecurityAction.NonCasDemand = 0;
                SecurityAction.NonCasLinkDemand = 0;
                SecurityAction.PrejitGrant = 0;
                SecurityAction.PermitOnly = 5;
                SecurityAction.RequestMinimum = 8;
                SecurityAction.RequestOptional = 9;
                SecurityAction.RequestRefuse = 10;
            })(metadata.SecurityAction || (metadata.SecurityAction = {}));
            var SecurityAction = metadata.SecurityAction;
            (function (EventAttributes) {
                EventAttributes._map = [];
                EventAttributes.SpecialName = 512;
                EventAttributes.RTSpecialName = 1024;
            })(metadata.EventAttributes || (metadata.EventAttributes = {}));
            var EventAttributes = metadata.EventAttributes;
            (function (TypeAttributes) {
                TypeAttributes._map = [];
                TypeAttributes.VisibilityMask = 7;
                TypeAttributes.NotPublic = 0;
                TypeAttributes.Public = 1;
                TypeAttributes.NestedPublic = 2;
                TypeAttributes.NestedPrivate = 3;
                TypeAttributes.NestedFamily = 4;
                TypeAttributes.NestedAssembly = 5;
                TypeAttributes.NestedFamANDAssem = 6;
                TypeAttributes.NestedFamORAssem = 7;
                TypeAttributes.LayoutMask = 24;
                TypeAttributes.AutoLayout = 0;
                TypeAttributes.SequentialLayout = 8;
                TypeAttributes.ExplicitLayout = 16;
                TypeAttributes.ClassSemanticsMask = 32;
                TypeAttributes.Class = 0;
                TypeAttributes.Interface = 32;
                TypeAttributes.Abstract = 128;
                TypeAttributes.Sealed = 256;
                TypeAttributes.SpecialName = 1024;
                TypeAttributes.Import = 4096;
                TypeAttributes.Serializable = 8192;
                TypeAttributes.StringFormatMask = 196608;
                TypeAttributes.AnsiClass = 0;
                TypeAttributes.UnicodeClass = 65536;
                TypeAttributes.AutoClass = 131072;
                TypeAttributes.CustomFormatClass = 196608;
                TypeAttributes.CustomStringFormatMask = 12582912;
                TypeAttributes.BeforeFieldInit = 1048576;
                TypeAttributes.RTSpecialName = 2048;
                TypeAttributes.HasSecurity = 262144;
                TypeAttributes.IsTypeForwarder = 2097152;
            })(metadata.TypeAttributes || (metadata.TypeAttributes = {}));
            var TypeAttributes = metadata.TypeAttributes;
            (function (FieldAttributes) {
                FieldAttributes._map = [];
                FieldAttributes.FieldAccessMask = 7;
                FieldAttributes.CompilerControlled = 0;
                FieldAttributes.Private = 1;
                FieldAttributes.FamANDAssem = 2;
                FieldAttributes.Assembly = 3;
                FieldAttributes.Family = 4;
                FieldAttributes.FamORAssem = 5;
                FieldAttributes.Public = 6;
                FieldAttributes.Static = 16;
                FieldAttributes.InitOnly = 32;
                FieldAttributes.Literal = 64;
                FieldAttributes.NotSerialized = 128;
                FieldAttributes.SpecialName = 512;
                FieldAttributes.PInvokeImpl = 8192;
                FieldAttributes.RTSpecialName = 1024;
                FieldAttributes.HasFieldMarshal = 4096;
                FieldAttributes.HasDefault = 32768;
                FieldAttributes.HasFieldRVA = 256;
            })(metadata.FieldAttributes || (metadata.FieldAttributes = {}));
            var FieldAttributes = metadata.FieldAttributes;
            (function (FileAttributes) {
                FileAttributes._map = [];
                FileAttributes.ContainsMetaData = 0;
                FileAttributes.ContainsNoMetaData = 1;
            })(metadata.FileAttributes || (metadata.FileAttributes = {}));
            var FileAttributes = metadata.FileAttributes;
            (function (GenericParamAttributes) {
                GenericParamAttributes._map = [];
                GenericParamAttributes.VarianceMask = 3;
                GenericParamAttributes.None = 0;
                GenericParamAttributes.Covariant = 1;
                GenericParamAttributes.Contravariant = 2;
                GenericParamAttributes.SpecialConstraintMask = 28;
                GenericParamAttributes.ReferenceTypeConstraint = 4;
                GenericParamAttributes.NotNullableValueTypeConstraint = 8;
                GenericParamAttributes.DefaultConstructorConstraint = 16;
            })(metadata.GenericParamAttributes || (metadata.GenericParamAttributes = {}));
            var GenericParamAttributes = metadata.GenericParamAttributes;
            (function (PInvokeAttributes) {
                PInvokeAttributes._map = [];
                PInvokeAttributes.NoMangle = 1;
                PInvokeAttributes.CharSetMask = 6;
                PInvokeAttributes.CharSetNotSpec = 0;
                PInvokeAttributes.CharSetAnsi = 2;
                PInvokeAttributes.CharSetUnicode = 4;
                PInvokeAttributes.CharSetAuto = 6;
                PInvokeAttributes.SupportsLastError = 64;
                PInvokeAttributes.CallConvMask = 1792;
                PInvokeAttributes.CallConvPlatformapi = 256;
                PInvokeAttributes.CallConvCdecl = 512;
                PInvokeAttributes.CallConvStdcall = 768;
                PInvokeAttributes.CallConvThiscall = 1024;
                PInvokeAttributes.CallConvFastcall = 1280;
            })(metadata.PInvokeAttributes || (metadata.PInvokeAttributes = {}));
            var PInvokeAttributes = metadata.PInvokeAttributes;
            (function (ManifestResourceAttributes) {
                ManifestResourceAttributes._map = [];
                ManifestResourceAttributes.VisibilityMask = 7;
                ManifestResourceAttributes.Public = 1;
                ManifestResourceAttributes.Private = 2;
            })(metadata.ManifestResourceAttributes || (metadata.ManifestResourceAttributes = {}));
            var ManifestResourceAttributes = metadata.ManifestResourceAttributes;
            (function (MethodImplAttributes) {
                MethodImplAttributes._map = [];
                MethodImplAttributes.CodeTypeMask = 3;
                MethodImplAttributes.IL = 0;
                MethodImplAttributes.Native = 1;
                MethodImplAttributes.OPTIL = 2;
                MethodImplAttributes.Runtime = 3;
                MethodImplAttributes.ManagedMask = 4;
                MethodImplAttributes.Unmanaged = 4;
                MethodImplAttributes.Managed = 0;
                MethodImplAttributes.ForwardRef = 16;
                MethodImplAttributes.PreserveSig = 128;
                MethodImplAttributes.InternalCall = 4096;
                MethodImplAttributes.Synchronized = 32;
                MethodImplAttributes.NoInlining = 8;
                MethodImplAttributes.MaxMethodImplVal = 65535;
                MethodImplAttributes.NoOptimization = 64;
            })(metadata.MethodImplAttributes || (metadata.MethodImplAttributes = {}));
            var MethodImplAttributes = metadata.MethodImplAttributes;
            (function (MethodAttributes) {
                MethodAttributes._map = [];
                MethodAttributes.MemberAccessMask = 7;
                MethodAttributes.CompilerControlled = 0;
                MethodAttributes.Private = 1;
                MethodAttributes.FamANDAssem = 2;
                MethodAttributes.Assem = 3;
                MethodAttributes.Family = 4;
                MethodAttributes.FamORAssem = 5;
                MethodAttributes.Public = 6;
                MethodAttributes.Static = 16;
                MethodAttributes.Final = 32;
                MethodAttributes.Virtual = 64;
                MethodAttributes.HideBySig = 128;
                MethodAttributes.VtableLayoutMask = 256;
                MethodAttributes.ReuseSlot = 0;
                MethodAttributes.NewSlot = 256;
                MethodAttributes.Strict = 512;
                MethodAttributes.Abstract = 1024;
                MethodAttributes.SpecialName = 2048;
                MethodAttributes.PInvokeImpl = 8192;
                MethodAttributes.UnmanagedExport = 8;
                MethodAttributes.RTSpecialName = 4096;
                MethodAttributes.HasSecurity = 16384;
                MethodAttributes.RequireSecObject = 32768;
            })(metadata.MethodAttributes || (metadata.MethodAttributes = {}));
            var MethodAttributes = metadata.MethodAttributes;
            (function (MethodSemanticsAttributes) {
                MethodSemanticsAttributes._map = [];
                MethodSemanticsAttributes.Setter = 1;
                MethodSemanticsAttributes.Getter = 2;
                MethodSemanticsAttributes.Other = 4;
                MethodSemanticsAttributes.AddOn = 8;
                MethodSemanticsAttributes.RemoveOn = 16;
                MethodSemanticsAttributes.Fire = 32;
            })(metadata.MethodSemanticsAttributes || (metadata.MethodSemanticsAttributes = {}));
            var MethodSemanticsAttributes = metadata.MethodSemanticsAttributes;
            (function (ParamAttributes) {
                ParamAttributes._map = [];
                ParamAttributes.In = 1;
                ParamAttributes.Out = 2;
                ParamAttributes.Optional = 16;
                ParamAttributes.HasDefault = 4096;
                ParamAttributes.HasFieldMarshal = 8192;
                ParamAttributes.Unused = 53216;
            })(metadata.ParamAttributes || (metadata.ParamAttributes = {}));
            var ParamAttributes = metadata.ParamAttributes;
            (function (PropertyAttributes) {
                PropertyAttributes._map = [];
                PropertyAttributes.SpecialName = 512;
                PropertyAttributes.RTSpecialName = 1024;
                PropertyAttributes.HasDefault = 4096;
                PropertyAttributes.Unused = 59903;
            })(metadata.PropertyAttributes || (metadata.PropertyAttributes = {}));
            var PropertyAttributes = metadata.PropertyAttributes;
            (function (TableKind) {
                TableKind._map = [];
                TableKind.Assembly = 32;
                TableKind.AssemblyProcessor = 33;
                TableKind.AssemblyOS = 34;
                TableKind.AssemblyRefOS = 37;
                TableKind.AssemblyRefProcessor = 36;
                TableKind.Module = 0;
                TableKind.TypeRef = 1;
                TableKind.TypeDef = 2;
                TableKind.Field = 4;
                TableKind.MethodDef = 6;
                TableKind.Param = 8;
                TableKind.MemberRef = 10;
                TableKind.Constant = 11;
                TableKind.CustomAttribute = 12;
                TableKind.FieldMarshal = 13;
                TableKind.DeclSecurity = 14;
                TableKind.ClassLayout = 15;
                TableKind.InterfaceImpl = 9;
                TableKind.FieldLayout = 16;
                TableKind.StandAloneSig = 17;
                TableKind.EventMap = 18;
                TableKind.Event = 20;
                TableKind.PropertyMap = 21;
                TableKind.Property = 23;
                TableKind.MethodSemantics = 24;
                TableKind.MethodImpl = 25;
                TableKind.ModuleRef = 26;
                TableKind.TypeSpec = 27;
                TableKind.ImplMap = 28;
                TableKind.FieldRVA = 29;
                TableKind.AssemblyRef = 35;
                TableKind.File = 38;
                TableKind.ExportedType = 39;
                TableKind.ManifestResource = 40;
                TableKind.NestedClass = 41;
                TableKind.GenericParam = 42;
                TableKind.MethodSpec = 43;
                TableKind.GenericParamConstraint = 44;
            })(metadata.TableKind || (metadata.TableKind = {}));
            var TableKind = metadata.TableKind;
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var TableStreamReader = (function () {
                function TableStreamReader(baseReader, streams, tables) {
                    this.baseReader = baseReader;
                    this.streams = streams;
                    this.tables = tables;
                    this.stringHeapCache = [];
                    this.readResolutionScope = this.createCodedIndexReader(metadata.TableKind.Module, metadata.TableKind.ModuleRef, metadata.TableKind.AssemblyRef, metadata.TableKind.TypeRef);
                    this.readTypeDefOrRef = this.createCodedIndexReader(metadata.TableKind.TypeDef, metadata.TableKind.TypeRef, metadata.TableKind.TypeSpec);
                    this.readHasConstant = this.createCodedIndexReader(metadata.TableKind.Field, metadata.TableKind.Param, metadata.TableKind.Property);
                    this.readHasCustomAttribute = this.createCodedIndexReader(metadata.TableKind.MethodDef, metadata.TableKind.Field, metadata.TableKind.TypeRef, metadata.TableKind.TypeDef, metadata.TableKind.Param, metadata.TableKind.InterfaceImpl, metadata.TableKind.MemberRef, metadata.TableKind.Module, 65535, metadata.TableKind.Property, metadata.TableKind.Event, metadata.TableKind.StandAloneSig, metadata.TableKind.ModuleRef, metadata.TableKind.TypeSpec, metadata.TableKind.Assembly, metadata.TableKind.AssemblyRef, metadata.TableKind.File, metadata.TableKind.ExportedType, metadata.TableKind.ManifestResource, metadata.TableKind.GenericParam, metadata.TableKind.GenericParamConstraint, metadata.TableKind.MethodSpec);
                    this.readCustomAttributeType = this.createCodedIndexReader(65535, 65535, metadata.TableKind.MethodDef, metadata.TableKind.MemberRef, 65535);
                    this.readHasDeclSecurity = this.createCodedIndexReader(metadata.TableKind.TypeDef, metadata.TableKind.MethodDef, metadata.TableKind.Assembly);
                    this.readImplementation = this.createCodedIndexReader(metadata.TableKind.File, metadata.TableKind.AssemblyRef, metadata.TableKind.ExportedType);
                    this.readHasFieldMarshal = this.createCodedIndexReader(metadata.TableKind.Field, metadata.TableKind.Param);
                    this.readTypeOrMethodDef = this.createCodedIndexReader(metadata.TableKind.TypeDef, metadata.TableKind.MethodDef);
                    this.readMemberForwarded = this.createCodedIndexReader(metadata.TableKind.Field, metadata.TableKind.MethodDef);
                    this.readMemberRefParent = this.createCodedIndexReader(metadata.TableKind.TypeDef, metadata.TableKind.TypeRef, metadata.TableKind.ModuleRef, metadata.TableKind.MethodDef, metadata.TableKind.TypeSpec);
                    this.readMethodDefOrRef = this.createCodedIndexReader(metadata.TableKind.MethodDef, metadata.TableKind.MemberRef);
                    this.readHasSemantics = this.createCodedIndexReader(metadata.TableKind.Event, metadata.TableKind.Property);
                }
                TableStreamReader.prototype.readByte = function () {
                    return this.baseReader.readByte();
                };
                TableStreamReader.prototype.readInt = function () {
                    return this.baseReader.readInt();
                };
                TableStreamReader.prototype.readShort = function () {
                    return this.baseReader.readShort();
                };
                TableStreamReader.prototype.readString = function () {
                    var pos = this.readPos(this.streams.strings.size);
                    var result;
                    if(pos == 0) {
                        result = null;
                    } else {
                        result = this.stringHeapCache[pos];
                        if(!result) {
                            if(pos > this.streams.strings.size) {
                                throw new Error("String heap position overflow.");
                            }
                            var utf8Reader = this.baseReader.readAtOffset(this.streams.strings.address + pos);
                            result = utf8Reader.readUtf8z(1024 * 1024 * 1024);
                            this.stringHeapCache[pos] = result;
                        }
                    }
                    return result;
                };
                TableStreamReader.prototype.readGuid = function () {
                    var index = this.readPos(this.streams.guids.length);
                    if(index == 0) {
                        return null;
                    } else {
                        return this.streams.guids[(index - 1) / 16];
                    }
                };
                TableStreamReader.prototype.readBlob = function () {
                    var index = this.readPos(this.streams.blobs.size);
                    return index;
                };
                TableStreamReader.prototype.readTableRowIndex = function (tableIndex) {
                    var tableRows = this.tables[tableIndex];
                    return this.readPos(tableRows ? tableRows.length : 0);
                };
                TableStreamReader.prototype.createCodedIndexReader = function () {
                    var _this = this;
                    var tableTypes = [];
                    for (var _i = 0; _i < (arguments.length - 0); _i++) {
                        tableTypes[_i] = arguments[_i + 0];
                    }
                    var tableDebug = [];
                    var maxTableLength = 0;
                    for(var i = 0; i < tableTypes.length; i++) {
                        var table = this.tables[tableTypes[i]];
                        if(!table) {
                            tableDebug.push(null);
                            continue;
                        }
                        tableDebug.push(table.length);
                        maxTableLength = Math.max(maxTableLength, table.length);
                    }
                    function calcRequredBitCount(maxValue) {
                        var bitMask = maxValue;
                        var result = 0;
                        while(bitMask != 0) {
                            result++;
                            bitMask >>= 1;
                        }
                        return result;
                    }
                    var tableKindBitCount = calcRequredBitCount(tableTypes.length - 1);
                    var tableIndexBitCount = calcRequredBitCount(maxTableLength);
                    var debug = {
                        maxTableLength: maxTableLength,
                        calcRequredBitCount: calcRequredBitCount,
                        tableLengths: tableDebug
                    };
                    return function () {
                        var result = tableKindBitCount + tableIndexBitCount <= 16 ? _this.baseReader.readShort() : _this.baseReader.readInt();
                        debug.toString();
                        var resultIndex = result >> tableKindBitCount;
                        var resultTableIndex = result - (resultIndex << tableKindBitCount);
                        var table = tableTypes[resultTableIndex];
                        if(resultIndex == 0) {
                            return null;
                        }
                        resultIndex--;
                        var row = resultIndex === 0 ? null : _this.tables[table][resultIndex];
                        return {
                            table: table,
                            index: resultIndex,
                            row: row
                        };
                    }
                };
                TableStreamReader.prototype.readPos = function (spaceSize) {
                    if(spaceSize < 65535) {
                        return this.baseReader.readShort();
                    } else {
                        return this.baseReader.readInt();
                    }
                };
                return TableStreamReader;
            })();
            metadata.TableStreamReader = TableStreamReader;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var Assembly = (function () {
                function Assembly() {
                    this.assemblyDefinition = null;
                }
                Assembly.prototype.read = function (reader) {
                    if(!this.assemblyDefinition) {
                        this.assemblyDefinition = new managed.AssemblyDefinition();
                    }
                    this.assemblyDefinition.hashAlgId = reader.readInt();
                    this.assemblyDefinition.version = reader.readShort() + "." + reader.readShort() + "." + reader.readShort() + "." + reader.readShort();
                    this.assemblyDefinition.flags = reader.readInt();
                    this.assemblyDefinition.publicKey = reader.readBlob();
                    this.assemblyDefinition.name = reader.readString();
                    this.assemblyDefinition.culture = reader.readString();
                };
                return Assembly;
            })();
            metadata.Assembly = Assembly;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var AssemblyOS = (function () {
                function AssemblyOS() { }
                AssemblyOS.prototype.read = function (reader) {
                    this.osplatformID = reader.readInt();
                    this.osmajorVersion = reader.readInt();
                    this.osminorVersion = reader.readInt();
                };
                return AssemblyOS;
            })();
            metadata.AssemblyOS = AssemblyOS;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var AssemblyProcessor = (function () {
                function AssemblyProcessor() { }
                AssemblyProcessor.prototype.read = function (reader) {
                    this.processor = reader.readInt();
                };
                return AssemblyProcessor;
            })();
            metadata.AssemblyProcessor = AssemblyProcessor;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var AssemblyRef = (function () {
                function AssemblyRef() { }
                AssemblyRef.prototype.read = function (reader) {
                    this.version = reader.readShort() + "." + reader.readShort() + "." + reader.readShort() + "." + reader.readShort();
                    this.flags = reader.readInt();
                    this.publicKeyOrToken = reader.readBlob();
                    this.name = reader.readString();
                    this.culture = reader.readString();
                    this.hashValue = reader.readBlob();
                };
                return AssemblyRef;
            })();
            metadata.AssemblyRef = AssemblyRef;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var AssemblyRefOS = (function () {
                function AssemblyRefOS() { }
                AssemblyRefOS.prototype.read = function (reader) {
                    this.version = reader.readShort() + "." + reader.readShort() + "." + reader.readShort() + "." + reader.readShort();
                    this.flags = reader.readInt();
                    this.publicKeyOrToken = reader.readBlob();
                    this.name = reader.readString();
                    this.culture = reader.readString();
                    this.hashValue = reader.readBlob();
                };
                return AssemblyRefOS;
            })();
            metadata.AssemblyRefOS = AssemblyRefOS;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var AssemblyRefProcessor = (function () {
                function AssemblyRefProcessor() { }
                AssemblyRefProcessor.prototype.read = function (reader) {
                    this.processor = reader.readInt();
                };
                return AssemblyRefProcessor;
            })();
            metadata.AssemblyRefProcessor = AssemblyRefProcessor;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var ClassLayout = (function () {
                function ClassLayout() { }
                ClassLayout.prototype.read = function (reader) {
                    this.packingSize = reader.readShort();
                    this.classSize = reader.readInt();
                    this.parent = reader.readTableRowIndex(metadata.TableKind.TypeDef);
                };
                return ClassLayout;
            })();
            metadata.ClassLayout = ClassLayout;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var Constant = (function () {
                function Constant() { }
                Constant.prototype.read = function (reader) {
                    this.type = reader.readByte();
                    var padding = reader.readByte();
                    this.parent = reader.readHasConstant();
                    this.value = reader.readBlob();
                };
                return Constant;
            })();
            metadata.Constant = Constant;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var CustomAttributeData = (function () {
                function CustomAttributeData(blob) {
                    this.blob = blob;
                }
                return CustomAttributeData;
            })();
            metadata.CustomAttributeData = CustomAttributeData;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var CustomAttribute = (function () {
                function CustomAttribute() { }
                CustomAttribute.prototype.read = function (reader) {
                    this.parent = reader.readHasCustomAttribute();
                    this.type = reader.readCustomAttributeType();
                    this.value = new metadata.CustomAttributeData(reader.readBlob());
                };
                return CustomAttribute;
            })();
            metadata.CustomAttribute = CustomAttribute;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var DeclSecurity = (function () {
                function DeclSecurity() { }
                DeclSecurity.prototype.read = function (reader) {
                    this.action = reader.readShort();
                    this.parent = reader.readHasDeclSecurity();
                    this.permissionSet = reader.readBlob();
                };
                return DeclSecurity;
            })();
            metadata.DeclSecurity = DeclSecurity;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var Event = (function () {
                function Event() { }
                Event.prototype.read = function (reader) {
                    this.eventFlags = reader.readShort();
                    this.name = reader.readString();
                    this.eventType = reader.readTypeDefOrRef();
                };
                return Event;
            })();
            metadata.Event = Event;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var EventMap = (function () {
                function EventMap() { }
                EventMap.prototype.read = function (reader) {
                    this.parent = reader.readTableRowIndex(metadata.TableKind.TypeDef);
                    this.eventList = reader.readTableRowIndex(metadata.TableKind.Event);
                };
                return EventMap;
            })();
            metadata.EventMap = EventMap;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var ExportedType = (function () {
                function ExportedType() { }
                ExportedType.prototype.read = function (reader) {
                    this.flags = reader.readInt();
                    this.typeDefId = reader.readInt();
                    this.typeName = reader.readString();
                    this.typeNamespace = reader.readString();
                    this.implementation = reader.readImplementation();
                };
                return ExportedType;
            })();
            metadata.ExportedType = ExportedType;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var FieldSig = (function () {
                function FieldSig(blob) {
                    this.blob = blob;
                }
                return FieldSig;
            })();
            metadata.FieldSig = FieldSig;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var Field = (function () {
                function Field() { }
                Field.prototype.read = function (reader) {
                    this.fieldDefinition = new managed.FieldDefinition();
                    this.fieldDefinition.attributes = reader.readShort();
                    this.fieldDefinition.name = reader.readString();
                    this.signature = new metadata.FieldSig(reader.readBlob());
                };
                return Field;
            })();
            metadata.Field = Field;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var FieldLayout = (function () {
                function FieldLayout() { }
                FieldLayout.prototype.read = function (reader) {
                    this.offset = reader.readInt();
                    this.field = reader.readTableRowIndex(metadata.TableKind.Field);
                };
                return FieldLayout;
            })();
            metadata.FieldLayout = FieldLayout;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var MarshalSpec = (function () {
                function MarshalSpec(blob) {
                    this.blob = blob;
                }
                return MarshalSpec;
            })();
            metadata.MarshalSpec = MarshalSpec;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var FieldMarshal = (function () {
                function FieldMarshal() { }
                FieldMarshal.prototype.read = function (reader) {
                    this.parent = reader.readHasFieldMarshal();
                    this.nativeType = new metadata.MarshalSpec(reader.readBlob());
                };
                return FieldMarshal;
            })();
            metadata.FieldMarshal = FieldMarshal;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var FieldRVA = (function () {
                function FieldRVA() { }
                FieldRVA.prototype.read = function (reader) {
                    this.rva = reader.readInt();
                    this.field = reader.readTableRowIndex(metadata.TableKind.Field);
                };
                return FieldRVA;
            })();
            metadata.FieldRVA = FieldRVA;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var File = (function () {
                function File() { }
                File.prototype.read = function (reader) {
                    this.flags = reader.readInt();
                    this.name = reader.readString();
                    this.hashValue = reader.readBlob();
                };
                return File;
            })();
            metadata.File = File;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var GenericParam = (function () {
                function GenericParam() { }
                GenericParam.prototype.read = function (reader) {
                    this.number = reader.readShort();
                    this.flags = reader.readShort();
                    this.owner = reader.readTypeOrMethodDef();
                    this.name = reader.readString();
                };
                return GenericParam;
            })();
            metadata.GenericParam = GenericParam;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var GenericParamConstraint = (function () {
                function GenericParamConstraint() { }
                GenericParamConstraint.prototype.read = function (reader) {
                    this.owner = reader.readTableRowIndex(metadata.TableKind.GenericParam);
                    this.constraint = reader.readTypeDefOrRef();
                };
                return GenericParamConstraint;
            })();
            metadata.GenericParamConstraint = GenericParamConstraint;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var ImplMap = (function () {
                function ImplMap() { }
                ImplMap.prototype.read = function (reader) {
                    this.mappingFlags = reader.readShort();
                    this.memberForwarded = reader.readMemberForwarded();
                    this.importName = reader.readString();
                    this.importScope = reader.readTableRowIndex(metadata.TableKind.ModuleRef);
                };
                return ImplMap;
            })();
            metadata.ImplMap = ImplMap;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var InterfaceImpl = (function () {
                function InterfaceImpl() { }
                InterfaceImpl.prototype.read = function (reader) {
                    this.classIndex = reader.readTableRowIndex(metadata.TableKind.TypeDef);
                    this.interface = reader.readTypeDefOrRef();
                };
                return InterfaceImpl;
            })();
            metadata.InterfaceImpl = InterfaceImpl;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var ManifestResource = (function () {
                function ManifestResource() { }
                ManifestResource.prototype.read = function (reader) {
                    this.offset = reader.readInt();
                    this.flags = reader.readInt();
                    this.name = reader.readString();
                    this.implementation = reader.readImplementation();
                };
                return ManifestResource;
            })();
            metadata.ManifestResource = ManifestResource;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var MemberRef = (function () {
                function MemberRef() { }
                MemberRef.prototype.read = function (reader) {
                    this.classIndex = reader.readMemberRefParent();
                    this.name = reader.readString();
                    this.signatureBlob = reader.readBlob();
                };
                return MemberRef;
            })();
            metadata.MemberRef = MemberRef;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var MethodSig = (function () {
                function MethodSig(blob) {
                    this.blob = blob;
                }
                return MethodSig;
            })();
            metadata.MethodSig = MethodSig;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var MethodDef = (function () {
                function MethodDef() { }
                MethodDef.prototype.read = function (reader) {
                    this.methodDefinition = new managed.MethodDefinition();
                    this.rva = reader.readInt();
                    this.methodDefinition.implAttributes = reader.readShort();
                    this.methodDefinition.attributes = reader.readShort();
                    this.methodDefinition.name = reader.readString();
                    this.signature = new metadata.MethodSig(reader.readBlob());
                    this.paramList = reader.readTableRowIndex(metadata.TableKind.Param);
                };
                return MethodDef;
            })();
            metadata.MethodDef = MethodDef;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var MethodImpl = (function () {
                function MethodImpl() { }
                MethodImpl.prototype.read = function (reader) {
                    this.classIndex = reader.readTableRowIndex(metadata.TableKind.TypeDef);
                    this.methodBody = reader.readMethodDefOrRef();
                    this.methodDeclaration = reader.readMethodDefOrRef();
                };
                return MethodImpl;
            })();
            metadata.MethodImpl = MethodImpl;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var MethodSemantics = (function () {
                function MethodSemantics() { }
                MethodSemantics.prototype.read = function (reader) {
                    this.semantics = reader.readShort();
                    this.method = reader.readTableRowIndex(metadata.TableKind.MethodDef);
                    this.association = reader.readHasSemantics();
                };
                return MethodSemantics;
            })();
            metadata.MethodSemantics = MethodSemantics;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var MethodSpecSig = (function () {
                function MethodSpecSig(blob) {
                    this.blob = blob;
                }
                return MethodSpecSig;
            })();
            metadata.MethodSpecSig = MethodSpecSig;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var MethodSpec = (function () {
                function MethodSpec() { }
                MethodSpec.prototype.read = function (reader) {
                    this.method = reader.readMethodDefOrRef();
                    this.instantiation = new metadata.MethodSpecSig(reader.readBlob());
                };
                return MethodSpec;
            })();
            metadata.MethodSpec = MethodSpec;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var Module = (function () {
                function Module() { }
                Module.prototype.read = function (reader) {
                    if(!this.moduleDefinition) {
                        this.moduleDefinition = new managed.ModuleDefinition();
                    }
                    this.moduleDefinition.generation = reader.readShort();
                    this.moduleDefinition.name = reader.readString();
                    this.moduleDefinition.mvid = reader.readGuid();
                    this.moduleDefinition.encId = reader.readGuid();
                    this.moduleDefinition.encBaseId = reader.readGuid();
                };
                return Module;
            })();
            metadata.Module = Module;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var ModuleRef = (function () {
                function ModuleRef() { }
                ModuleRef.prototype.read = function (reader) {
                    this.name = reader.readString();
                };
                return ModuleRef;
            })();
            metadata.ModuleRef = ModuleRef;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var NestedClass = (function () {
                function NestedClass() { }
                NestedClass.prototype.read = function (reader) {
                    this.nestedClass = reader.readTableRowIndex(metadata.TableKind.TypeDef);
                    this.enclosingClass = reader.readTableRowIndex(metadata.TableKind.TypeDef);
                };
                return NestedClass;
            })();
            metadata.NestedClass = NestedClass;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var Param = (function () {
                function Param() { }
                Param.prototype.read = function (reader) {
                    this.parameterDefinition = new managed.ParameterDefinition();
                    this.parameterDefinition.attributes = reader.readShort();
                    this.sequence = reader.readShort();
                    this.parameterDefinition.name = reader.readString();
                };
                return Param;
            })();
            metadata.Param = Param;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var PropertySig = (function () {
                function PropertySig(blob) {
                    this.blob = blob;
                }
                return PropertySig;
            })();
            metadata.PropertySig = PropertySig;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var Property = (function () {
                function Property() { }
                Property.prototype.read = function (reader) {
                    this.propertyDefinition = new managed.PropertyDefinition();
                    this.propertyDefinition.attributes = reader.readShort();
                    this.propertyDefinition.name = reader.readString();
                    this.type = new metadata.PropertySig(reader.readBlob());
                };
                return Property;
            })();
            metadata.Property = Property;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var PropertyMap = (function () {
                function PropertyMap() { }
                PropertyMap.prototype.read = function (reader) {
                    this.parent = reader.readTableRowIndex(metadata.TableKind.TypeDef);
                    this.propertyList = reader.readTableRowIndex(metadata.TableKind.Property);
                };
                return PropertyMap;
            })();
            metadata.PropertyMap = PropertyMap;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var StandAloneSig = (function () {
                function StandAloneSig() { }
                StandAloneSig.prototype.read = function (reader) {
                    this.signatureBlob = reader.readBlob();
                };
                return StandAloneSig;
            })();
            metadata.StandAloneSig = StandAloneSig;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var TypeDef = (function () {
                function TypeDef() { }
                TypeDef.prototype.read = function (reader) {
                    this.typeDefinition = new managed.TypeDefinition();
                    this.typeDefinition.attributes = reader.readInt();
                    this.typeDefinition.name = reader.readString();
                    this.typeDefinition.namespace = reader.readString();
                    this.extendsIndex = reader.readTypeDefOrRef();
                    this.fieldList = reader.readTableRowIndex(metadata.TableKind.Field);
                    this.methodList = reader.readTableRowIndex(metadata.TableKind.MethodDef);
                };
                return TypeDef;
            })();
            metadata.TypeDef = TypeDef;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var TypeRef = (function () {
                function TypeRef() { }
                TypeRef.prototype.read = function (reader) {
                    this.typeReference = new managed.ExternalTypeReference();
                    this.resolutionScope = reader.readResolutionScope();
                    this.typeReference.name = reader.readString();
                    this.typeReference.namespace = reader.readString();
                };
                return TypeRef;
            })();
            metadata.TypeRef = TypeRef;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var TypeSpec = (function () {
                function TypeSpec() { }
                TypeSpec.prototype.read = function (reader) {
                    this.signature = reader.readBlob();
                };
                return TypeSpec;
            })();
            metadata.TypeSpec = TypeSpec;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var TableStream = (function () {
                function TableStream() {
                    this.reserved0 = 0;
                    this.version = "";
                    this.heapSizes = 0;
                    this.reserved1 = 0;
                }
                TableStream.prototype.read = function (tableReader, streams, existingModule, existingAssembly) {
                    this.reserved0 = tableReader.readInt();
                    this.version = tableReader.readByte() + "." + tableReader.readByte();
                    this.heapSizes = tableReader.readByte();
                    this.reserved1 = tableReader.readByte();
                    var valid = tableReader.readLong();
                    var sorted = tableReader.readLong();
                    this.initTables(tableReader, valid, existingModule, existingAssembly);
                    this.readTables(tableReader, streams);
                };
                TableStream.prototype.initTables = function (reader, valid, existingModule, existingAssembly) {
                    this.tables = [];
                    var tableTypes = [];
                    for(var tk in metadata.TableKind) {
                        if(!metadata.TableKind.hasOwnProperty(tk)) {
                            continue;
                        }
                        var tkValue = metadata.TableKind[tk];
                        if(typeof (tkValue) !== "number") {
                            continue;
                        }
                        tableTypes[tkValue] = managed.metadata[tk];
                    }
                    var bits = valid.lo;
                    for(var tableIndex = 0; tableIndex < 32; tableIndex++) {
                        if(bits & 1) {
                            var rowCount = reader.readInt();
                            this.initTable(tableIndex, rowCount, tableTypes[tableIndex], existingModule, existingAssembly);
                        }
                        bits = bits >> 1;
                    }
                    bits = valid.hi;
                    for(var i = 0; i < 32; i++) {
                        var tableIndex = i + 32;
                        if(bits & 1) {
                            var rowCount = reader.readInt();
                            this.initTable(tableIndex, rowCount, tableTypes[tableIndex], existingModule, existingAssembly);
                        }
                        bits = bits >> 1;
                    }
                };
                TableStream.prototype.initTable = function (tableIndex, rowCount, TableType, existingModule, existingAssembly) {
                    var tableRows = this.tables[tableIndex] = Array(rowCount);
                    if(tableIndex === metadata.TableKind.Module && tableRows.length > 0) {
                        if(!tableRows[0]) {
                            tableRows[0] = new metadata.Module();
                        }
                        tableRows[0].moduleDefinition = existingModule;
                    }
                    if(tableIndex === metadata.TableKind.Assembly && tableRows.length > 0) {
                        if(!tableRows[0]) {
                            tableRows[0] = new metadata.Assembly();
                        }
                        tableRows[0].assemblyDefinition = existingAssembly;
                    }
                    for(var i = 0; i < rowCount; i++) {
                        if(!tableRows[i]) {
                            tableRows[i] = new TableType();
                        }
                    }
                };
                TableStream.prototype.readTables = function (reader, streams) {
                    var tableStreamReader = new metadata.TableStreamReader(reader, streams, this.tables);
                    for(var tableIndex = 0; tableIndex < 64; tableIndex++) {
                        var tableRows = this.tables[tableIndex];
                        if(!tableRows) {
                            continue;
                        }
                        for(var i = 0; i < tableRows.length; i++) {
                            tableRows[i].read(tableStreamReader);
                        }
                    }
                };
                return TableStream;
            })();
            metadata.TableStream = TableStream;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (metadata) {
            var AssemblyReader = (function () {
                function AssemblyReader() { }
                AssemblyReader.prototype.read = function (reader, assembly) {
                    if(!assembly.headers) {
                        assembly.headers = new pe.headers.PEFile();
                        assembly.headers.read(reader);
                    }
                    var rvaReader = new pe.io.RvaBinaryReader(reader, assembly.headers.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, assembly.headers.sectionHeaders);
                    var cdi = new metadata.ClrDirectory();
                    cdi.read(rvaReader);
                    var cmeReader = rvaReader.readAtOffset(cdi.metadataDir.address);
                    var cme = new metadata.ClrMetadata();
                    cme.read(cmeReader);
                    var mes = new metadata.MetadataStreams();
                    mes.read(cdi.metadataDir.address, cme.streamCount, cmeReader);
                    if(!assembly.modules) {
                        assembly.modules = [];
                    }
                    if(!assembly.modules[0]) {
                        assembly.modules[0] = new managed.ModuleDefinition();
                    }
                    var mainModule = assembly.modules[0];
                    mainModule.runtimeVersion = cdi.runtimeVersion;
                    mainModule.imageFlags = cdi.imageFlags;
                    mainModule.specificRuntimeVersion = cme.runtimeVersion;
                    var tbReader = cmeReader.readAtOffset(mes.tables.address);
                    var tas = new metadata.TableStream();
                    tas.read(tbReader, mes, mainModule, assembly);
                    this.populateTypes(mainModule, tas.tables);
                    this.populateMembers(tas.tables[metadata.TableKind.TypeDef], function (parent) {
                        return parent.fieldList;
                    }, function (parent) {
                        return parent.typeDefinition.fields;
                    }, tas.tables[metadata.TableKind.Field], function (child) {
                        return child.fieldDefinition;
                    });
                    this.populateMembers(tas.tables[metadata.TableKind.TypeDef], function (parent) {
                        return parent.methodList;
                    }, function (parent) {
                        return parent.typeDefinition.methods;
                    }, tas.tables[metadata.TableKind.MethodDef], function (child) {
                        return child.methodDefinition;
                    });
                    this.populateMembers(tas.tables[metadata.TableKind.MethodDef], function (parent) {
                        return parent.paramList;
                    }, function (parent) {
                        return parent.methodDefinition.parameters;
                    }, tas.tables[metadata.TableKind.Param], function (child) {
                        return child.parameterDefinition;
                    });
                };
                AssemblyReader.prototype.populateTypes = function (mainModule, tables) {
                    if(!mainModule.types) {
                        mainModule.types = [];
                    }
                    var typeDefTable = tables[metadata.TableKind.TypeDef];
                    if(typeDefTable) {
                        mainModule.types.length = typeDefTable.length;
                        for(var i = 0; i < mainModule.types.length; i++) {
                            mainModule.types[i] = typeDefTable[i].typeDefinition;
                        }
                    } else {
                        mainModule.types.length = 0;
                    }
                };
                AssemblyReader.prototype.populateMembers = function (parentTable, getChildIndex, getChildren, childTable, getChildEntity) {
                    if(!parentTable) {
                        return;
                    }
                    var childIndex = 0;
                    for(var iParent = 0; iParent < parentTable.length; iParent++) {
                        var childCount = !childTable ? 0 : iParent == parentTable.length - 1 ? 0 : getChildIndex(parentTable[iParent + 1]) - childIndex + 1;
                        var parent = parentTable[iParent];
                        var children = getChildren(parent);
                        children.length = childCount;
                        for(var iChild = 0; iChild < childCount; iChild++) {
                            var entity = getChildEntity(childTable[childIndex + iChild]);
                            children[iChild] = entity;
                        }
                        childIndex += childCount;
                    }
                };
                return AssemblyReader;
            })();
            metadata.AssemblyReader = AssemblyReader;            
        })(managed.metadata || (managed.metadata = {}));
        var metadata = managed.metadata;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        var AssemblyDefinition = (function () {
            function AssemblyDefinition() {
                this.headers = null;
                this.hashAlgId = managed.metadata.AssemblyHashAlgorithm.None;
                this.version = "";
                this.flags = 0;
                this.publicKey = "";
                this.name = "";
                this.culture = "";
                this.modules = [];
            }
            AssemblyDefinition.prototype.read = function (reader) {
                var asmReader = new managed.metadata.AssemblyReader();
                asmReader.read(reader, this);
            };
            AssemblyDefinition.prototype.toString = function () {
                return this.name + ", version=" + this.version;
            };
            return AssemblyDefinition;
        })();
        managed.AssemblyDefinition = AssemblyDefinition;        
        var ModuleDefinition = (function () {
            function ModuleDefinition() {
                this.runtimeVersion = "";
                this.specificRuntimeVersion = "";
                this.imageFlags = 0;
                this.metadataVersion = "";
                this.tableStreamVersion = "";
                this.generation = 0;
                this.name = "";
                this.mvid = "";
                this.encId = "";
                this.encBaseId = "";
                this.types = [];
            }
            ModuleDefinition.prototype.toString = function () {
                return this.name + " " + this.imageFlags;
            };
            return ModuleDefinition;
        })();
        managed.ModuleDefinition = ModuleDefinition;        
        var TypeDefinition = (function () {
            function TypeDefinition() {
                this.attributes = 0;
                this.name = "";
                this.namespace = "";
                this.fields = [];
                this.methods = [];
                this.extendsType = null;
            }
            TypeDefinition.prototype.toString = function () {
                var result = "";
                if(this.namespace) {
                    result += this.namespace;
                }
                if(this.name) {
                    result += (result.length > 0 ? "." + this.name : this.name);
                }
                return result;
            };
            return TypeDefinition;
        })();
        managed.TypeDefinition = TypeDefinition;        
        var FieldDefinition = (function () {
            function FieldDefinition() {
                this.attributes = 0;
                this.name = "";
                this.signature = null;
            }
            FieldDefinition.prototype.toString = function () {
                return this.name;
            };
            return FieldDefinition;
        })();
        managed.FieldDefinition = FieldDefinition;        
        var MethodDefinition = (function () {
            function MethodDefinition() {
                this.attributes = 0;
                this.implAttributes = 0;
                this.name = "";
                this.parameters = [];
            }
            MethodDefinition.prototype.toString = function () {
                var result = this.name;
                result += "(";
                if(this.parameters) {
                    for(var i = 0; i < this.parameters.length; i++) {
                        if(i > 0) {
                            result += ", ";
                        }
                        result += this.parameters[i];
                    }
                }
                result += ")";
                return result;
            };
            return MethodDefinition;
        })();
        managed.MethodDefinition = MethodDefinition;        
        var ParameterDefinition = (function () {
            function ParameterDefinition() {
                this.attributes = 0;
                this.name = "";
            }
            ParameterDefinition.prototype.toString = function () {
                return this.name;
            };
            return ParameterDefinition;
        })();
        managed.ParameterDefinition = ParameterDefinition;        
        var PropertyDefinition = (function () {
            function PropertyDefinition() {
                this.attributes = 0;
                this.name = "";
            }
            return PropertyDefinition;
        })();
        managed.PropertyDefinition = PropertyDefinition;        
        var ExternalTypeReference = (function () {
            function ExternalTypeReference() { }
            return ExternalTypeReference;
        })();
        managed.ExternalTypeReference = ExternalTypeReference;        
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
//@ sourceMappingURL=pe.js.map
