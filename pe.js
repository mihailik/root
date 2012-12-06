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
        var ModuleDefinition = (function () {
            function ModuleDefinition() { }
            return ModuleDefinition;
        })();
        managed.ModuleDefinition = ModuleDefinition;        
        var TypeDefinition = (function () {
            function TypeDefinition() { }
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
            function FieldDefinition() { }
            FieldDefinition.prototype.toString = function () {
                return this.name;
            };
            return FieldDefinition;
        })();
        managed.FieldDefinition = FieldDefinition;        
        var MethodDefinition = (function () {
            function MethodDefinition() { }
            return MethodDefinition;
        })();
        managed.MethodDefinition = MethodDefinition;        
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
//@ sourceMappingURL=pe.js.map
