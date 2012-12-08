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
        function readModuleDefinition(_module, reader) {
            _module.generation = reader.readShort();
            _module.name = reader.readString();
            _module.mvid = reader.readGuid();
            _module.encId = reader.readGuid();
            _module.encBaseId = reader.readGuid();
        }
        managed.readModuleDefinition = readModuleDefinition;
        function readTypeReference(typeReference, reader) {
            typeReference.resolutionScope = reader.readResolutionScope();
            typeReference.name = reader.readString();
            typeReference.namespace = reader.readString();
        }
        managed.readTypeReference = readTypeReference;
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        var TableStreamReader = (function () {
            function TableStreamReader(baseReader, streams, tables) {
                this.baseReader = baseReader;
                this.streams = streams;
                this.tables = tables;
                this.stringHeapCache = [];
                this.readResolutionScope = this.createCodedIndexReader(pe.managed.TableTypes().Module, pe.managed.TableTypes().ModuleRef, pe.managed.TableTypes().AssemblyRef, pe.managed.TableTypes().TypeRef);
                this.readTypeDefOrRef = this.createCodedIndexReader(pe.managed.TableTypes().TypeDef, pe.managed.TableTypes().TypeRef, pe.managed.TableTypes().TypeSpec);
            }
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
                if(!tableRows) {
                    return 0;
                }
                return this.readPos(tableRows.length);
            };
            TableStreamReader.prototype.createCodedIndexReader = function () {
                var _this = this;
                var tableTypes = [];
                for (var _i = 0; _i < (arguments.length - 0); _i++) {
                    tableTypes[_i] = arguments[_i + 0];
                }
                var maxTableLength = 0;
                for(var i = 0; i < tableTypes.length; i++) {
                    var tableType = tableTypes[i];
                    if(!tableType) {
                        continue;
                    }
                    var tableRows = this.tables[i];
                    if(!tableRows) {
                        continue;
                    }
                    maxTableLength = Math.max(maxTableLength, tableRows.length);
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
                var readShortInt = tableKindBitCount + tableIndexBitCount < 16;
                return function () {
                    var result = readShortInt ? _this.baseReader.readShort() : _this.baseReader.readInt();
                    var resultIndex = result >> tableKindBitCount;
                    var resultTableIndex = result - (resultIndex << tableKindBitCount);
                    var table = _this.tables[tableTypes[resultTableIndex].index];
                    if(resultIndex == 0) {
                        return null;
                    }
                    resultIndex--;
                    var row = table[resultIndex];
                    return row;
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
        managed.TableStreamReader = TableStreamReader;        
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        var FieldDef = (function () {
            function FieldDef() {
                this.field = new managed.FieldDefinition();
            }
            FieldDef.prototype.read = function (reader) {
                this.field.attributes = reader.readShort();
                this.field.name = reader.readString();
                this.signature = reader.readBlob();
            };
            return FieldDef;
        })();
        managed.FieldDef = FieldDef;        
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        var MethodDef = (function () {
            function MethodDef() {
                this.method = new managed.MethodDefinition();
            }
            MethodDef.prototype.read = function (reader) {
                this.rva = reader.readInt();
                this.method.implAttributes = reader.readShort();
                this.method.attributes = reader.readShort();
                this.method.name = reader.readString();
                this.signature = reader.readBlob();
                this.paramList = reader.readTableRowIndex(managed.TableTypes().Param.index);
            };
            return MethodDef;
        })();
        managed.MethodDef = MethodDef;        
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        var TypeDef = (function () {
            function TypeDef() {
                this.type = new managed.TypeDefinition();
            }
            TypeDef.prototype.read = function (reader) {
                this.type.attributes = reader.readInt();
                this.type.name = reader.readString();
                this.type.namespace = reader.readString();
                this.type.extendsType = reader.readTypeDefOrRef();
                this.fieldList = reader.readTableRowIndex(managed.TableTypes().Field.index);
                this.methodList = reader.readTableRowIndex(managed.TableTypes().MethodDef.index);
            };
            return TypeDef;
        })();
        managed.TypeDef = TypeDef;        
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        var TableType = (function () {
            function TableType(name, index, comments, ctor, read) {
                this.name = name;
                this.index = index;
                this.comments = comments;
                this.ctor = ctor;
                if(read) {
                    this.read = read;
                }
            }
            TableType.prototype.read = function (row, reader) {
                row.read(reader);
            };
            return TableType;
        })();
        managed.TableType = TableType;        
        var cachedTableTypes;
        function TableTypes() {
            return cachedTableTypes ? cachedTableTypes : cachedTableTypes = createTableTypes();
        }
        managed.TableTypes = TableTypes;
        ; ;
        function createTableTypes() {
            var TableTypes = [];
            TableTypes.Module = new TableType("Module", 0, "The rows in the Module table result from .module directives in the Assembly.", pe.managed.ModuleDefinition, managed.readModuleDefinition);
            TableTypes.TypeRef = new TableType("TypeRef", 1, "Contains ResolutionScope, TypeName and TypeNamespace columns.", managed.TypeReference, managed.readTypeReference);
            TableTypes.TypeDef = new TableType("TypeDef", 2, "The first row of the TypeDef table represents the pseudo class that acts as parent for functions and variables" + "defined at module scope." + "If a type is generic, its parameters are defined in the GenericParam table (§22.20). Entries in the" + "GenericParam table reference entries in the TypeDef table; there is no reference from the TypeDef table to the" + "GenericParam table.", managed.TypeDef);
            TableTypes.Field = new TableType("Field", 4, "Each row in the Field table results from a top-level .field directive, or a .field directive inside a" + "Type.", managed.FieldDef);
            TableTypes.MethodDef = new TableType("MethodDef", 6, "Conceptually, every row in the MethodDef table is owned by one, and only one, row in the TypeDef table." + "The rows in the MethodDef table result from .method directives (§15). The RVA column is computed when" + "the image for the PE file is emitted and points to the COR_ILMETHOD structure for the body of the method.", managed.MethodDef);
            TableTypes.Param = new TableType("Param", 8, "Conceptually, every row in the Param table is owned by one, and only one, row in the MethodDef table." + "The rows in the Param table result from the parameters in a method declaration (§15.4), or from a .param" + "attribute attached to a method.", null);
            TableTypes.InterfaceImpl = new TableType("InterfaceImpl", 9, "Records the interfaces a type implements explicitly.  Conceptually, each row in the" + "InterfaceImpl table indicates that Class implements Interface.", null);
            TableTypes.MemberRef = new TableType("MemberRef", 10, "Combines two sorts of references, to Methods and to Fields of a class, known as 'MethodRef' and 'FieldRef', respectively." + "An entry is made into the MemberRef table whenever a reference is made in the CIL code to a method or field" + "which is defined in another module or assembly.  (Also, an entry is made for a call to a method with a VARARG" + "signature, even when it is defined in the same module as the call site.)", null);
            TableTypes.Constant = new TableType("Constant", 11, "Used to store compile-time, constant values for fields, parameters, and properties.", null);
            TableTypes.CustomAttribute = new TableType("CustomAttribute", 12, "Stores data that can be used to instantiate a Custom Attribute (more precisely, an" + "object of the specified Custom Attribute class) at runtime." + "A row in the CustomAttribute table for a parent is created by the .custom attribute, which gives the value of" + "the Type column and optionally that of the Value column.", null);
            TableTypes.FieldMarshal = new TableType("FieldMarshal", 13, "The FieldMarshal table  'links' an existing row in the Field or Param table, to information" + "in the Blob heap that defines how that field or parameter (which, as usual, covers the method return, as" + "parameter number 0) shall be marshalled when calling to or from unmanaged code via PInvoke dispatch." + "A row in the FieldMarshal table is created if the .field directive for the parent field has specified a marshal attribute.", null);
            TableTypes.DeclSecurity = new TableType("DeclSecurity", 14, "The rows of the DeclSecurity table are filled by attaching a .permission or .permissionset directive" + "that specifies the Action and PermissionSet on a parent assembly or parent type or method.", null);
            TableTypes.ClassLayout = new TableType("ClassLayout", 15, "Used to define how the fields of a class or value type shall be laid out by the CLI." + "(Normally, the CLI is free to reorder and/or insert gaps between the fields defined for a class or value type.)", null);
            TableTypes.FieldLayout = new TableType("FieldLayout", 16, "A row in the FieldLayout table is created if the .field directive for the parent field has specified a field offset.", null);
            TableTypes.StandAloneSig = new TableType("StandAloneSig", 17, "Signatures are stored in the metadata Blob heap.  In most cases, they are indexed by a column in some table —" + "Field.Signature, Method.Signature, MemberRef.Signature, etc.  However, there are two cases that require a" + "metadata token for a signature that is not indexed by any metadata table.  The StandAloneSig table fulfils this" + "need.  It has just one column, which points to a Signature in the Blob heap.", null);
            TableTypes.EventMap = new TableType("EventMap", 18, "The EventMap and Event tables result from putting the .event directive on a class.", null);
            TableTypes.Event = new TableType("Event", 20, "The EventMap and Event tables result from putting the .event directive on a class.", null);
            TableTypes.PropertyMap = new TableType("PropertyMap", 21, "The PropertyMap and Property tables result from putting the .property directive on a class.", null);
            TableTypes.Property = new TableType("Property", 23, "Does a little more than group together existing rows from other tables.", null);
            TableTypes.MethodSemantics = new TableType("MethodSemantics", 24, "The rows of the MethodSemantics table are filled by .property and .event directives.", null);
            TableTypes.MethodImpl = new TableType("MethodImpl", 25, "s let a compiler override the default inheritance rules provided by the CLI. Their original use" + "was to allow a class C, that inherited method M from both interfaces I and J, to provide implementations for" + "both methods (rather than have only one slot for M in its vtable). However, MethodImpls can be used for other" + "reasons too, limited only by the compiler writer‘s ingenuity within the constraints defined in the Validation rules." + "ILAsm uses the .override directive to specify the rows of the MethodImpl table.", null);
            TableTypes.ModuleRef = new TableType("ModuleRef", 26, "The rows in the ModuleRef table result from .module extern directives in the Assembly.", null);
            TableTypes.TypeSpec = new TableType("TypeSpec", 27, "Contains just one column, which indexes the specification of a Type, stored in the Blob heap." + "This provides a metadata token for that Type (rather than simply an index into the Blob heap)." + "This is required, typically, for array operations, such as creating, or calling methods on the array class." + "Note that TypeSpec tokens can be used with any of the CIL instructions that take a TypeDef or TypeRef token;" + "specifically, castclass, cpobj, initobj, isinst, ldelema, ldobj, mkrefany, newarr, refanyval, sizeof, stobj, box, and unbox.", null);
            TableTypes.ImplMap = new TableType("ImplMap", 28, "Holds information about unmanaged methods that can be reached from managed code, using PInvoke dispatch." + "A row is entered in the ImplMap table for each parent Method (§15.5) that is defined with a .pinvokeimpl" + "interoperation attribute specifying the MappingFlags, ImportName, and ImportScope.", null);
            TableTypes.FieldRVA = new TableType("FieldRVA", 29, "Conceptually, each row in the FieldRVA table is an extension to exactly one row in the Field table, and records" + "the RVA (Relative Virtual Address) within the image file at which this field‘s initial value is stored." + "A row in the FieldRVA table is created for each static parent field that has specified the optional data" + "label.  The RVA column is the relative virtual address of the data in the PE file.", null);
            TableTypes.Assembly = new TableType("Assembly", 32, "ECMA-335 §22.2.", null);
            TableTypes.AssemblyProcessor = new TableType("AssemblyProcessor", 33, "ECMA-335 §22.4 Shall be ignored by the CLI.", null);
            TableTypes.AssemblyOS = new TableType("AssemblyOS", 34, "ECMA-335 §22.3 Shall be ignored by the CLI.", null);
            TableTypes.AssemblyRef = new TableType("AssemblyRef", 35, "The table is defined by the .assembly extern directive (§6.3).  Its columns are filled using directives" + "similar to those of the Assembly table except for the PublicKeyOrToken column, which is defined using the" + ".publickeytoken directive.", null);
            TableTypes.AssemblyRefProcessor = new TableType("AssemblyRefProcessor", 36, "ECMA-335 §22.7 Shall be ignored by the CLI.", null);
            TableTypes.AssemblyRefOS = new TableType("AssemblyRefOS", 37, "ECMA-335 §22.6 Shall be ignored by the CLI.", null);
            TableTypes.File = new TableType("File", 38, "The rows of the File table result from .file directives in an Assembly.", null);
            TableTypes.ExportedType = new TableType("ExportedType", 39, "Holds a row for each type:" + "a. Defined within other modules of this Assembly; that is exported out of this Assembly." + "In essence, it stores TypeDef row numbers of all types that are marked public in other modules" + "that this Assembly comprises." + "The actual target row in a TypeDef table is given by the combination of TypeDefId (in effect, row number)" + "and Implementation (in effect, the module that holds the target TypeDef table)." + "Note that this is the only occurrence in metadata of foreign tokens;" + "that is, token values that have a meaning in another module." + "(A regular token value is an index into a table in the current module);" + "OR" + "b. Originally defined in this Assembly but now moved to another Assembly." + "Flags must have IsTypeForwarder set and Implementation is an AssemblyRef indicating" + "the Assembly the type may now be found in.", null);
            TableTypes.ManifestResource = new TableType("ManifestResource", 40, "The rows in the table result from .mresource directives on the Assembly.", null);
            TableTypes.NestedClass = new TableType("NestedClass", 41, "NestedClass is defined as lexically 'inside' the text of its enclosing Type.", null);
            TableTypes.GenericParam = new TableType("GenericParam", 42, "Stores the generic parameters used in generic type definitions and generic method" + "definitions.  These generic parameters can be constrained (i.e., generic arguments shall extend some class" + "and/or implement certain interfaces) or unconstrained.  (Such constraints are stored in the" + "GenericParamConstraint table.)" + "Conceptually, each row in the GenericParam table is owned by one, and only one, row in either the TypeDef or" + "MethodDef tables.", null);
            TableTypes.MethodSpec = new TableType("MethodSpec", 43, "Records the signature of an instantiated generic method." + "Each unique instantiation of a generic method (i.e., a combination of Method and Instantiation) shall be" + "represented by a single row in the table.", null);
            TableTypes.GenericParamConstraint = new TableType("GenericParamConstraint", 44, "Records the constraints for each generic parameter.  Each generic parameter" + "can be constrained to derive from zero or one class.  Each generic parameter can be constrained to implement" + "zero or more interfaces." + "Conceptually, each row in the GenericParamConstraint table is ‗owned‘ by a row in the GenericParam table.", null);
            (TableTypes)[0] = TableTypes.Module;
            (TableTypes)[1] = TableTypes.TypeRef;
            (TableTypes)[2] = TableTypes.TypeDef;
            (TableTypes)[4] = TableTypes.Field;
            (TableTypes)[6] = TableTypes.MethodDef;
            (TableTypes)[8] = TableTypes.Param;
            (TableTypes)[9] = TableTypes.InterfaceImpl;
            (TableTypes)[10] = TableTypes.MemberRef;
            (TableTypes)[11] = TableTypes.Constant;
            (TableTypes)[12] = TableTypes.CustomAttribute;
            (TableTypes)[13] = TableTypes.FieldMarshal;
            (TableTypes)[14] = TableTypes.DeclSecurity;
            (TableTypes)[15] = TableTypes.ClassLayout;
            (TableTypes)[16] = TableTypes.FieldLayout;
            (TableTypes)[17] = TableTypes.StandAloneSig;
            (TableTypes)[18] = TableTypes.EventMap;
            (TableTypes)[20] = TableTypes.Event;
            (TableTypes)[21] = TableTypes.PropertyMap;
            (TableTypes)[23] = TableTypes.Property;
            (TableTypes)[24] = TableTypes.MethodSemantics;
            (TableTypes)[25] = TableTypes.MethodImpl;
            (TableTypes)[26] = TableTypes.ModuleRef;
            (TableTypes)[27] = TableTypes.TypeSpec;
            (TableTypes)[28] = TableTypes.ImplMap;
            (TableTypes)[29] = TableTypes.FieldRVA;
            (TableTypes)[32] = TableTypes.Assembly;
            (TableTypes)[33] = TableTypes.AssemblyProcessor;
            (TableTypes)[34] = TableTypes.AssemblyOS;
            (TableTypes)[35] = TableTypes.AssemblyRef;
            (TableTypes)[36] = TableTypes.AssemblyRefProcessor;
            (TableTypes)[37] = TableTypes.AssemblyRefOS;
            (TableTypes)[38] = TableTypes.File;
            (TableTypes)[39] = TableTypes.ExportedType;
            (TableTypes)[40] = TableTypes.ManifestResource;
            (TableTypes)[41] = TableTypes.NestedClass;
            (TableTypes)[42] = TableTypes.GenericParam;
            (TableTypes)[43] = TableTypes.MethodSpec;
            (TableTypes)[44] = TableTypes.GenericParamConstraint;
            return TableTypes;
        }
        ; ;
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
                TableStream.prototype.read = function (tableReader, streams) {
                    this.reserved0 = tableReader.readInt();
                    this.version = tableReader.readByte() + "." + tableReader.readByte();
                    this.heapSizes = tableReader.readByte();
                    this.reserved1 = tableReader.readByte();
                    var valid = tableReader.readLong();
                    var sorted = tableReader.readLong();
                    this.initTables(tableReader, valid);
                    this.readTables(tableReader, streams);
                };
                TableStream.prototype.initTables = function (reader, valid) {
                    this.tables = Array(managed.TableTypes().length);
                    var bits = valid.lo;
                    for(var tableIndex = 0; tableIndex < 32; tableIndex++) {
                        if(bits & 1) {
                            var rowCount = reader.readInt();
                            this.initTable(tableIndex, rowCount);
                        }
                        bits = bits >> 1;
                    }
                    bits = valid.hi;
                    for(var i = 0; i < 32; i++) {
                        var tableIndex = i + 32;
                        if(bits & 1) {
                            var rowCount = reader.readInt();
                            this.initTable(tableIndex, rowCount);
                        }
                        bits = bits >> 1;
                    }
                };
                TableStream.prototype.initTable = function (tableIndex, rowCount) {
                    var tableRows = this.tables[tableIndex] = Array(rowCount);
                    if(managed.TableTypes()[tableIndex].ctor) {
                        for(var i = 0; i < rowCount; i++) {
                            if(!tableRows[i]) {
                                var ctor = managed.TableTypes()[tableIndex].ctor;
                                tableRows[i] = new ctor();
                            }
                        }
                    }
                };
                TableStream.prototype.readTables = function (reader, streams) {
                    var tableStreamReader = new managed.TableStreamReader(reader, streams, this.tables);
                    for(var tableIndex = 0; tableIndex < managed.TableTypes().length; tableIndex++) {
                        var tableRows = this.tables[tableIndex];
                        if(!tableRows) {
                            continue;
                        }
                        var read = managed.TableTypes()[tableIndex].read;
                        if(!read) {
                            continue;
                        }
                        for(var i = 0; i < tableRows.length; i++) {
                            read(tableRows[i], tableStreamReader);
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
        var ModuleDefinition = (function () {
            function ModuleDefinition() {
                this.runtimeVersion = "";
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
            return ModuleDefinition;
        })();
        managed.ModuleDefinition = ModuleDefinition;        
        var TypeReference = (function () {
            function TypeReference() { }
            return TypeReference;
        })();
        managed.TypeReference = TypeReference;        
        var TypeDefinition = (function () {
            function TypeDefinition() {
                this.attributes = 0;
                this.name = "";
                this.namespace = "";
                this.fields = [];
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
            return MethodDefinition;
        })();
        managed.MethodDefinition = MethodDefinition;        
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
//@ sourceMappingURL=pe.js.map
