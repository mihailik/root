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
var test_DataDirectory;
(function (test_DataDirectory) {
    function constructor_succeeds() {
        var dd = new pe.headers.AddressRange(0, 0);
    }
    test_DataDirectory.constructor_succeeds = constructor_succeeds;
    function constructor_assigns_address_654201() {
        var dd = new pe.headers.AddressRange(654201, 0);
        if(dd.address !== 654201) {
            throw dd.address;
        }
    }
    test_DataDirectory.constructor_assigns_address_654201 = constructor_assigns_address_654201;
    function constructor_assigns_size_900114() {
        var dd = new pe.headers.AddressRange(0, 900114);
        if(dd.size !== 900114) {
            throw dd.size;
        }
    }
    test_DataDirectory.constructor_assigns_size_900114 = constructor_assigns_size_900114;
    function toString_0xCEF_0x36A() {
        var dd = new pe.headers.AddressRange(3311, 874);
        if(dd.toString() !== "CEF:36Ah") {
            throw dd.toString();
        }
    }
    test_DataDirectory.toString_0xCEF_0x36A = toString_0xCEF_0x36A;
    function contains_default_0_false() {
        var dd = new pe.headers.AddressRange(0, 0);
        if(dd.contains(0) !== false) {
            throw dd.contains(0);
        }
    }
    test_DataDirectory.contains_default_0_false = contains_default_0_false;
    function contains_default_64_false() {
        var dd = new pe.headers.AddressRange(0, 0);
        if(dd.contains(64) !== false) {
            throw dd.contains(64);
        }
    }
    test_DataDirectory.contains_default_64_false = contains_default_64_false;
    function contains_default_minus64_false() {
        var dd = new pe.headers.AddressRange(0, 0);
        if(dd.contains(-64) !== false) {
            throw dd.contains(-64);
        }
    }
    test_DataDirectory.contains_default_minus64_false = contains_default_minus64_false;
    function contains_lowerEnd_below_false() {
        var dd = new pe.headers.AddressRange(10, 20);
        if(dd.contains(9) !== false) {
            throw dd.contains(9);
        }
    }
    test_DataDirectory.contains_lowerEnd_below_false = contains_lowerEnd_below_false;
    function contains_lowerEnd_equal_true() {
        var dd = new pe.headers.AddressRange(10, 20);
        if(dd.contains(10) !== true) {
            throw dd.contains(10);
        }
    }
    test_DataDirectory.contains_lowerEnd_equal_true = contains_lowerEnd_equal_true;
    function contains_lowerEnd_above_true() {
        var dd = new pe.headers.AddressRange(10, 20);
        if(dd.contains(11) !== true) {
            throw dd.contains(11);
        }
    }
    test_DataDirectory.contains_lowerEnd_above_true = contains_lowerEnd_above_true;
    function contains_lowerEndPlusSize_above_false() {
        var dd = new pe.headers.AddressRange(10, 20);
        if(dd.contains(31) !== false) {
            throw dd.contains(31);
        }
    }
    test_DataDirectory.contains_lowerEndPlusSize_above_false = contains_lowerEndPlusSize_above_false;
    function contains_lowerEndPlusSize_equal_false() {
        var dd = new pe.headers.AddressRange(10, 20);
        if(dd.contains(30) !== false) {
            throw dd.contains(30);
        }
    }
    test_DataDirectory.contains_lowerEndPlusSize_equal_false = contains_lowerEndPlusSize_equal_false;
    function contains_lowerEndPlusSize_below_true() {
        var dd = new pe.headers.AddressRange(10, 20);
        if(dd.contains(29) !== true) {
            throw dd.contains(29);
        }
    }
    test_DataDirectory.contains_lowerEndPlusSize_below_true = contains_lowerEndPlusSize_below_true;
})(test_DataDirectory || (test_DataDirectory = {}));
var test_Long;
(function (test_Long) {
    function constructor_succeeds() {
        var lg = new pe.Long(0, 0);
    }
    test_Long.constructor_succeeds = constructor_succeeds;
    function constructor_assigns_lo_602048() {
        var lg = new pe.Long(602048, 0);
        if(lg.lo !== 602048) {
            throw lg.lo;
        }
    }
    test_Long.constructor_assigns_lo_602048 = constructor_assigns_lo_602048;
    function constructor_assigns_hi_2130006() {
        var lg = new pe.Long(0, 2130006);
        if(lg.hi !== 2130006) {
            throw lg.hi;
        }
    }
    test_Long.constructor_assigns_hi_2130006 = constructor_assigns_hi_2130006;
    function toString_zeros() {
        var lg = new pe.Long(0, 0);
        if(lg.toString() !== "0h") {
            throw lg.toString();
        }
    }
    test_Long.toString_zeros = toString_zeros;
    function toString_1() {
        var lg = new pe.Long(1, 0);
        if(lg.toString() !== "1h") {
            throw lg.toString();
        }
    }
    test_Long.toString_1 = toString_1;
    function toString_0xB() {
        var lg = new pe.Long(11, 0);
        if(lg.toString() !== "Bh") {
            throw lg.toString();
        }
    }
    test_Long.toString_0xB = toString_0xB;
    function toString_0xFFFF() {
        var lg = new pe.Long(65535, 0);
        if(lg.toString() !== "FFFFh") {
            throw lg.toString();
        }
    }
    test_Long.toString_0xFFFF = toString_0xFFFF;
    function toString_0xFFFF0() {
        var lg = new pe.Long(65520, 15);
        if(lg.toString() !== "FFFF0h") {
            throw lg.toString();
        }
    }
    test_Long.toString_0xFFFF0 = toString_0xFFFF0;
    function toString_0xFFFFFFFF() {
        var lg = new pe.Long(65535, 65535);
        if(lg.toString() !== "FFFFFFFFh") {
            throw lg.toString();
        }
    }
    test_Long.toString_0xFFFFFFFF = toString_0xFFFFFFFF;
})(test_Long || (test_Long = {}));
var test_DosHeader;
(function (test_DosHeader) {
    function constructor_succeeds() {
        var doh = new pe.headers.DosHeader();
    }
    test_DosHeader.constructor_succeeds = constructor_succeeds;
    function mz_defaultMZ() {
        var doh = new pe.headers.DosHeader();
        if(doh.mz !== pe.headers.MZSignature.MZ) {
            throw doh.mz;
        }
    }
    test_DosHeader.mz_defaultMZ = mz_defaultMZ;
    function cblp_default144() {
        var doh = new pe.headers.DosHeader();
        if(doh.cblp !== 144) {
            throw doh.cblp;
        }
    }
    test_DosHeader.cblp_default144 = cblp_default144;
    function cp_default3() {
        var doh = new pe.headers.DosHeader();
        if(doh.cp !== 3) {
            throw doh.cp;
        }
    }
    test_DosHeader.cp_default3 = cp_default3;
    function crlc_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.crlc !== 0) {
            throw doh.crlc;
        }
    }
    test_DosHeader.crlc_default0 = crlc_default0;
    function cparhdr_default4() {
        var doh = new pe.headers.DosHeader();
        if(doh.cparhdr !== 4) {
            throw doh.cparhdr;
        }
    }
    test_DosHeader.cparhdr_default4 = cparhdr_default4;
    function minalloc_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.minalloc !== 0) {
            throw doh.minalloc;
        }
    }
    test_DosHeader.minalloc_default0 = minalloc_default0;
    function maxalloc_default65535() {
        var doh = new pe.headers.DosHeader();
        if(doh.maxalloc !== 65535) {
            throw doh.maxalloc;
        }
    }
    test_DosHeader.maxalloc_default65535 = maxalloc_default65535;
    function ss_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.ss !== 0) {
            throw doh.ss;
        }
    }
    test_DosHeader.ss_default0 = ss_default0;
    function sp_default184() {
        var doh = new pe.headers.DosHeader();
        if(doh.sp !== 184) {
            throw doh.sp;
        }
    }
    test_DosHeader.sp_default184 = sp_default184;
    function csum_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.csum !== 0) {
            throw doh.csum;
        }
    }
    test_DosHeader.csum_default0 = csum_default0;
    function cs_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.cs !== 0) {
            throw doh.cs;
        }
    }
    test_DosHeader.cs_default0 = cs_default0;
    function lfarlc_default64() {
        var doh = new pe.headers.DosHeader();
        if(doh.lfarlc !== 64) {
            throw doh.lfarlc;
        }
    }
    test_DosHeader.lfarlc_default64 = lfarlc_default64;
    function ovno_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.ovno !== 0) {
            throw doh.ovno;
        }
    }
    test_DosHeader.ovno_default0 = ovno_default0;
    function res1_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.res1.hi !== 0 || doh.res1.lo !== 0) {
            throw doh.res1;
        }
    }
    test_DosHeader.res1_default0 = res1_default0;
    function oemid_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.oemid !== 0) {
            throw doh.oemid;
        }
    }
    test_DosHeader.oemid_default0 = oemid_default0;
    function oeminfo_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.oeminfo !== 0) {
            throw doh.oeminfo;
        }
    }
    test_DosHeader.oeminfo_default0 = oeminfo_default0;
    function reserved_defaultArray5() {
        var doh = new pe.headers.DosHeader();
        if(doh.reserved.length !== 5 || doh.reserved[0] !== 0 || doh.reserved[1] !== 0 || doh.reserved[2] !== 0 || doh.reserved[3] !== 0 || doh.reserved[4] !== 0) {
            throw doh.reserved;
        }
    }
    test_DosHeader.reserved_defaultArray5 = reserved_defaultArray5;
    function lfanew_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.lfanew !== 0) {
            throw doh.lfanew;
        }
    }
    test_DosHeader.lfanew_default0 = lfanew_default0;
    function toString_default() {
        var doh = new pe.headers.DosHeader();
        if(doh.toString() !== "[MZ].lfanew=0h") {
            throw doh.toString();
        }
    }
    test_DosHeader.toString_default = toString_default;
    function toString_mz_oxEA() {
        var doh = new pe.headers.DosHeader();
        doh.mz = 234;
        if(doh.toString() !== "[EAh].lfanew=0h") {
            throw doh.toString();
        }
    }
    test_DosHeader.toString_mz_oxEA = toString_mz_oxEA;
    function toString_lfanew_oxFF803() {
        var doh = new pe.headers.DosHeader();
        doh.lfanew = 1046531;
        if(doh.toString() !== "[MZ].lfanew=FF803h") {
            throw doh.toString();
        }
    }
    test_DosHeader.toString_lfanew_oxFF803 = toString_lfanew_oxFF803;
})(test_DosHeader || (test_DosHeader = {}));
var test_OptionalHeader;
(function (test_OptionalHeader) {
    function constructor_succeeds() {
        var oph = new pe.headers.OptionalHeader();
    }
    test_OptionalHeader.constructor_succeeds = constructor_succeeds;
    function peMagic_defaultNT32() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.peMagic !== pe.headers.PEMagic.NT32) {
            throw oph.peMagic;
        }
    }
    test_OptionalHeader.peMagic_defaultNT32 = peMagic_defaultNT32;
    function linkerVersion_defaultEmptyString() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.linkerVersion !== "") {
            throw oph.linkerVersion;
        }
    }
    test_OptionalHeader.linkerVersion_defaultEmptyString = linkerVersion_defaultEmptyString;
    function sizeOfCode_default0() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sizeOfCode !== 0) {
            throw oph.sizeOfCode;
        }
    }
    test_OptionalHeader.sizeOfCode_default0 = sizeOfCode_default0;
    function sizeOfInitializedData_default0() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sizeOfInitializedData !== 0) {
            throw oph.sizeOfInitializedData;
        }
    }
    test_OptionalHeader.sizeOfInitializedData_default0 = sizeOfInitializedData_default0;
    function sizeOfUninitializedData_default0() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sizeOfUninitializedData !== 0) {
            throw oph.sizeOfUninitializedData;
        }
    }
    test_OptionalHeader.sizeOfUninitializedData_default0 = sizeOfUninitializedData_default0;
    function addressOfEntryPoint_default0() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.addressOfEntryPoint !== 0) {
            throw oph.addressOfEntryPoint;
        }
    }
    test_OptionalHeader.addressOfEntryPoint_default0 = addressOfEntryPoint_default0;
    function baseOfCode_default0x2000() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.baseOfCode !== 8192) {
            throw oph.baseOfCode;
        }
    }
    test_OptionalHeader.baseOfCode_default0x2000 = baseOfCode_default0x2000;
    function baseOfData_default0x4000() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.baseOfData !== 16384) {
            throw oph.baseOfData;
        }
    }
    test_OptionalHeader.baseOfData_default0x4000 = baseOfData_default0x4000;
    function imageBase_default0x4000() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.imageBase !== 16384) {
            throw oph.imageBase;
        }
    }
    test_OptionalHeader.imageBase_default0x4000 = imageBase_default0x4000;
    function sectionAlignment_default0x2000() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sectionAlignment !== 8192) {
            throw oph.sectionAlignment;
        }
    }
    test_OptionalHeader.sectionAlignment_default0x2000 = sectionAlignment_default0x2000;
    function fileAlignment_default0x200() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.fileAlignment !== 512) {
            throw oph.fileAlignment;
        }
    }
    test_OptionalHeader.fileAlignment_default0x200 = fileAlignment_default0x200;
    function operatingSystemVersion_defaultEmptyString() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.operatingSystemVersion !== "") {
            throw oph.operatingSystemVersion;
        }
    }
    test_OptionalHeader.operatingSystemVersion_defaultEmptyString = operatingSystemVersion_defaultEmptyString;
    function imageVersion_defaultEmptyString() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.imageVersion !== "") {
            throw oph.imageVersion;
        }
    }
    test_OptionalHeader.imageVersion_defaultEmptyString = imageVersion_defaultEmptyString;
    function subsystemVersion_defaultEmptyString() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.subsystemVersion !== "") {
            throw oph.subsystemVersion;
        }
    }
    test_OptionalHeader.subsystemVersion_defaultEmptyString = subsystemVersion_defaultEmptyString;
    function win32VersionValue_default0() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.win32VersionValue !== 0) {
            throw oph.win32VersionValue;
        }
    }
    test_OptionalHeader.win32VersionValue_default0 = win32VersionValue_default0;
    function sizeOfImage_default0() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sizeOfImage !== 0) {
            throw oph.sizeOfImage;
        }
    }
    test_OptionalHeader.sizeOfImage_default0 = sizeOfImage_default0;
    function sizeOfHeaders_default0() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sizeOfHeaders !== 0) {
            throw oph.sizeOfHeaders;
        }
    }
    test_OptionalHeader.sizeOfHeaders_default0 = sizeOfHeaders_default0;
    function checkSum_default0() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.checkSum !== 0) {
            throw oph.checkSum;
        }
    }
    test_OptionalHeader.checkSum_default0 = checkSum_default0;
    function subsystem_defaultWindowsCUI() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.subsystem !== pe.headers.Subsystem.WindowsCUI) {
            throw oph.subsystem;
        }
    }
    test_OptionalHeader.subsystem_defaultWindowsCUI = subsystem_defaultWindowsCUI;
    function dllCharacteristics_defaultNxCompatible() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.dllCharacteristics !== pe.headers.DllCharacteristics.NxCompatible) {
            throw oph.dllCharacteristics;
        }
    }
    test_OptionalHeader.dllCharacteristics_defaultNxCompatible = dllCharacteristics_defaultNxCompatible;
    function sizeOfStackReserve_default0x100000() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sizeOfStackReserve !== 1048576) {
            throw oph.sizeOfStackReserve;
        }
    }
    test_OptionalHeader.sizeOfStackReserve_default0x100000 = sizeOfStackReserve_default0x100000;
    function sizeOfStackCommit_default0x1000() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sizeOfStackCommit !== 4096) {
            throw oph.sizeOfStackCommit;
        }
    }
    test_OptionalHeader.sizeOfStackCommit_default0x1000 = sizeOfStackCommit_default0x1000;
    function sizeOfHeapReserve_default0x100000() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sizeOfHeapReserve !== 1048576) {
            throw oph.sizeOfHeapReserve;
        }
    }
    test_OptionalHeader.sizeOfHeapReserve_default0x100000 = sizeOfHeapReserve_default0x100000;
    function sizeOfHeapCommit_default0x1000() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sizeOfHeapCommit !== 4096) {
            throw oph.sizeOfHeapCommit;
        }
    }
    test_OptionalHeader.sizeOfHeapCommit_default0x1000 = sizeOfHeapCommit_default0x1000;
    function loaderFlags_default0() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.loaderFlags !== 0) {
            throw oph.loaderFlags;
        }
    }
    test_OptionalHeader.loaderFlags_default0 = loaderFlags_default0;
    function numberOfRvaAndSizes_default16() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.numberOfRvaAndSizes !== 16) {
            throw oph.numberOfRvaAndSizes;
        }
    }
    test_OptionalHeader.numberOfRvaAndSizes_default16 = numberOfRvaAndSizes_default16;
    function dataDirectories_defaultZeroLength() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.dataDirectories.length !== 0) {
            throw oph.dataDirectories.length;
        }
    }
    test_OptionalHeader.dataDirectories_defaultZeroLength = dataDirectories_defaultZeroLength;
    function toString_default() {
        var oph = new pe.headers.OptionalHeader();
        var expectedString = oph.peMagic + " " + oph.subsystem + " " + oph.dllCharacteristics + " dataDirectories[]";
        if(oph.toString() !== expectedString) {
            throw oph.toString() + " expected " + expectedString;
        }
    }
    test_OptionalHeader.toString_default = toString_default;
    function toString_dataDirectories_1and7() {
        var oph = new pe.headers.OptionalHeader();
        oph.dataDirectories[1] = new pe.headers.AddressRange(1, 1);
        oph.dataDirectories[7] = new pe.headers.AddressRange(2, 2);
        var expectedString = oph.peMagic + " " + oph.subsystem + " " + oph.dllCharacteristics + " dataDirectories[1,7]";
        if(oph.toString() !== expectedString) {
            throw oph.toString() + " expected " + expectedString;
        }
    }
    test_OptionalHeader.toString_dataDirectories_1and7 = toString_dataDirectories_1and7;
})(test_OptionalHeader || (test_OptionalHeader = {}));
var test_PEFile;
(function (test_PEFile) {
    function constructor_succeeds() {
        var pefi = new pe.headers.PEFile();
    }
    test_PEFile.constructor_succeeds = constructor_succeeds;
    function dosHeader_defaultNotNull() {
        var pefi = new pe.headers.PEFile();
        if(!pefi.dosHeader) {
            throw pefi.dosHeader;
        }
    }
    test_PEFile.dosHeader_defaultNotNull = dosHeader_defaultNotNull;
    function peHeader_defaultNotNull() {
        var pefi = new pe.headers.PEFile();
        if(!pefi.peHeader) {
            throw pefi.peHeader;
        }
    }
    test_PEFile.peHeader_defaultNotNull = peHeader_defaultNotNull;
    function optionalHeader_defaultNotNull() {
        var pefi = new pe.headers.PEFile();
        if(!pefi.optionalHeader) {
            throw pefi.optionalHeader;
        }
    }
    test_PEFile.optionalHeader_defaultNotNull = optionalHeader_defaultNotNull;
    function sectionHeaders_defaultZeroLength() {
        var pefi = new pe.headers.PEFile();
        if(pefi.sectionHeaders.length !== 0) {
            throw pefi.sectionHeaders.length;
        }
    }
    test_PEFile.sectionHeaders_defaultZeroLength = sectionHeaders_defaultZeroLength;
    function toString_default() {
        var pefi = new pe.headers.PEFile();
        var expectedToString = "dosHeader: " + pefi.dosHeader + " dosStub: null" + " peHeader: [" + pefi.peHeader.machine + "]" + " optionalHeader: [" + pefi.optionalHeader.subsystem + "," + pefi.optionalHeader.imageVersion + "]" + " sectionHeaders: [0]";
        if(pefi.toString() !== expectedToString) {
            throw pefi.toString() + " instead of expected " + expectedToString;
        }
    }
    test_PEFile.toString_default = toString_default;
})(test_PEFile || (test_PEFile = {}));
var test_PEHeader;
(function (test_PEHeader) {
    function constructor_succeeds() {
        var peh = new pe.headers.PEHeader();
    }
    test_PEHeader.constructor_succeeds = constructor_succeeds;
    function pe_defaultPE() {
        var peh = new pe.headers.PEHeader();
        if(peh.pe !== pe.headers.PESignature.PE) {
            throw peh.pe;
        }
    }
    test_PEHeader.pe_defaultPE = pe_defaultPE;
    function machine_defaultI386() {
        var peh = new pe.headers.PEHeader();
        if(peh.machine !== pe.headers.Machine.I386) {
            throw peh.machine;
        }
    }
    test_PEHeader.machine_defaultI386 = machine_defaultI386;
    function numberOfSections_default0() {
        var peh = new pe.headers.PEHeader();
        if(peh.numberOfSections !== 0) {
            throw peh.numberOfSections;
        }
    }
    test_PEHeader.numberOfSections_default0 = numberOfSections_default0;
    function timestamp_defaultZeroDate() {
        var peh = new pe.headers.PEHeader();
        if(peh.timestamp.getTime() !== new Date(0).getTime()) {
            throw peh.timestamp;
        }
    }
    test_PEHeader.timestamp_defaultZeroDate = timestamp_defaultZeroDate;
    function pointerToSymbolTable_default0() {
        var peh = new pe.headers.PEHeader();
        if(peh.pointerToSymbolTable !== 0) {
            throw peh.pointerToSymbolTable;
        }
    }
    test_PEHeader.pointerToSymbolTable_default0 = pointerToSymbolTable_default0;
    function numberOfSymbols_default0() {
        var peh = new pe.headers.PEHeader();
        if(peh.numberOfSymbols !== 0) {
            throw peh.numberOfSymbols;
        }
    }
    test_PEHeader.numberOfSymbols_default0 = numberOfSymbols_default0;
    function sizeOfOptionalHeader_default0() {
        var peh = new pe.headers.PEHeader();
        if(peh.sizeOfOptionalHeader !== 0) {
            throw peh.sizeOfOptionalHeader;
        }
    }
    test_PEHeader.sizeOfOptionalHeader_default0 = sizeOfOptionalHeader_default0;
    function characteristics_defaultDll() {
        var peh = new pe.headers.PEHeader();
        var expected = pe.headers.ImageCharacteristics.Dll | pe.headers.ImageCharacteristics.Bit32Machine;
        if(peh.characteristics !== expected) {
            throw peh.characteristics + " expected " + expected;
        }
    }
    test_PEHeader.characteristics_defaultDll = characteristics_defaultDll;
    function toString_default() {
        var peh = new pe.headers.PEHeader();
        if(peh.toString() !== peh.machine + " " + peh.characteristics + " Sections[0]") {
            throw peh.toString();
        }
    }
    test_PEHeader.toString_default = toString_default;
})(test_PEHeader || (test_PEHeader = {}));
var test_SectionHeader;
(function (test_SectionHeader) {
    function constructor_succeeds() {
        var seh = new pe.headers.SectionHeader();
    }
    test_SectionHeader.constructor_succeeds = constructor_succeeds;
    function name_defaultEmptyString() {
        var seh = new pe.headers.SectionHeader();
        if(seh.name !== "") {
            throw seh.name;
        }
    }
    test_SectionHeader.name_defaultEmptyString = name_defaultEmptyString;
    function virtualRange_default() {
        var seh = new pe.headers.SectionHeader();
        if(seh.virtualRange.address !== 0 || seh.virtualRange.size !== 0) {
            throw seh.virtualRange;
        }
    }
    test_SectionHeader.virtualRange_default = virtualRange_default;
    function pointerToRelocations_default0() {
        var seh = new pe.headers.SectionHeader();
        if(seh.pointerToRelocations !== 0) {
            throw seh.pointerToRelocations;
        }
    }
    test_SectionHeader.pointerToRelocations_default0 = pointerToRelocations_default0;
})(test_SectionHeader || (test_SectionHeader = {}));
var test_BinaryReader;
(function (test_BinaryReader) {
    function constructor_succeeds() {
        var bi = new pe.io.BinaryReader();
    }
    test_BinaryReader.constructor_succeeds = constructor_succeeds;
    function readByte_throws() {
        var bi = new pe.io.BinaryReader();
        bi.readByte.toString();
        try  {
            bi.readByte();
        } catch (expectedError) {
            return;
        }
        throw "Exception must be thrown.";
    }
    test_BinaryReader.readByte_throws = readByte_throws;
    function readAtOffset_0_throws() {
        var bi = new pe.io.BinaryReader();
        bi.readAtOffset.toString();
        try  {
            bi.readAtOffset(0);
        } catch (expectedError) {
            return;
        }
        throw "Exception must be thrown.";
    }
    test_BinaryReader.readAtOffset_0_throws = readAtOffset_0_throws;
    function readAtOffset_1_throws() {
        var bi = new pe.io.BinaryReader();
        bi.readAtOffset.toString();
        try  {
            bi.readAtOffset(1);
        } catch (expectedError) {
            return;
        }
        throw "Exception must be thrown.";
    }
    test_BinaryReader.readAtOffset_1_throws = readAtOffset_1_throws;
    function readAtOffset_minus1_throws() {
        var bi = new pe.io.BinaryReader();
        bi.readAtOffset.toString();
        try  {
            bi.readAtOffset(-1);
        } catch (expectedError) {
            return;
        }
        throw "Exception must be thrown.";
    }
    test_BinaryReader.readAtOffset_minus1_throws = readAtOffset_minus1_throws;
    function readBytes_0_throws() {
        var bi = new pe.io.BinaryReader();
        bi.readBytes.toString();
        try  {
            bi.readBytes(0);
        } catch (expectedError) {
            return;
        }
        throw "Exception must be thrown.";
    }
    test_BinaryReader.readBytes_0_throws = readBytes_0_throws;
    function readBytes_1_throws() {
        var bi = new pe.io.BinaryReader();
        bi.readBytes.toString();
        try  {
            bi.readBytes(1);
        } catch (expectedError) {
            return;
        }
        throw "Exception must be thrown.";
    }
    test_BinaryReader.readBytes_1_throws = readBytes_1_throws;
    function readBytes_minus1_throws() {
        var bi = new pe.io.BinaryReader();
        bi.readBytes.toString();
        try  {
            bi.readBytes(-1);
        } catch (expectedError) {
            return;
        }
        throw "Exception must be thrown.";
    }
    test_BinaryReader.readBytes_minus1_throws = readBytes_minus1_throws;
    function skipBytes_0_throws() {
        var bi = new pe.io.BinaryReader();
        bi.skipBytes.toString();
        try  {
            bi.skipBytes(0);
        } catch (expectedError) {
            return;
        }
        throw "Exception must be thrown.";
    }
    test_BinaryReader.skipBytes_0_throws = skipBytes_0_throws;
    function clone_throws() {
        var bi = new pe.io.BinaryReader();
        bi.clone.toString();
        try  {
            bi.clone();
        } catch (expectedError) {
            return;
        }
        throw "Exception must be thrown.";
    }
    test_BinaryReader.clone_throws = clone_throws;
    function skipBytes_1_throws() {
        var bi = new pe.io.BinaryReader();
        bi.skipBytes.toString();
        try  {
            bi.skipBytes(1);
        } catch (expectedError) {
            return;
        }
        throw "Exception must be thrown.";
    }
    test_BinaryReader.skipBytes_1_throws = skipBytes_1_throws;
    function skipBytes_minus1_throws() {
        var bi = new pe.io.BinaryReader();
        bi.skipBytes.toString();
        try  {
            bi.skipBytes(-1);
        } catch (expectedError) {
            return;
        }
        throw "Exception must be thrown.";
    }
    test_BinaryReader.skipBytes_minus1_throws = skipBytes_minus1_throws;
    function readShort_combinesTwoCallsTo_readByte_0x32F8() {
        var bi = new pe.io.BinaryReader();
        bi.readByte = function () {
            var lo = 248;
            var hi = 50;
            bi.readByte = function () {
                return hi;
            };
            return lo;
        };
        var sh = bi.readShort();
        if(sh !== 13048) {
            throw "0x" + sh.toString(16).toUpperCase();
        }
    }
    test_BinaryReader.readShort_combinesTwoCallsTo_readByte_0x32F8 = readShort_combinesTwoCallsTo_readByte_0x32F8;
    function readShort_combinesTwoCallsTo_readShort_0x123A456B() {
        var bi = new pe.io.BinaryReader();
        bi.readShort = function () {
            var lo = 17771;
            var hi = 4666;
            bi.readShort = function () {
                return hi;
            };
            return lo;
        };
        var i = bi.readInt();
        if(i !== 305808747) {
            throw "0x" + i.toString(16).toUpperCase();
        }
    }
    test_BinaryReader.readShort_combinesTwoCallsTo_readShort_0x123A456B = readShort_combinesTwoCallsTo_readShort_0x123A456B;
    function readShort_combinesFourCallsTo_readByte_0x123A456B() {
        var bi = new pe.io.BinaryReader();
        var b = [
            107, 
            69, 
            58, 
            18
        ];
        var bOffset = 0;
        bi.readByte = function () {
            bOffset++;
            return b[bOffset - 1];
        };
        var i = bi.readInt();
        if(i !== 305808747) {
            throw "0x" + i.toString(16).toUpperCase();
        }
    }
    test_BinaryReader.readShort_combinesFourCallsTo_readByte_0x123A456B = readShort_combinesFourCallsTo_readByte_0x123A456B;
    function readLong_combinesTwoCallsTo_readInt_0x123A0000456B0000() {
        var bi = new pe.io.BinaryReader();
        bi.readInt = function () {
            var lo = 1164640256;
            var hi = 305790976;
            bi.readInt = function () {
                return hi;
            };
            return lo;
        };
        var lg = bi.readLong();
        if(lg.toString() !== "123A0000456B0000h") {
            throw lg;
        }
    }
    test_BinaryReader.readLong_combinesTwoCallsTo_readInt_0x123A0000456B0000 = readLong_combinesTwoCallsTo_readInt_0x123A0000456B0000;
    function readLong_combinesFourCallsTo_readShort_0x123A0000456B0000() {
        var bi = new pe.io.BinaryReader();
        var s = [
            0, 
            17771, 
            0, 
            4666
        ];
        var sOffset = 0;
        bi.readShort = function () {
            sOffset++;
            return s[sOffset - 1];
        };
        var lg = bi.readLong();
        if(lg.toString() !== "123A0000456B0000h") {
            throw lg;
        }
    }
    test_BinaryReader.readLong_combinesFourCallsTo_readShort_0x123A0000456B0000 = readLong_combinesFourCallsTo_readShort_0x123A0000456B0000;
    function readLong_combinesEightCallsTo_readByte_0x123A0000456B0000() {
        var bi = new pe.io.BinaryReader();
        var b = [
            0, 
            0, 
            107, 
            69, 
            0, 
            0, 
            58, 
            18
        ];
        var bOffset = 0;
        bi.readByte = function () {
            bOffset++;
            return b[bOffset - 1];
        };
        var lg = bi.readLong();
        if(lg.toString() !== "123A0000456B0000h") {
            throw lg;
        }
    }
    test_BinaryReader.readLong_combinesEightCallsTo_readByte_0x123A0000456B0000 = readLong_combinesEightCallsTo_readByte_0x123A0000456B0000;
    function readTimestamp_0_1970Jan1_000000() {
        var bi = new pe.io.BinaryReader();
        bi.readInt = function () {
            return 0;
        };
        var dt = bi.readTimestamp();
        var expectedDate = new Date(1970, 0, 1, 0, 0, 0, 0);
        if(dt.toString() !== expectedDate.toString()) {
            throw dt + " expected " + expectedDate;
        }
        if(dt.getTime() !== expectedDate.getTime()) {
            throw dt.getTime() + " expected " + expectedDate.getTime();
        }
    }
    test_BinaryReader.readTimestamp_0_1970Jan1_000000 = readTimestamp_0_1970Jan1_000000;
    function readTimestamp_1_1970Jan1_000001() {
        var bi = new pe.io.BinaryReader();
        bi.readInt = function () {
            return 1;
        };
        var dt = bi.readTimestamp();
        var expectedDate = new Date(1970, 0, 1, 0, 0, 1, 0);
        if(dt.toString() !== expectedDate.toString()) {
            throw dt + " expected " + expectedDate;
        }
        if(dt.getTime() !== expectedDate.getTime()) {
            throw dt.getTime() + " expected " + expectedDate.getTime();
        }
    }
    test_BinaryReader.readTimestamp_1_1970Jan1_000001 = readTimestamp_1_1970Jan1_000001;
    function readTimestamp_999999999_2001Sep9_034639() {
        var bi = new pe.io.BinaryReader();
        bi.readInt = function () {
            return 999999999;
        };
        var dt = bi.readTimestamp();
        var expectedDate = new Date(2001, 8, 9, 3, 46, 39, 0);
        if(dt.toString() !== expectedDate.toString()) {
            throw dt + " expected " + expectedDate;
        }
        if(dt.getTime() !== expectedDate.getTime()) {
            throw dt.getTime() + " expected " + expectedDate.getTime();
        }
    }
    test_BinaryReader.readTimestamp_999999999_2001Sep9_034639 = readTimestamp_999999999_2001Sep9_034639;
    function readZeroFilledAscii_1_0_emptyString() {
        var bi = new pe.io.BinaryReader();
        bi.readByte = function () {
            return 0;
        };
        var str = bi.readZeroFilledAscii(1);
        if(str !== "") {
            throw str;
        }
    }
    test_BinaryReader.readZeroFilledAscii_1_0_emptyString = readZeroFilledAscii_1_0_emptyString;
    function readZeroFilledAscii_1_32_space() {
        var bi = new pe.io.BinaryReader();
        bi.readByte = function () {
            return 32;
        };
        var str = bi.readZeroFilledAscii(1);
        if(str !== " ") {
            throw str;
        }
    }
    test_BinaryReader.readZeroFilledAscii_1_32_space = readZeroFilledAscii_1_32_space;
    function readZeroFilledAscii_1_0_readsOnlyOnce() {
        var bi = new pe.io.BinaryReader();
        var readCount = 0;
        bi.readByte = function () {
            readCount++;
            return 0;
        };
        bi.readZeroFilledAscii(1);
        if(readCount !== 1) {
            throw readCount;
        }
    }
    test_BinaryReader.readZeroFilledAscii_1_0_readsOnlyOnce = readZeroFilledAscii_1_0_readsOnlyOnce;
    function readZeroFilledAscii_2_00_emptyString() {
        var bi = new pe.io.BinaryReader();
        bi.readByte = function () {
            return 0;
        };
        var str = bi.readZeroFilledAscii(2);
        if(str !== "") {
            throw str;
        }
    }
    test_BinaryReader.readZeroFilledAscii_2_00_emptyString = readZeroFilledAscii_2_00_emptyString;
    function readZeroFilledAscii_2_320_space() {
        var bi = new pe.io.BinaryReader();
        bi.readByte = function () {
            bi.readByte = function () {
                return 0;
            };
            return 32;
        };
        var str = bi.readZeroFilledAscii(2);
        if(str !== " ") {
            throw str;
        }
    }
    test_BinaryReader.readZeroFilledAscii_2_320_space = readZeroFilledAscii_2_320_space;
    function readZeroFilledAscii_2_032_space() {
        var bi = new pe.io.BinaryReader();
        bi.readByte = function () {
            bi.readByte = function () {
                return 32;
            };
            return 0;
        };
        var str = bi.readZeroFilledAscii(2);
        if(str !== " ") {
            throw str;
        }
    }
    test_BinaryReader.readZeroFilledAscii_2_032_space = readZeroFilledAscii_2_032_space;
    function readZeroFilledAscii_2_00_readsTwice() {
        var bi = new pe.io.BinaryReader();
        var readCount = 0;
        bi.readByte = function () {
            readCount++;
            return 0;
        };
        bi.readZeroFilledAscii(2);
        if(readCount !== 2) {
            throw readCount;
        }
    }
    test_BinaryReader.readZeroFilledAscii_2_00_readsTwice = readZeroFilledAscii_2_00_readsTwice;
    function readZeroFilledAscii_3_65066_AB() {
        var bi = new pe.io.BinaryReader();
        var b = [
            65, 
            0, 
            66
        ];
        var bIndex = 0;
        bi.readByte = function () {
            bIndex++;
            return b[bIndex - 1];
        };
        var str = bi.readZeroFilledAscii(3);
        if(str !== "AB") {
            throw str;
        }
    }
    test_BinaryReader.readZeroFilledAscii_3_65066_AB = readZeroFilledAscii_3_65066_AB;
    function readAsciiZ_0_emptyString() {
        var bi = new pe.io.BinaryReader();
        bi.readByte = function () {
            return 0;
        };
        var str = bi.readAsciiZ();
        if(str !== "") {
            throw str;
        }
    }
    test_BinaryReader.readAsciiZ_0_emptyString = readAsciiZ_0_emptyString;
    function readAsciiZ_6566670_ABC() {
        var bi = new pe.io.BinaryReader();
        var b = [
            65, 
            66, 
            67, 
            0
        ];
        var bIndex = 0;
        bi.readByte = function () {
            bIndex++;
            return b[bIndex - 1];
        };
        var str = bi.readAsciiZ();
        if(str !== "ABC") {
            throw str;
        }
    }
    test_BinaryReader.readAsciiZ_6566670_ABC = readAsciiZ_6566670_ABC;
    function readUtf8Z_20_PrivetExclamation() {
        var bi = new pe.io.BinaryReader();
        var b = [
            208, 
            159, 
            209, 
            128, 
            208, 
            184, 
            208, 
            178, 
            208, 
            181, 
            209, 
            130, 
            33, 
            0
        ];
        var bIndex = 0;
        bi.readByte = function () {
            bIndex++;
            return b[bIndex - 1];
        };
        var str = bi.readUtf8z(20);
        var expected = "\u041F\u0440\u0438\u0432\u0435\u0442\u0021";
        if(str !== expected) {
            throw str + " expected " + expected;
        }
    }
    test_BinaryReader.readUtf8Z_20_PrivetExclamation = readUtf8Z_20_PrivetExclamation;
    function readUtf8Z_13_PrivetExclamation() {
        var bi = new pe.io.BinaryReader();
        var b = [
            208, 
            159, 
            209, 
            128, 
            208, 
            184, 
            208, 
            178, 
            208, 
            181, 
            209, 
            130, 
            33, 
            0
        ];
        var bIndex = 0;
        bi.readByte = function () {
            bIndex++;
            return b[bIndex - 1];
        };
        var str = bi.readUtf8z(13);
        var expected = "\u041F\u0440\u0438\u0432\u0435\u0442\u0021";
        if(str !== expected) {
            throw str + " expected " + expected;
        }
    }
    test_BinaryReader.readUtf8Z_13_PrivetExclamation = readUtf8Z_13_PrivetExclamation;
    function readUtf8Z_4_PrivetExclamation_Pr() {
        var bi = new pe.io.BinaryReader();
        var b = [
            208, 
            159, 
            209, 
            128, 
            208, 
            184, 
            208, 
            178, 
            208, 
            181, 
            209, 
            130, 
            33, 
            0
        ];
        var bIndex = 0;
        bi.readByte = function () {
            bIndex++;
            return b[bIndex - 1];
        };
        var str = bi.readUtf8z(4);
        var expected = "\u041F\u0440\u0438\u0432\u0435\u0442\u0021".substring(0, 2);
        if(str !== expected) {
            throw str + " expected " + expected;
        }
    }
    test_BinaryReader.readUtf8Z_4_PrivetExclamation_Pr = readUtf8Z_4_PrivetExclamation_Pr;
})(test_BinaryReader || (test_BinaryReader = {}));
var test_DataViewBinaryReader;
(function (test_DataViewBinaryReader) {
    function constructor_succeeds() {
        var dr = new pe.io.DataViewBinaryReader({
        }, 0);
    }
    test_DataViewBinaryReader.constructor_succeeds = constructor_succeeds;
    function readByte_getUint8() {
        var dr = new pe.io.DataViewBinaryReader({
            getUint8: function (offset) {
                return 84;
            }
        }, 0);
        var b = dr.readByte();
        if(b !== 84) {
            throw dr;
        }
    }
    test_DataViewBinaryReader.readByte_getUint8 = readByte_getUint8;
    function readShort_getUint16() {
        var dr = new pe.io.DataViewBinaryReader({
            getUint16: function (offset) {
                return 21402;
            }
        }, 0);
        var s = dr.readShort();
        if(s !== 21402) {
            throw dr;
        }
    }
    test_DataViewBinaryReader.readShort_getUint16 = readShort_getUint16;
    function readInt_getUint32() {
        var dr = new pe.io.DataViewBinaryReader({
            getUint32: function (offset) {
                return 21456082;
            }
        }, 0);
        var i = dr.readInt();
        if(i !== 21456082) {
            throw dr;
        }
    }
    test_DataViewBinaryReader.readInt_getUint32 = readInt_getUint32;
    function readBytes_invokes_createUint32Array() {
        var dr = new pe.io.DataViewBinaryReader({
            getUint8: function (offset) {
                return 0;
            }
        }, 0);
        var wasInvoked = false;
        dr.createUint32Array = function () {
            wasInvoked = true;
            return [];
        };
        dr.readBytes(2);
        if(!wasInvoked) {
            throw "override constructor for Uint8Array has not been invoked";
        }
    }
    test_DataViewBinaryReader.readBytes_invokes_createUint32Array = readBytes_invokes_createUint32Array;
    function readBytes_7_calls_getUint8_7times() {
        var callCount = 0;
        var dr = new pe.io.DataViewBinaryReader({
            getUint8: function (offset) {
                callCount++;
                return 0;
            }
        }, 0);
        dr.createUint32Array = function () {
            return [];
        };
        dr.readBytes(7);
        if(callCount !== 7) {
            throw callCount;
        }
    }
    test_DataViewBinaryReader.readBytes_7_calls_getUint8_7times = readBytes_7_calls_getUint8_7times;
    function readBytes_7_0123456() {
        var dr = new pe.io.DataViewBinaryReader({
            getUint8: function (offset) {
                return offset;
            }
        }, 0);
        dr.createUint32Array = function () {
            return [];
        };
        var b = dr.readBytes(7);
        var bArray = [];
        for(var i = 0; i < b.length; i++) {
            bArray[i] = b[i];
        }
        var bStr = bArray.join(",");
        if(bStr !== "0,1,2,3,4,5,6") {
            throw bStr;
        }
    }
    test_DataViewBinaryReader.readBytes_7_0123456 = readBytes_7_0123456;
    function skipBytes_2_0123_fromStart_2() {
        var dr = new pe.io.DataViewBinaryReader({
            getUint8: function (offset) {
                return offset;
            }
        }, 0);
        dr.createUint32Array = function () {
            return [];
        };
        dr.skipBytes(2);
        var b = dr.readByte();
        if(b !== 2) {
            throw b;
        }
    }
    test_DataViewBinaryReader.skipBytes_2_0123_fromStart_2 = skipBytes_2_0123_fromStart_2;
    function skipBytes_2_then3_01234567_5() {
        var dr = new pe.io.DataViewBinaryReader({
            getUint8: function (offset) {
                return offset;
            }
        }, 0);
        dr.createUint32Array = function () {
            return [];
        };
        dr.skipBytes(2);
        dr.skipBytes(3);
        var b = dr.readByte();
        if(b !== 5) {
            throw b;
        }
    }
    test_DataViewBinaryReader.skipBytes_2_then3_01234567_5 = skipBytes_2_then3_01234567_5;
    function clone_0() {
        var dr = new pe.io.DataViewBinaryReader({
            getUint8: function (offset) {
                return offset;
            }
        }, 0);
        var clo = dr.clone();
        dr.skipBytes(2);
        var b = clo.readByte();
        if(b !== 0) {
            throw b;
        }
    }
    test_DataViewBinaryReader.clone_0 = clone_0;
    function clone_1() {
        var dr = new pe.io.DataViewBinaryReader({
            getUint8: function (offset) {
                return offset;
            }
        }, 0);
        dr.readByte();
        var clo = dr.clone();
        dr.skipBytes(2);
        var b = clo.readByte();
        if(b !== 1) {
            throw b;
        }
    }
    test_DataViewBinaryReader.clone_1 = clone_1;
})(test_DataViewBinaryReader || (test_DataViewBinaryReader = {}));
var test_BufferBinaryReader;
(function (test_BufferBinaryReader) {
    function constructor_succeeds() {
        var br = new pe.io.BufferBinaryReader([], 0);
    }
    test_BufferBinaryReader.constructor_succeeds = constructor_succeeds;
    function readByte_firstByte_43() {
        var br = new pe.io.BufferBinaryReader([
            43
        ], 0);
        var b = br.readByte();
        if(b !== 43) {
            throw br;
        }
    }
    test_BufferBinaryReader.readByte_firstByte_43 = readByte_firstByte_43;
    function readByte_twice_98() {
        var br = new pe.io.BufferBinaryReader([
            43, 
            98
        ], 0);
        br.readByte();
        var b = br.readByte();
        if(b !== 98) {
            throw br;
        }
    }
    test_BufferBinaryReader.readByte_twice_98 = readByte_twice_98;
    function constructorWithOffset_4_readByte_101() {
        var br = new pe.io.BufferBinaryReader([
            43, 
            98, 
            31, 
            9, 
            101
        ], 4);
        var b = br.readByte();
        if(b !== 101) {
            throw br;
        }
    }
    test_BufferBinaryReader.constructorWithOffset_4_readByte_101 = constructorWithOffset_4_readByte_101;
    function readBytes_1234() {
        var br = new pe.io.BufferBinaryReader([
            1, 
            2, 
            3, 
            4
        ]);
        var b = br.readBytes(4);
        var bStr = b.join(",");
        if(bStr !== "1,2,3,4") {
            throw bStr + " expected 1,2,3,4";
        }
    }
    test_BufferBinaryReader.readBytes_1234 = readBytes_1234;
    function skipBytes_1234_3() {
        var br = new pe.io.BufferBinaryReader([
            1, 
            2, 
            3, 
            4
        ]);
        br.readBytes(2);
        var b = br.readByte();
        if(b !== 3) {
            throw b;
        }
    }
    test_BufferBinaryReader.skipBytes_1234_3 = skipBytes_1234_3;
    function clone_1234_1() {
        var br = new pe.io.BufferBinaryReader([
            1, 
            2, 
            3, 
            4
        ]);
        var clo = br.clone();
        br.readBytes(2);
        var b = clo.readByte();
        if(b !== 1) {
            throw b;
        }
    }
    test_BufferBinaryReader.clone_1234_1 = clone_1234_1;
    function clone_1234_2() {
        var br = new pe.io.BufferBinaryReader([
            1, 
            2, 
            3, 
            4
        ]);
        br.skipBytes(1);
        var clo = br.clone();
        br.readBytes(2);
        var b = clo.readByte();
        if(b !== 2) {
            throw b;
        }
    }
    test_BufferBinaryReader.clone_1234_2 = clone_1234_2;
})(test_BufferBinaryReader || (test_BufferBinaryReader = {}));
var test_PEFile_read;
(function (test_PEFile_read) {
    var sampleBuf = [
        77, 
        90, 
        144, 
        , 
        3, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        255, 
        255, 
        , 
        , 
        184, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        128, 
        , 
        , 
        , 
        14, 
        31, 
        186, 
        14, 
        , 
        180, 
        9, 
        205, 
        33, 
        184, 
        1, 
        76, 
        205, 
        33, 
        84, 
        104, 
        105, 
        115, 
        32, 
        112, 
        114, 
        111, 
        103, 
        114, 
        97, 
        109, 
        32, 
        99, 
        97, 
        110, 
        110, 
        111, 
        116, 
        32, 
        98, 
        101, 
        32, 
        114, 
        117, 
        110, 
        32, 
        105, 
        110, 
        32, 
        68, 
        79, 
        83, 
        32, 
        109, 
        111, 
        100, 
        101, 
        46, 
        13, 
        13, 
        10, 
        36, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        80, 
        69, 
        , 
        , 
        76, 
        1, 
        3, 
        , 
        195, 
        135, 
        151, 
        80, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        224, 
        , 
        2, 
        1, 
        11, 
        1, 
        8, 
        , 
        , 
        4, 
        , 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        62, 
        35, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        32, 
        , 
        , 
        , 
        2, 
        , 
        , 
        4, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        128, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        3, 
        , 
        64, 
        133, 
        , 
        , 
        16, 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        16, 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        228, 
        34, 
        , 
        , 
        87, 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        160, 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        96, 
        , 
        , 
        12, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        8, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        8, 
        32, 
        , 
        , 
        72, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        46, 
        116, 
        101, 
        120, 
        116, 
        , 
        , 
        , 
        68, 
        3, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        96, 
        46, 
        114, 
        115, 
        114, 
        99, 
        , 
        , 
        , 
        160, 
        2, 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        64, 
        46, 
        114, 
        101, 
        108, 
        111, 
        99, 
        , 
        , 
        12, 
        , 
        , 
        , 
        , 
        96, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        10, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        66, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        35, 
        , 
        , 
        , 
        , 
        , 
        , 
        72, 
        , 
        , 
        , 
        2, 
        , 
        5, 
        , 
        104, 
        32, 
        , 
        , 
        124, 
        2, 
        , 
        , 
        1, 
        , 
        , 
        , 
        1, 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        54, 
        , 
        114, 
        1, 
        , 
        , 
        112, 
        40, 
        3, 
        , 
        , 
        10, 
        , 
        42, 
        30, 
        2, 
        40, 
        4, 
        , 
        , 
        10, 
        42, 
        , 
        , 
        66, 
        83, 
        74, 
        66, 
        1, 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        12, 
        , 
        , 
        , 
        118, 
        50, 
        46, 
        48, 
        46, 
        53, 
        48, 
        55, 
        50, 
        55, 
        , 
        , 
        , 
        , 
        5, 
        , 
        108, 
        , 
        , 
        , 
        228, 
        , 
        , 
        , 
        35, 
        126, 
        , 
        , 
        80, 
        1, 
        , 
        , 
        184, 
        , 
        , 
        , 
        35, 
        83, 
        116, 
        114, 
        105, 
        110, 
        103, 
        115, 
        , 
        , 
        , 
        , 
        8, 
        2, 
        , 
        , 
        32, 
        , 
        , 
        , 
        35, 
        85, 
        83, 
        , 
        40, 
        2, 
        , 
        , 
        16, 
        , 
        , 
        , 
        35, 
        71, 
        85, 
        73, 
        68, 
        , 
        , 
        , 
        56, 
        2, 
        , 
        , 
        68, 
        , 
        , 
        , 
        35, 
        66, 
        108, 
        111, 
        98, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        2, 
        , 
        , 
        1, 
        71, 
        20, 
        , 
        , 
        9, 
        , 
        , 
        , 
        , 
        250, 
        1, 
        51, 
        , 
        22, 
        , 
        , 
        1, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        10, 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        6, 
        , 
        45, 
        , 
        38, 
        , 
        6, 
        , 
        95, 
        , 
        63, 
        , 
        6, 
        , 
        127, 
        , 
        63, 
        , 
        6, 
        , 
        164, 
        , 
        38, 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        1, 
        , 
        , 
        , 
        16, 
        , 
        21, 
        , 
        , 
        , 
        5, 
        , 
        1, 
        , 
        1, 
        , 
        80, 
        32, 
        , 
        , 
        , 
        , 
        145, 
        , 
        52, 
        , 
        10, 
        , 
        1, 
        , 
        94, 
        32, 
        , 
        , 
        , 
        , 
        134, 
        24, 
        57, 
        , 
        14, 
        , 
        1, 
        , 
        17, 
        , 
        57, 
        , 
        18, 
        , 
        25, 
        , 
        57, 
        , 
        14, 
        , 
        33, 
        , 
        172, 
        , 
        23, 
        , 
        9, 
        , 
        57, 
        , 
        14, 
        , 
        46, 
        , 
        11, 
        , 
        28, 
        , 
        46, 
        , 
        19, 
        , 
        37, 
        , 
        4, 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        157, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        29, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        60, 
        77, 
        111, 
        100, 
        117, 
        108, 
        101, 
        62, 
        , 
        115, 
        97, 
        109, 
        112, 
        108, 
        101, 
        46, 
        101, 
        120, 
        101, 
        , 
        80, 
        114, 
        111, 
        103, 
        114, 
        97, 
        109, 
        , 
        109, 
        115, 
        99, 
        111, 
        114, 
        108, 
        105, 
        98, 
        , 
        83, 
        121, 
        115, 
        116, 
        101, 
        109, 
        , 
        79, 
        98, 
        106, 
        101, 
        99, 
        116, 
        , 
        77, 
        97, 
        105, 
        110, 
        , 
        46, 
        99, 
        116, 
        111, 
        114, 
        , 
        83, 
        121, 
        115, 
        116, 
        101, 
        109, 
        46, 
        82, 
        117, 
        110, 
        116, 
        105, 
        109, 
        101, 
        46, 
        67, 
        111, 
        109, 
        112, 
        105, 
        108, 
        101, 
        114, 
        83, 
        101, 
        114, 
        118, 
        105, 
        99, 
        101, 
        115, 
        , 
        67, 
        111, 
        109, 
        112, 
        105, 
        108, 
        97, 
        116, 
        105, 
        111, 
        110, 
        82, 
        101, 
        108, 
        97, 
        120, 
        97, 
        116, 
        105, 
        111, 
        110, 
        115, 
        65, 
        116, 
        116, 
        114, 
        105, 
        98, 
        117, 
        116, 
        101, 
        , 
        82, 
        117, 
        110, 
        116, 
        105, 
        109, 
        101, 
        67, 
        111, 
        109, 
        112, 
        97, 
        116, 
        105, 
        98, 
        105, 
        108, 
        105, 
        116, 
        121, 
        65, 
        116, 
        116, 
        114, 
        105, 
        98, 
        117, 
        116, 
        101, 
        , 
        115, 
        97, 
        109, 
        112, 
        108, 
        101, 
        , 
        67, 
        111, 
        110, 
        115, 
        111, 
        108, 
        101, 
        , 
        87, 
        114, 
        105, 
        116, 
        101, 
        76, 
        105, 
        110, 
        101, 
        , 
        , 
        , 
        , 
        27, 
        72, 
        , 
        101, 
        , 
        108, 
        , 
        108, 
        , 
        111, 
        , 
        44, 
        , 
        32, 
        , 
        87, 
        , 
        111, 
        , 
        114, 
        , 
        108, 
        , 
        100, 
        , 
        33, 
        , 
        , 
        , 
        , 
        , 
        146, 
        199, 
        156, 
        13, 
        90, 
        202, 
        19, 
        73, 
        158, 
        118, 
        143, 
        24, 
        114, 
        188, 
        194, 
        39, 
        , 
        8, 
        183, 
        122, 
        92, 
        86, 
        25, 
        52, 
        224, 
        137, 
        3, 
        , 
        , 
        1, 
        3, 
        32, 
        , 
        1, 
        4, 
        32, 
        1, 
        1, 
        8, 
        4, 
        , 
        1, 
        1, 
        14, 
        8, 
        1, 
        , 
        8, 
        , 
        , 
        , 
        , 
        , 
        30, 
        1, 
        , 
        1, 
        , 
        84, 
        2, 
        22, 
        87, 
        114, 
        97, 
        112, 
        78, 
        111, 
        110, 
        69, 
        120, 
        99, 
        101, 
        112, 
        116, 
        105, 
        111, 
        110, 
        84, 
        104, 
        114, 
        111, 
        119, 
        115, 
        1, 
        12, 
        35, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        46, 
        35, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        35, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        95, 
        67, 
        111, 
        114, 
        69, 
        120, 
        101, 
        77, 
        97, 
        105, 
        110, 
        , 
        109, 
        115, 
        99, 
        111, 
        114, 
        101, 
        101, 
        46, 
        100, 
        108, 
        108, 
        , 
        , 
        , 
        , 
        , 
        255, 
        37, 
        , 
        32, 
        64, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        16, 
        , 
        , 
        , 
        24, 
        , 
        , 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        1, 
        , 
        , 
        , 
        48, 
        , 
        , 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        72, 
        , 
        , 
        , 
        88, 
        64, 
        , 
        , 
        68, 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        68, 
        2, 
        52, 
        , 
        , 
        , 
        86, 
        , 
        83, 
        , 
        95, 
        , 
        86, 
        , 
        69, 
        , 
        82, 
        , 
        83, 
        , 
        73, 
        , 
        79, 
        , 
        78, 
        , 
        95, 
        , 
        73, 
        , 
        78, 
        , 
        70, 
        , 
        79, 
        , 
        , 
        , 
        , 
        , 
        189, 
        4, 
        239, 
        254, 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        63, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        68, 
        , 
        , 
        , 
        1, 
        , 
        86, 
        , 
        97, 
        , 
        114, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        73, 
        , 
        110, 
        , 
        102, 
        , 
        111, 
        , 
        , 
        , 
        , 
        , 
        36, 
        , 
        4, 
        , 
        , 
        , 
        84, 
        , 
        114, 
        , 
        97, 
        , 
        110, 
        , 
        115, 
        , 
        108, 
        , 
        97, 
        , 
        116, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        176, 
        4, 
        164, 
        1, 
        , 
        , 
        1, 
        , 
        83, 
        , 
        116, 
        , 
        114, 
        , 
        105, 
        , 
        110, 
        , 
        103, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        73, 
        , 
        110, 
        , 
        102, 
        , 
        111, 
        , 
        , 
        , 
        128, 
        1, 
        , 
        , 
        1, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        52, 
        , 
        98, 
        , 
        48, 
        , 
        , 
        , 
        44, 
        , 
        2, 
        , 
        1, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        68, 
        , 
        101, 
        , 
        115, 
        , 
        99, 
        , 
        114, 
        , 
        105, 
        , 
        112, 
        , 
        116, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        48, 
        , 
        8, 
        , 
        1, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        56, 
        , 
        11, 
        , 
        1, 
        , 
        73, 
        , 
        110, 
        , 
        116, 
        , 
        101, 
        , 
        114, 
        , 
        110, 
        , 
        97, 
        , 
        108, 
        , 
        78, 
        , 
        97, 
        , 
        109, 
        , 
        101, 
        , 
        , 
        , 
        115, 
        , 
        97, 
        , 
        109, 
        , 
        112, 
        , 
        108, 
        , 
        101, 
        , 
        46, 
        , 
        101, 
        , 
        120, 
        , 
        101, 
        , 
        , 
        , 
        , 
        , 
        40, 
        , 
        2, 
        , 
        1, 
        , 
        76, 
        , 
        101, 
        , 
        103, 
        , 
        97, 
        , 
        108, 
        , 
        67, 
        , 
        111, 
        , 
        112, 
        , 
        121, 
        , 
        114, 
        , 
        105, 
        , 
        103, 
        , 
        104, 
        , 
        116, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        64, 
        , 
        11, 
        , 
        1, 
        , 
        79, 
        , 
        114, 
        , 
        105, 
        , 
        103, 
        , 
        105, 
        , 
        110, 
        , 
        97, 
        , 
        108, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        110, 
        , 
        97, 
        , 
        109, 
        , 
        101, 
        , 
        , 
        , 
        115, 
        , 
        97, 
        , 
        109, 
        , 
        112, 
        , 
        108, 
        , 
        101, 
        , 
        46, 
        , 
        101, 
        , 
        120, 
        , 
        101, 
        , 
        , 
        , 
        , 
        , 
        52, 
        , 
        8, 
        , 
        1, 
        , 
        80, 
        , 
        114, 
        , 
        111, 
        , 
        100, 
        , 
        117, 
        , 
        99, 
        , 
        116, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        56, 
        , 
        8, 
        , 
        1, 
        , 
        65, 
        , 
        115, 
        , 
        115, 
        , 
        101, 
        , 
        109, 
        , 
        98, 
        , 
        108, 
        , 
        121, 
        , 
        32, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        12, 
        , 
        , 
        , 
        64, 
        51
    ];
    sampleBuf[3071] = 0;
    for(var i = 0; i < sampleBuf.length; i++) {
        if(!sampleBuf[i]) {
            sampleBuf[i] = 0;
        }
    }
    function read_succeds() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
    }
    test_PEFile_read.read_succeds = read_succeds;
    function read_dosHeader_mz_MZ() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        if(pef.dosHeader.mz !== pe.headers.MZSignature.MZ) {
            throw pef.dosHeader.mz;
        }
    }
    test_PEFile_read.read_dosHeader_mz_MZ = read_dosHeader_mz_MZ;
    function read_dosHeader_lfanew_128() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        if(pef.dosHeader.lfanew !== 128) {
            throw pef.dosHeader.lfanew;
        }
    }
    test_PEFile_read.read_dosHeader_lfanew_128 = read_dosHeader_lfanew_128;
    function read_dosStub_length_64() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        if(pef.dosStub.length !== 64) {
            throw pef.dosStub.length;
        }
    }
    test_PEFile_read.read_dosStub_length_64 = read_dosStub_length_64;
    function read_dosStub_matchesInputAt64() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var dosStub = [];
        for(var i = 0; i < pef.dosStub.length; i++) {
            dosStub[i] = pef.dosStub[i];
        }
        var dosStubStr = dosStub.join(",");
        var inputAt64 = sampleBuf.slice(64, 64 + 64);
        var inputAt64Str = inputAt64.join(",");
        if(dosStubStr !== inputAt64Str) {
            throw dosStubStr + " expected " + inputAt64Str;
        }
    }
    test_PEFile_read.read_dosStub_matchesInputAt64 = read_dosStub_matchesInputAt64;
    function read_peHeader_pe_PE() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        if(pef.peHeader.pe !== pe.headers.PESignature.PE) {
            throw pef.peHeader.pe;
        }
    }
    test_PEFile_read.read_peHeader_pe_PE = read_peHeader_pe_PE;
    function read_peHeader_machine_I386() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        if(pef.peHeader.machine !== pe.headers.Machine.I386) {
            throw pef.peHeader.machine;
        }
    }
    test_PEFile_read.read_peHeader_machine_I386 = read_peHeader_machine_I386;
    function read_optionalHeader_peMagic_NT32() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        if(pef.optionalHeader.peMagic !== pe.headers.PEMagic.NT32) {
            throw pef.optionalHeader.peMagic;
        }
    }
    test_PEFile_read.read_optionalHeader_peMagic_NT32 = read_optionalHeader_peMagic_NT32;
    function read_optionalHeader_numberOfRvaAndSizes_16() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        if(pef.optionalHeader.numberOfRvaAndSizes !== 16) {
            throw pef.optionalHeader.numberOfRvaAndSizes;
        }
    }
    test_PEFile_read.read_optionalHeader_numberOfRvaAndSizes_16 = read_optionalHeader_numberOfRvaAndSizes_16;
    function read_optionalHeader_dataDirectories_length_16() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        if(pef.optionalHeader.dataDirectories.length !== 16) {
            throw pef.optionalHeader.dataDirectories.length;
        }
    }
    test_PEFile_read.read_optionalHeader_dataDirectories_length_16 = read_optionalHeader_dataDirectories_length_16;
    function read_optionalHeader_dataDirectories_14_address_8200() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        if(pef.optionalHeader.dataDirectories[14].address !== 8200) {
            throw pef.optionalHeader.dataDirectories[14].address;
        }
    }
    test_PEFile_read.read_optionalHeader_dataDirectories_14_address_8200 = read_optionalHeader_dataDirectories_14_address_8200;
    function read_optionalHeader_dataDirectories_14_size_72() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        if(pef.optionalHeader.dataDirectories[14].size !== 72) {
            throw pef.optionalHeader.dataDirectories[14].size;
        }
    }
    test_PEFile_read.read_optionalHeader_dataDirectories_14_size_72 = read_optionalHeader_dataDirectories_14_size_72;
    function read_sectionHeaders_length_3() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        if(pef.sectionHeaders.length !== 3) {
            throw pef.sectionHeaders.length;
        }
    }
    test_PEFile_read.read_sectionHeaders_length_3 = read_sectionHeaders_length_3;
    function read_sectionHeaders_names_DOTtext_DOTrsrc_DOTreloc() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var namesArray = [];
        for(var i = 0; i < pef.sectionHeaders.length; i++) {
            namesArray.push(pef.sectionHeaders[i].name);
        }
        var namesStr = namesArray.join(" ");
        if(namesStr !== ".text .rsrc .reloc") {
            throw namesStr;
        }
    }
    test_PEFile_read.read_sectionHeaders_names_DOTtext_DOTrsrc_DOTreloc = read_sectionHeaders_names_DOTtext_DOTrsrc_DOTreloc;
})(test_PEFile_read || (test_PEFile_read = {}));
var test_DosHeader_read_sampleExe;
(function (test_DosHeader_read_sampleExe) {
    var sampleBuf = [
        77, 
        90, 
        144, 
        , 
        3, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        255, 
        255, 
        , 
        , 
        184, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        128, 
        , 
        , 
        , 
        14, 
        31, 
        186, 
        14, 
        , 
        180, 
        9, 
        205, 
        33, 
        184, 
        1, 
        76, 
        205, 
        33, 
        84, 
        104, 
        105, 
        115, 
        32, 
        112, 
        114, 
        111, 
        103, 
        114, 
        97, 
        109, 
        32, 
        99, 
        97, 
        110, 
        110, 
        111, 
        116, 
        32, 
        98, 
        101, 
        32, 
        114, 
        117, 
        110, 
        32, 
        105, 
        110, 
        32, 
        68, 
        79, 
        83, 
        32, 
        109, 
        111, 
        100, 
        101, 
        46, 
        13, 
        13, 
        10, 
        36, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        80, 
        69, 
        , 
        , 
        76, 
        1, 
        3, 
        , 
        195, 
        135, 
        151, 
        80, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        224, 
        , 
        2, 
        1, 
        11, 
        1, 
        8, 
        , 
        , 
        4, 
        , 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        62, 
        35, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        32, 
        , 
        , 
        , 
        2, 
        , 
        , 
        4, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        128, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        3, 
        , 
        64, 
        133, 
        , 
        , 
        16, 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        16, 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        228, 
        34, 
        , 
        , 
        87, 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        160, 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        96, 
        , 
        , 
        12, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        8, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        8, 
        32, 
        , 
        , 
        72, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        46, 
        116, 
        101, 
        120, 
        116, 
        , 
        , 
        , 
        68, 
        3, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        96, 
        46, 
        114, 
        115, 
        114, 
        99, 
        , 
        , 
        , 
        160, 
        2, 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        64, 
        46, 
        114, 
        101, 
        108, 
        111, 
        99, 
        , 
        , 
        12, 
        , 
        , 
        , 
        , 
        96, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        10, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        66, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        35, 
        , 
        , 
        , 
        , 
        , 
        , 
        72, 
        , 
        , 
        , 
        2, 
        , 
        5, 
        , 
        104, 
        32, 
        , 
        , 
        124, 
        2, 
        , 
        , 
        1, 
        , 
        , 
        , 
        1, 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        54, 
        , 
        114, 
        1, 
        , 
        , 
        112, 
        40, 
        3, 
        , 
        , 
        10, 
        , 
        42, 
        30, 
        2, 
        40, 
        4, 
        , 
        , 
        10, 
        42, 
        , 
        , 
        66, 
        83, 
        74, 
        66, 
        1, 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        12, 
        , 
        , 
        , 
        118, 
        50, 
        46, 
        48, 
        46, 
        53, 
        48, 
        55, 
        50, 
        55, 
        , 
        , 
        , 
        , 
        5, 
        , 
        108, 
        , 
        , 
        , 
        228, 
        , 
        , 
        , 
        35, 
        126, 
        , 
        , 
        80, 
        1, 
        , 
        , 
        184, 
        , 
        , 
        , 
        35, 
        83, 
        116, 
        114, 
        105, 
        110, 
        103, 
        115, 
        , 
        , 
        , 
        , 
        8, 
        2, 
        , 
        , 
        32, 
        , 
        , 
        , 
        35, 
        85, 
        83, 
        , 
        40, 
        2, 
        , 
        , 
        16, 
        , 
        , 
        , 
        35, 
        71, 
        85, 
        73, 
        68, 
        , 
        , 
        , 
        56, 
        2, 
        , 
        , 
        68, 
        , 
        , 
        , 
        35, 
        66, 
        108, 
        111, 
        98, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        2, 
        , 
        , 
        1, 
        71, 
        20, 
        , 
        , 
        9, 
        , 
        , 
        , 
        , 
        250, 
        1, 
        51, 
        , 
        22, 
        , 
        , 
        1, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        10, 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        6, 
        , 
        45, 
        , 
        38, 
        , 
        6, 
        , 
        95, 
        , 
        63, 
        , 
        6, 
        , 
        127, 
        , 
        63, 
        , 
        6, 
        , 
        164, 
        , 
        38, 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        1, 
        , 
        , 
        , 
        16, 
        , 
        21, 
        , 
        , 
        , 
        5, 
        , 
        1, 
        , 
        1, 
        , 
        80, 
        32, 
        , 
        , 
        , 
        , 
        145, 
        , 
        52, 
        , 
        10, 
        , 
        1, 
        , 
        94, 
        32, 
        , 
        , 
        , 
        , 
        134, 
        24, 
        57, 
        , 
        14, 
        , 
        1, 
        , 
        17, 
        , 
        57, 
        , 
        18, 
        , 
        25, 
        , 
        57, 
        , 
        14, 
        , 
        33, 
        , 
        172, 
        , 
        23, 
        , 
        9, 
        , 
        57, 
        , 
        14, 
        , 
        46, 
        , 
        11, 
        , 
        28, 
        , 
        46, 
        , 
        19, 
        , 
        37, 
        , 
        4, 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        157, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        29, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        60, 
        77, 
        111, 
        100, 
        117, 
        108, 
        101, 
        62, 
        , 
        115, 
        97, 
        109, 
        112, 
        108, 
        101, 
        46, 
        101, 
        120, 
        101, 
        , 
        80, 
        114, 
        111, 
        103, 
        114, 
        97, 
        109, 
        , 
        109, 
        115, 
        99, 
        111, 
        114, 
        108, 
        105, 
        98, 
        , 
        83, 
        121, 
        115, 
        116, 
        101, 
        109, 
        , 
        79, 
        98, 
        106, 
        101, 
        99, 
        116, 
        , 
        77, 
        97, 
        105, 
        110, 
        , 
        46, 
        99, 
        116, 
        111, 
        114, 
        , 
        83, 
        121, 
        115, 
        116, 
        101, 
        109, 
        46, 
        82, 
        117, 
        110, 
        116, 
        105, 
        109, 
        101, 
        46, 
        67, 
        111, 
        109, 
        112, 
        105, 
        108, 
        101, 
        114, 
        83, 
        101, 
        114, 
        118, 
        105, 
        99, 
        101, 
        115, 
        , 
        67, 
        111, 
        109, 
        112, 
        105, 
        108, 
        97, 
        116, 
        105, 
        111, 
        110, 
        82, 
        101, 
        108, 
        97, 
        120, 
        97, 
        116, 
        105, 
        111, 
        110, 
        115, 
        65, 
        116, 
        116, 
        114, 
        105, 
        98, 
        117, 
        116, 
        101, 
        , 
        82, 
        117, 
        110, 
        116, 
        105, 
        109, 
        101, 
        67, 
        111, 
        109, 
        112, 
        97, 
        116, 
        105, 
        98, 
        105, 
        108, 
        105, 
        116, 
        121, 
        65, 
        116, 
        116, 
        114, 
        105, 
        98, 
        117, 
        116, 
        101, 
        , 
        115, 
        97, 
        109, 
        112, 
        108, 
        101, 
        , 
        67, 
        111, 
        110, 
        115, 
        111, 
        108, 
        101, 
        , 
        87, 
        114, 
        105, 
        116, 
        101, 
        76, 
        105, 
        110, 
        101, 
        , 
        , 
        , 
        , 
        27, 
        72, 
        , 
        101, 
        , 
        108, 
        , 
        108, 
        , 
        111, 
        , 
        44, 
        , 
        32, 
        , 
        87, 
        , 
        111, 
        , 
        114, 
        , 
        108, 
        , 
        100, 
        , 
        33, 
        , 
        , 
        , 
        , 
        , 
        146, 
        199, 
        156, 
        13, 
        90, 
        202, 
        19, 
        73, 
        158, 
        118, 
        143, 
        24, 
        114, 
        188, 
        194, 
        39, 
        , 
        8, 
        183, 
        122, 
        92, 
        86, 
        25, 
        52, 
        224, 
        137, 
        3, 
        , 
        , 
        1, 
        3, 
        32, 
        , 
        1, 
        4, 
        32, 
        1, 
        1, 
        8, 
        4, 
        , 
        1, 
        1, 
        14, 
        8, 
        1, 
        , 
        8, 
        , 
        , 
        , 
        , 
        , 
        30, 
        1, 
        , 
        1, 
        , 
        84, 
        2, 
        22, 
        87, 
        114, 
        97, 
        112, 
        78, 
        111, 
        110, 
        69, 
        120, 
        99, 
        101, 
        112, 
        116, 
        105, 
        111, 
        110, 
        84, 
        104, 
        114, 
        111, 
        119, 
        115, 
        1, 
        12, 
        35, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        46, 
        35, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        35, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        95, 
        67, 
        111, 
        114, 
        69, 
        120, 
        101, 
        77, 
        97, 
        105, 
        110, 
        , 
        109, 
        115, 
        99, 
        111, 
        114, 
        101, 
        101, 
        46, 
        100, 
        108, 
        108, 
        , 
        , 
        , 
        , 
        , 
        255, 
        37, 
        , 
        32, 
        64, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        16, 
        , 
        , 
        , 
        24, 
        , 
        , 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        1, 
        , 
        , 
        , 
        48, 
        , 
        , 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        72, 
        , 
        , 
        , 
        88, 
        64, 
        , 
        , 
        68, 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        68, 
        2, 
        52, 
        , 
        , 
        , 
        86, 
        , 
        83, 
        , 
        95, 
        , 
        86, 
        , 
        69, 
        , 
        82, 
        , 
        83, 
        , 
        73, 
        , 
        79, 
        , 
        78, 
        , 
        95, 
        , 
        73, 
        , 
        78, 
        , 
        70, 
        , 
        79, 
        , 
        , 
        , 
        , 
        , 
        189, 
        4, 
        239, 
        254, 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        63, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        68, 
        , 
        , 
        , 
        1, 
        , 
        86, 
        , 
        97, 
        , 
        114, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        73, 
        , 
        110, 
        , 
        102, 
        , 
        111, 
        , 
        , 
        , 
        , 
        , 
        36, 
        , 
        4, 
        , 
        , 
        , 
        84, 
        , 
        114, 
        , 
        97, 
        , 
        110, 
        , 
        115, 
        , 
        108, 
        , 
        97, 
        , 
        116, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        176, 
        4, 
        164, 
        1, 
        , 
        , 
        1, 
        , 
        83, 
        , 
        116, 
        , 
        114, 
        , 
        105, 
        , 
        110, 
        , 
        103, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        73, 
        , 
        110, 
        , 
        102, 
        , 
        111, 
        , 
        , 
        , 
        128, 
        1, 
        , 
        , 
        1, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        52, 
        , 
        98, 
        , 
        48, 
        , 
        , 
        , 
        44, 
        , 
        2, 
        , 
        1, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        68, 
        , 
        101, 
        , 
        115, 
        , 
        99, 
        , 
        114, 
        , 
        105, 
        , 
        112, 
        , 
        116, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        48, 
        , 
        8, 
        , 
        1, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        56, 
        , 
        11, 
        , 
        1, 
        , 
        73, 
        , 
        110, 
        , 
        116, 
        , 
        101, 
        , 
        114, 
        , 
        110, 
        , 
        97, 
        , 
        108, 
        , 
        78, 
        , 
        97, 
        , 
        109, 
        , 
        101, 
        , 
        , 
        , 
        115, 
        , 
        97, 
        , 
        109, 
        , 
        112, 
        , 
        108, 
        , 
        101, 
        , 
        46, 
        , 
        101, 
        , 
        120, 
        , 
        101, 
        , 
        , 
        , 
        , 
        , 
        40, 
        , 
        2, 
        , 
        1, 
        , 
        76, 
        , 
        101, 
        , 
        103, 
        , 
        97, 
        , 
        108, 
        , 
        67, 
        , 
        111, 
        , 
        112, 
        , 
        121, 
        , 
        114, 
        , 
        105, 
        , 
        103, 
        , 
        104, 
        , 
        116, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        64, 
        , 
        11, 
        , 
        1, 
        , 
        79, 
        , 
        114, 
        , 
        105, 
        , 
        103, 
        , 
        105, 
        , 
        110, 
        , 
        97, 
        , 
        108, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        110, 
        , 
        97, 
        , 
        109, 
        , 
        101, 
        , 
        , 
        , 
        115, 
        , 
        97, 
        , 
        109, 
        , 
        112, 
        , 
        108, 
        , 
        101, 
        , 
        46, 
        , 
        101, 
        , 
        120, 
        , 
        101, 
        , 
        , 
        , 
        , 
        , 
        52, 
        , 
        8, 
        , 
        1, 
        , 
        80, 
        , 
        114, 
        , 
        111, 
        , 
        100, 
        , 
        117, 
        , 
        99, 
        , 
        116, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        56, 
        , 
        8, 
        , 
        1, 
        , 
        65, 
        , 
        115, 
        , 
        115, 
        , 
        101, 
        , 
        109, 
        , 
        98, 
        , 
        108, 
        , 
        121, 
        , 
        32, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        12, 
        , 
        , 
        , 
        64, 
        51
    ];
    sampleBuf[3071] = 0;
    for(var i = 0; i < sampleBuf.length; i++) {
        if(!sampleBuf[i]) {
            sampleBuf[i] = 0;
        }
    }
    function read_succeds() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
    }
    test_DosHeader_read_sampleExe.read_succeds = read_succeds;
    function read_mz_MZ() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.mz !== pe.headers.MZSignature.MZ) {
            throw doh.mz;
        }
    }
    test_DosHeader_read_sampleExe.read_mz_MZ = read_mz_MZ;
    function read_cblp_144() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cblp !== 144) {
            throw doh.cblp;
        }
    }
    test_DosHeader_read_sampleExe.read_cblp_144 = read_cblp_144;
    function read_cp_3() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cp !== 3) {
            throw doh.cp;
        }
    }
    test_DosHeader_read_sampleExe.read_cp_3 = read_cp_3;
    function read_crlc_0() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.crlc !== 0) {
            throw doh.crlc;
        }
    }
    test_DosHeader_read_sampleExe.read_crlc_0 = read_crlc_0;
    function read_cparhdr_4() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cparhdr !== 4) {
            throw doh.cparhdr;
        }
    }
    test_DosHeader_read_sampleExe.read_cparhdr_4 = read_cparhdr_4;
    function read_minalloc_0() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.minalloc !== 0) {
            throw doh.minalloc;
        }
    }
    test_DosHeader_read_sampleExe.read_minalloc_0 = read_minalloc_0;
    function read_maxalloc_65535() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.maxalloc !== 65535) {
            throw doh.maxalloc;
        }
    }
    test_DosHeader_read_sampleExe.read_maxalloc_65535 = read_maxalloc_65535;
    function read_ss_0() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.ss !== 0) {
            throw doh.ss;
        }
    }
    test_DosHeader_read_sampleExe.read_ss_0 = read_ss_0;
    function read_sp_184() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.sp !== 184) {
            throw doh.sp;
        }
    }
    test_DosHeader_read_sampleExe.read_sp_184 = read_sp_184;
    function read_csum_0() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.csum !== 0) {
            throw doh.csum;
        }
    }
    test_DosHeader_read_sampleExe.read_csum_0 = read_csum_0;
    function read_ip_0() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.ip !== 0) {
            throw doh.ip;
        }
    }
    test_DosHeader_read_sampleExe.read_ip_0 = read_ip_0;
    function read_cs_0() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cs !== 0) {
            throw doh.cs;
        }
    }
    test_DosHeader_read_sampleExe.read_cs_0 = read_cs_0;
    function read_lfarc_64() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.lfarlc !== 64) {
            throw doh.lfarlc;
        }
    }
    test_DosHeader_read_sampleExe.read_lfarc_64 = read_lfarc_64;
    function read_ovno_0() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.ovno !== 0) {
            throw doh.ovno;
        }
    }
    test_DosHeader_read_sampleExe.read_ovno_0 = read_ovno_0;
    function read_res1_0() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.res1.toString() !== "0h") {
            throw doh.res1;
        }
    }
    test_DosHeader_read_sampleExe.read_res1_0 = read_res1_0;
    function read_oemid_0() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.oemid !== 0) {
            throw doh.oemid;
        }
    }
    test_DosHeader_read_sampleExe.read_oemid_0 = read_oemid_0;
    function read_oeminfo_0() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.oeminfo !== 0) {
            throw doh.oeminfo;
        }
    }
    test_DosHeader_read_sampleExe.read_oeminfo_0 = read_oeminfo_0;
    function read_reserved_00000() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        var reservedStr = doh.reserved.join(",");
        if(reservedStr !== "0,0,0,0,0") {
            throw reservedStr;
        }
    }
    test_DosHeader_read_sampleExe.read_reserved_00000 = read_reserved_00000;
    function read_dosHeader_lfanew_128() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(0, 64));
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.lfanew !== 128) {
            throw doh.lfanew;
        }
    }
    test_DosHeader_read_sampleExe.read_dosHeader_lfanew_128 = read_dosHeader_lfanew_128;
})(test_DosHeader_read_sampleExe || (test_DosHeader_read_sampleExe = {}));
var test_DosHeader_read_MZ2345;
(function (test_DosHeader_read_MZ2345) {
    var sampleBuf = (function () {
        var array = [
            ("M").charCodeAt(0), 
            ("Z").charCodeAt(0)
        ];
        for(var i = 0; i < 64; i++) {
            if(i == 0 || i == 1) {
                continue;
            }
            array[i] = i;
        }
        return array;
    })();
    function read_succeds() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
    }
    test_DosHeader_read_MZ2345.read_succeds = read_succeds;
    function read_mz_MZ() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.mz !== pe.headers.MZSignature.MZ) {
            throw doh.mz;
        }
    }
    test_DosHeader_read_MZ2345.read_mz_MZ = read_mz_MZ;
    function read_cblp_770() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cblp !== 770) {
            throw doh.cblp;
        }
    }
    test_DosHeader_read_MZ2345.read_cblp_770 = read_cblp_770;
    function read_cp_1284() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cp !== 1284) {
            throw doh.cp;
        }
    }
    test_DosHeader_read_MZ2345.read_cp_1284 = read_cp_1284;
    function read_crlc_1798() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.crlc !== 1798) {
            throw doh.crlc;
        }
    }
    test_DosHeader_read_MZ2345.read_crlc_1798 = read_crlc_1798;
    function read_cparhdr_2312() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cparhdr !== 2312) {
            throw doh.cparhdr;
        }
    }
    test_DosHeader_read_MZ2345.read_cparhdr_2312 = read_cparhdr_2312;
    function read_minalloc_2826() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.minalloc !== 2826) {
            throw doh.minalloc;
        }
    }
    test_DosHeader_read_MZ2345.read_minalloc_2826 = read_minalloc_2826;
    function read_maxalloc_3340() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.maxalloc !== 3340) {
            throw doh.maxalloc;
        }
    }
    test_DosHeader_read_MZ2345.read_maxalloc_3340 = read_maxalloc_3340;
    function read_ss_3854() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.ss !== 3854) {
            throw doh.ss;
        }
    }
    test_DosHeader_read_MZ2345.read_ss_3854 = read_ss_3854;
    function read_sp_4368() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.sp !== 4368) {
            throw doh.sp;
        }
    }
    test_DosHeader_read_MZ2345.read_sp_4368 = read_sp_4368;
    function read_csum_4882() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.csum !== 4882) {
            throw doh.csum;
        }
    }
    test_DosHeader_read_MZ2345.read_csum_4882 = read_csum_4882;
    function read_ip_5396() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.ip !== 5396) {
            throw doh.ip;
        }
    }
    test_DosHeader_read_MZ2345.read_ip_5396 = read_ip_5396;
    function read_cs_5910() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cs !== 5910) {
            throw doh.cs;
        }
    }
    test_DosHeader_read_MZ2345.read_cs_5910 = read_cs_5910;
    function read_lfarc_6424() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.lfarlc !== 6424) {
            throw doh.lfarlc;
        }
    }
    test_DosHeader_read_MZ2345.read_lfarc_6424 = read_lfarc_6424;
    function read_ovno_6938() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.ovno !== 6938) {
            throw doh.ovno;
        }
    }
    test_DosHeader_read_MZ2345.read_ovno_6938 = read_ovno_6938;
    function read_res1_232221201F1E1D1C() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.res1.toString() !== "232221201F1E1D1Ch") {
            throw doh.res1;
        }
    }
    test_DosHeader_read_MZ2345.read_res1_232221201F1E1D1C = read_res1_232221201F1E1D1C;
    function read_oemid_9508() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.oemid !== 9508) {
            throw doh.oemid;
        }
    }
    test_DosHeader_read_MZ2345.read_oemid_9508 = read_oemid_9508;
    function read_oeminfo_10022() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.oeminfo !== 10022) {
            throw doh.oeminfo;
        }
    }
    test_DosHeader_read_MZ2345.read_oeminfo_10022 = read_oeminfo_10022;
    function read_reserved_724183336_791555372_858927408_926299444_993671480() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        var reservedStr = doh.reserved.join(",");
        if(reservedStr !== "724183336,791555372,858927408,926299444,993671480") {
            throw reservedStr;
        }
    }
    test_DosHeader_read_MZ2345.read_reserved_724183336_791555372_858927408_926299444_993671480 = read_reserved_724183336_791555372_858927408_926299444_993671480;
    function read_dosHeader_lfanew_1061043516() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.lfanew !== 1061043516) {
            throw doh.lfanew;
        }
    }
    test_DosHeader_read_MZ2345.read_dosHeader_lfanew_1061043516 = read_dosHeader_lfanew_1061043516;
})(test_DosHeader_read_MZ2345 || (test_DosHeader_read_MZ2345 = {}));
var test_PEHeader_read_sampleExe;
(function (test_PEHeader_read_sampleExe) {
    var sampleBuf = [
        77, 
        90, 
        144, 
        , 
        3, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        255, 
        255, 
        , 
        , 
        184, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        128, 
        , 
        , 
        , 
        14, 
        31, 
        186, 
        14, 
        , 
        180, 
        9, 
        205, 
        33, 
        184, 
        1, 
        76, 
        205, 
        33, 
        84, 
        104, 
        105, 
        115, 
        32, 
        112, 
        114, 
        111, 
        103, 
        114, 
        97, 
        109, 
        32, 
        99, 
        97, 
        110, 
        110, 
        111, 
        116, 
        32, 
        98, 
        101, 
        32, 
        114, 
        117, 
        110, 
        32, 
        105, 
        110, 
        32, 
        68, 
        79, 
        83, 
        32, 
        109, 
        111, 
        100, 
        101, 
        46, 
        13, 
        13, 
        10, 
        36, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        80, 
        69, 
        , 
        , 
        76, 
        1, 
        3, 
        , 
        195, 
        135, 
        151, 
        80, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        224, 
        , 
        2, 
        1, 
        11, 
        1, 
        8, 
        , 
        , 
        4, 
        , 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        62, 
        35, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        32, 
        , 
        , 
        , 
        2, 
        , 
        , 
        4, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        128, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        3, 
        , 
        64, 
        133, 
        , 
        , 
        16, 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        16, 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        228, 
        34, 
        , 
        , 
        87, 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        160, 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        96, 
        , 
        , 
        12, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        8, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        8, 
        32, 
        , 
        , 
        72, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        46, 
        116, 
        101, 
        120, 
        116, 
        , 
        , 
        , 
        68, 
        3, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        96, 
        46, 
        114, 
        115, 
        114, 
        99, 
        , 
        , 
        , 
        160, 
        2, 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        64, 
        46, 
        114, 
        101, 
        108, 
        111, 
        99, 
        , 
        , 
        12, 
        , 
        , 
        , 
        , 
        96, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        10, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        66, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        35, 
        , 
        , 
        , 
        , 
        , 
        , 
        72, 
        , 
        , 
        , 
        2, 
        , 
        5, 
        , 
        104, 
        32, 
        , 
        , 
        124, 
        2, 
        , 
        , 
        1, 
        , 
        , 
        , 
        1, 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        54, 
        , 
        114, 
        1, 
        , 
        , 
        112, 
        40, 
        3, 
        , 
        , 
        10, 
        , 
        42, 
        30, 
        2, 
        40, 
        4, 
        , 
        , 
        10, 
        42, 
        , 
        , 
        66, 
        83, 
        74, 
        66, 
        1, 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        12, 
        , 
        , 
        , 
        118, 
        50, 
        46, 
        48, 
        46, 
        53, 
        48, 
        55, 
        50, 
        55, 
        , 
        , 
        , 
        , 
        5, 
        , 
        108, 
        , 
        , 
        , 
        228, 
        , 
        , 
        , 
        35, 
        126, 
        , 
        , 
        80, 
        1, 
        , 
        , 
        184, 
        , 
        , 
        , 
        35, 
        83, 
        116, 
        114, 
        105, 
        110, 
        103, 
        115, 
        , 
        , 
        , 
        , 
        8, 
        2, 
        , 
        , 
        32, 
        , 
        , 
        , 
        35, 
        85, 
        83, 
        , 
        40, 
        2, 
        , 
        , 
        16, 
        , 
        , 
        , 
        35, 
        71, 
        85, 
        73, 
        68, 
        , 
        , 
        , 
        56, 
        2, 
        , 
        , 
        68, 
        , 
        , 
        , 
        35, 
        66, 
        108, 
        111, 
        98, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        2, 
        , 
        , 
        1, 
        71, 
        20, 
        , 
        , 
        9, 
        , 
        , 
        , 
        , 
        250, 
        1, 
        51, 
        , 
        22, 
        , 
        , 
        1, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        10, 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        6, 
        , 
        45, 
        , 
        38, 
        , 
        6, 
        , 
        95, 
        , 
        63, 
        , 
        6, 
        , 
        127, 
        , 
        63, 
        , 
        6, 
        , 
        164, 
        , 
        38, 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        1, 
        , 
        , 
        , 
        16, 
        , 
        21, 
        , 
        , 
        , 
        5, 
        , 
        1, 
        , 
        1, 
        , 
        80, 
        32, 
        , 
        , 
        , 
        , 
        145, 
        , 
        52, 
        , 
        10, 
        , 
        1, 
        , 
        94, 
        32, 
        , 
        , 
        , 
        , 
        134, 
        24, 
        57, 
        , 
        14, 
        , 
        1, 
        , 
        17, 
        , 
        57, 
        , 
        18, 
        , 
        25, 
        , 
        57, 
        , 
        14, 
        , 
        33, 
        , 
        172, 
        , 
        23, 
        , 
        9, 
        , 
        57, 
        , 
        14, 
        , 
        46, 
        , 
        11, 
        , 
        28, 
        , 
        46, 
        , 
        19, 
        , 
        37, 
        , 
        4, 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        157, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        29, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        60, 
        77, 
        111, 
        100, 
        117, 
        108, 
        101, 
        62, 
        , 
        115, 
        97, 
        109, 
        112, 
        108, 
        101, 
        46, 
        101, 
        120, 
        101, 
        , 
        80, 
        114, 
        111, 
        103, 
        114, 
        97, 
        109, 
        , 
        109, 
        115, 
        99, 
        111, 
        114, 
        108, 
        105, 
        98, 
        , 
        83, 
        121, 
        115, 
        116, 
        101, 
        109, 
        , 
        79, 
        98, 
        106, 
        101, 
        99, 
        116, 
        , 
        77, 
        97, 
        105, 
        110, 
        , 
        46, 
        99, 
        116, 
        111, 
        114, 
        , 
        83, 
        121, 
        115, 
        116, 
        101, 
        109, 
        46, 
        82, 
        117, 
        110, 
        116, 
        105, 
        109, 
        101, 
        46, 
        67, 
        111, 
        109, 
        112, 
        105, 
        108, 
        101, 
        114, 
        83, 
        101, 
        114, 
        118, 
        105, 
        99, 
        101, 
        115, 
        , 
        67, 
        111, 
        109, 
        112, 
        105, 
        108, 
        97, 
        116, 
        105, 
        111, 
        110, 
        82, 
        101, 
        108, 
        97, 
        120, 
        97, 
        116, 
        105, 
        111, 
        110, 
        115, 
        65, 
        116, 
        116, 
        114, 
        105, 
        98, 
        117, 
        116, 
        101, 
        , 
        82, 
        117, 
        110, 
        116, 
        105, 
        109, 
        101, 
        67, 
        111, 
        109, 
        112, 
        97, 
        116, 
        105, 
        98, 
        105, 
        108, 
        105, 
        116, 
        121, 
        65, 
        116, 
        116, 
        114, 
        105, 
        98, 
        117, 
        116, 
        101, 
        , 
        115, 
        97, 
        109, 
        112, 
        108, 
        101, 
        , 
        67, 
        111, 
        110, 
        115, 
        111, 
        108, 
        101, 
        , 
        87, 
        114, 
        105, 
        116, 
        101, 
        76, 
        105, 
        110, 
        101, 
        , 
        , 
        , 
        , 
        27, 
        72, 
        , 
        101, 
        , 
        108, 
        , 
        108, 
        , 
        111, 
        , 
        44, 
        , 
        32, 
        , 
        87, 
        , 
        111, 
        , 
        114, 
        , 
        108, 
        , 
        100, 
        , 
        33, 
        , 
        , 
        , 
        , 
        , 
        146, 
        199, 
        156, 
        13, 
        90, 
        202, 
        19, 
        73, 
        158, 
        118, 
        143, 
        24, 
        114, 
        188, 
        194, 
        39, 
        , 
        8, 
        183, 
        122, 
        92, 
        86, 
        25, 
        52, 
        224, 
        137, 
        3, 
        , 
        , 
        1, 
        3, 
        32, 
        , 
        1, 
        4, 
        32, 
        1, 
        1, 
        8, 
        4, 
        , 
        1, 
        1, 
        14, 
        8, 
        1, 
        , 
        8, 
        , 
        , 
        , 
        , 
        , 
        30, 
        1, 
        , 
        1, 
        , 
        84, 
        2, 
        22, 
        87, 
        114, 
        97, 
        112, 
        78, 
        111, 
        110, 
        69, 
        120, 
        99, 
        101, 
        112, 
        116, 
        105, 
        111, 
        110, 
        84, 
        104, 
        114, 
        111, 
        119, 
        115, 
        1, 
        12, 
        35, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        46, 
        35, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        35, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        95, 
        67, 
        111, 
        114, 
        69, 
        120, 
        101, 
        77, 
        97, 
        105, 
        110, 
        , 
        109, 
        115, 
        99, 
        111, 
        114, 
        101, 
        101, 
        46, 
        100, 
        108, 
        108, 
        , 
        , 
        , 
        , 
        , 
        255, 
        37, 
        , 
        32, 
        64, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        16, 
        , 
        , 
        , 
        24, 
        , 
        , 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        1, 
        , 
        , 
        , 
        48, 
        , 
        , 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        72, 
        , 
        , 
        , 
        88, 
        64, 
        , 
        , 
        68, 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        68, 
        2, 
        52, 
        , 
        , 
        , 
        86, 
        , 
        83, 
        , 
        95, 
        , 
        86, 
        , 
        69, 
        , 
        82, 
        , 
        83, 
        , 
        73, 
        , 
        79, 
        , 
        78, 
        , 
        95, 
        , 
        73, 
        , 
        78, 
        , 
        70, 
        , 
        79, 
        , 
        , 
        , 
        , 
        , 
        189, 
        4, 
        239, 
        254, 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        63, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        68, 
        , 
        , 
        , 
        1, 
        , 
        86, 
        , 
        97, 
        , 
        114, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        73, 
        , 
        110, 
        , 
        102, 
        , 
        111, 
        , 
        , 
        , 
        , 
        , 
        36, 
        , 
        4, 
        , 
        , 
        , 
        84, 
        , 
        114, 
        , 
        97, 
        , 
        110, 
        , 
        115, 
        , 
        108, 
        , 
        97, 
        , 
        116, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        176, 
        4, 
        164, 
        1, 
        , 
        , 
        1, 
        , 
        83, 
        , 
        116, 
        , 
        114, 
        , 
        105, 
        , 
        110, 
        , 
        103, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        73, 
        , 
        110, 
        , 
        102, 
        , 
        111, 
        , 
        , 
        , 
        128, 
        1, 
        , 
        , 
        1, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        52, 
        , 
        98, 
        , 
        48, 
        , 
        , 
        , 
        44, 
        , 
        2, 
        , 
        1, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        68, 
        , 
        101, 
        , 
        115, 
        , 
        99, 
        , 
        114, 
        , 
        105, 
        , 
        112, 
        , 
        116, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        48, 
        , 
        8, 
        , 
        1, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        56, 
        , 
        11, 
        , 
        1, 
        , 
        73, 
        , 
        110, 
        , 
        116, 
        , 
        101, 
        , 
        114, 
        , 
        110, 
        , 
        97, 
        , 
        108, 
        , 
        78, 
        , 
        97, 
        , 
        109, 
        , 
        101, 
        , 
        , 
        , 
        115, 
        , 
        97, 
        , 
        109, 
        , 
        112, 
        , 
        108, 
        , 
        101, 
        , 
        46, 
        , 
        101, 
        , 
        120, 
        , 
        101, 
        , 
        , 
        , 
        , 
        , 
        40, 
        , 
        2, 
        , 
        1, 
        , 
        76, 
        , 
        101, 
        , 
        103, 
        , 
        97, 
        , 
        108, 
        , 
        67, 
        , 
        111, 
        , 
        112, 
        , 
        121, 
        , 
        114, 
        , 
        105, 
        , 
        103, 
        , 
        104, 
        , 
        116, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        64, 
        , 
        11, 
        , 
        1, 
        , 
        79, 
        , 
        114, 
        , 
        105, 
        , 
        103, 
        , 
        105, 
        , 
        110, 
        , 
        97, 
        , 
        108, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        110, 
        , 
        97, 
        , 
        109, 
        , 
        101, 
        , 
        , 
        , 
        115, 
        , 
        97, 
        , 
        109, 
        , 
        112, 
        , 
        108, 
        , 
        101, 
        , 
        46, 
        , 
        101, 
        , 
        120, 
        , 
        101, 
        , 
        , 
        , 
        , 
        , 
        52, 
        , 
        8, 
        , 
        1, 
        , 
        80, 
        , 
        114, 
        , 
        111, 
        , 
        100, 
        , 
        117, 
        , 
        99, 
        , 
        116, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        56, 
        , 
        8, 
        , 
        1, 
        , 
        65, 
        , 
        115, 
        , 
        115, 
        , 
        101, 
        , 
        109, 
        , 
        98, 
        , 
        108, 
        , 
        121, 
        , 
        32, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        12, 
        , 
        , 
        , 
        64, 
        51
    ];
    sampleBuf[3071] = 0;
    for(var i = 0; i < sampleBuf.length; i++) {
        if(!sampleBuf[i]) {
            sampleBuf[i] = 0;
        }
    }
    function read_succeds() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(128));
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
    }
    test_PEHeader_read_sampleExe.read_succeds = read_succeds;
    function read_pe_PE() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(128));
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.pe !== pe.headers.PESignature.PE) {
            throw peh.pe;
        }
    }
    test_PEHeader_read_sampleExe.read_pe_PE = read_pe_PE;
    function read_machine_I386() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(128));
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.machine !== pe.headers.Machine.I386) {
            throw peh.machine;
        }
    }
    test_PEHeader_read_sampleExe.read_machine_I386 = read_machine_I386;
    function read_numberOfSections_3() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(128));
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.numberOfSections !== 3) {
            throw peh.numberOfSections;
        }
    }
    test_PEHeader_read_sampleExe.read_numberOfSections_3 = read_numberOfSections_3;
    function read_timestamp_2012Nov5_093251() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(128));
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        var expectedDate = new Date(2012, 10, 5, 9, 32, 51);
        if(peh.timestamp.getTime() !== expectedDate.getTime()) {
            throw peh.timestamp + " expected " + expectedDate;
        }
    }
    test_PEHeader_read_sampleExe.read_timestamp_2012Nov5_093251 = read_timestamp_2012Nov5_093251;
    function read_pointerToSymbolTable_0() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(128));
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.pointerToSymbolTable !== 0) {
            throw peh.pointerToSymbolTable;
        }
    }
    test_PEHeader_read_sampleExe.read_pointerToSymbolTable_0 = read_pointerToSymbolTable_0;
    function read_numberOfSymbols_0() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(128));
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.numberOfSymbols !== 0) {
            throw peh.numberOfSymbols;
        }
    }
    test_PEHeader_read_sampleExe.read_numberOfSymbols_0 = read_numberOfSymbols_0;
    function read_sizeOfOptionalHeader_224() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(128));
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.sizeOfOptionalHeader !== 224) {
            throw peh.sizeOfOptionalHeader;
        }
    }
    test_PEHeader_read_sampleExe.read_sizeOfOptionalHeader_224 = read_sizeOfOptionalHeader_224;
    function read_characteristics_Bit32MachineExecutableImage() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(128));
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        var expected = pe.headers.ImageCharacteristics.Bit32Machine | pe.headers.ImageCharacteristics.ExecutableImage;
        if(peh.characteristics !== expected) {
            throw peh.characteristics + " expected " + expected;
        }
    }
    test_PEHeader_read_sampleExe.read_characteristics_Bit32MachineExecutableImage = read_characteristics_Bit32MachineExecutableImage;
})(test_PEHeader_read_sampleExe || (test_PEHeader_read_sampleExe = {}));
var test_PEHeader_read_PE004567;
(function (test_PEHeader_read_PE004567) {
    var sampleBuf = (function () {
        var array = [
            ("P").charCodeAt(0), 
            ("E").charCodeAt(0), 
            0, 
            0
        ];
        for(var i = 0; i < 1000; i++) {
            if(i < 4) {
                continue;
            }
            array[i] = i;
        }
        return array;
    })();
    function read_succeds() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
    }
    test_PEHeader_read_PE004567.read_succeds = read_succeds;
    function read_pe_PE() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.pe !== pe.headers.PESignature.PE) {
            throw peh.pe;
        }
    }
    test_PEHeader_read_PE004567.read_pe_PE = read_pe_PE;
    function read_machine_1284() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.machine !== 1284) {
            throw peh.machine;
        }
    }
    test_PEHeader_read_PE004567.read_machine_1284 = read_machine_1284;
    function read_numberOfSections_1798() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.numberOfSections !== 1798) {
            throw peh.numberOfSections;
        }
    }
    test_PEHeader_read_PE004567.read_numberOfSections_1798 = read_numberOfSections_1798;
    function read_timestamp_1975Nov14_142408() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        var expectedDate = new Date(1975, 10, 14, 14, 24, 8);
        if(peh.timestamp.getTime() !== expectedDate.getTime()) {
            throw peh.timestamp + " expected " + expectedDate;
        }
    }
    test_PEHeader_read_PE004567.read_timestamp_1975Nov14_142408 = read_timestamp_1975Nov14_142408;
    function read_pointerToSymbolTable_252579084() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.pointerToSymbolTable !== 252579084) {
            throw peh.pointerToSymbolTable;
        }
    }
    test_PEHeader_read_PE004567.read_pointerToSymbolTable_252579084 = read_pointerToSymbolTable_252579084;
    function read_numberOfSymbols_319951120() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.numberOfSymbols !== 319951120) {
            throw peh.numberOfSymbols;
        }
    }
    test_PEHeader_read_PE004567.read_numberOfSymbols_319951120 = read_numberOfSymbols_319951120;
    function read_sizeOfOptionalHeader_5396() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.sizeOfOptionalHeader !== 5396) {
            throw peh.sizeOfOptionalHeader;
        }
    }
    test_PEHeader_read_PE004567.read_sizeOfOptionalHeader_5396 = read_sizeOfOptionalHeader_5396;
    function read_characteristics_5910() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.characteristics !== 5910) {
            throw peh.characteristics;
        }
    }
    test_PEHeader_read_PE004567.read_characteristics_5910 = read_characteristics_5910;
})(test_PEHeader_read_PE004567 || (test_PEHeader_read_PE004567 = {}));
var test_OptionalHeader_read_sampleExe;
(function (test_OptionalHeader_read_sampleExe) {
    var sampleBuf = [
        77, 
        90, 
        144, 
        , 
        3, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        255, 
        255, 
        , 
        , 
        184, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        128, 
        , 
        , 
        , 
        14, 
        31, 
        186, 
        14, 
        , 
        180, 
        9, 
        205, 
        33, 
        184, 
        1, 
        76, 
        205, 
        33, 
        84, 
        104, 
        105, 
        115, 
        32, 
        112, 
        114, 
        111, 
        103, 
        114, 
        97, 
        109, 
        32, 
        99, 
        97, 
        110, 
        110, 
        111, 
        116, 
        32, 
        98, 
        101, 
        32, 
        114, 
        117, 
        110, 
        32, 
        105, 
        110, 
        32, 
        68, 
        79, 
        83, 
        32, 
        109, 
        111, 
        100, 
        101, 
        46, 
        13, 
        13, 
        10, 
        36, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        80, 
        69, 
        , 
        , 
        76, 
        1, 
        3, 
        , 
        195, 
        135, 
        151, 
        80, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        224, 
        , 
        2, 
        1, 
        11, 
        1, 
        8, 
        , 
        , 
        4, 
        , 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        62, 
        35, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        32, 
        , 
        , 
        , 
        2, 
        , 
        , 
        4, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        128, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        3, 
        , 
        64, 
        133, 
        , 
        , 
        16, 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        16, 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        228, 
        34, 
        , 
        , 
        87, 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        160, 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        96, 
        , 
        , 
        12, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        8, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        8, 
        32, 
        , 
        , 
        72, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        46, 
        116, 
        101, 
        120, 
        116, 
        , 
        , 
        , 
        68, 
        3, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        96, 
        46, 
        114, 
        115, 
        114, 
        99, 
        , 
        , 
        , 
        160, 
        2, 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        64, 
        46, 
        114, 
        101, 
        108, 
        111, 
        99, 
        , 
        , 
        12, 
        , 
        , 
        , 
        , 
        96, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        10, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        66, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        35, 
        , 
        , 
        , 
        , 
        , 
        , 
        72, 
        , 
        , 
        , 
        2, 
        , 
        5, 
        , 
        104, 
        32, 
        , 
        , 
        124, 
        2, 
        , 
        , 
        1, 
        , 
        , 
        , 
        1, 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        54, 
        , 
        114, 
        1, 
        , 
        , 
        112, 
        40, 
        3, 
        , 
        , 
        10, 
        , 
        42, 
        30, 
        2, 
        40, 
        4, 
        , 
        , 
        10, 
        42, 
        , 
        , 
        66, 
        83, 
        74, 
        66, 
        1, 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        12, 
        , 
        , 
        , 
        118, 
        50, 
        46, 
        48, 
        46, 
        53, 
        48, 
        55, 
        50, 
        55, 
        , 
        , 
        , 
        , 
        5, 
        , 
        108, 
        , 
        , 
        , 
        228, 
        , 
        , 
        , 
        35, 
        126, 
        , 
        , 
        80, 
        1, 
        , 
        , 
        184, 
        , 
        , 
        , 
        35, 
        83, 
        116, 
        114, 
        105, 
        110, 
        103, 
        115, 
        , 
        , 
        , 
        , 
        8, 
        2, 
        , 
        , 
        32, 
        , 
        , 
        , 
        35, 
        85, 
        83, 
        , 
        40, 
        2, 
        , 
        , 
        16, 
        , 
        , 
        , 
        35, 
        71, 
        85, 
        73, 
        68, 
        , 
        , 
        , 
        56, 
        2, 
        , 
        , 
        68, 
        , 
        , 
        , 
        35, 
        66, 
        108, 
        111, 
        98, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        2, 
        , 
        , 
        1, 
        71, 
        20, 
        , 
        , 
        9, 
        , 
        , 
        , 
        , 
        250, 
        1, 
        51, 
        , 
        22, 
        , 
        , 
        1, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        10, 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        6, 
        , 
        45, 
        , 
        38, 
        , 
        6, 
        , 
        95, 
        , 
        63, 
        , 
        6, 
        , 
        127, 
        , 
        63, 
        , 
        6, 
        , 
        164, 
        , 
        38, 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        1, 
        , 
        , 
        , 
        16, 
        , 
        21, 
        , 
        , 
        , 
        5, 
        , 
        1, 
        , 
        1, 
        , 
        80, 
        32, 
        , 
        , 
        , 
        , 
        145, 
        , 
        52, 
        , 
        10, 
        , 
        1, 
        , 
        94, 
        32, 
        , 
        , 
        , 
        , 
        134, 
        24, 
        57, 
        , 
        14, 
        , 
        1, 
        , 
        17, 
        , 
        57, 
        , 
        18, 
        , 
        25, 
        , 
        57, 
        , 
        14, 
        , 
        33, 
        , 
        172, 
        , 
        23, 
        , 
        9, 
        , 
        57, 
        , 
        14, 
        , 
        46, 
        , 
        11, 
        , 
        28, 
        , 
        46, 
        , 
        19, 
        , 
        37, 
        , 
        4, 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        157, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        29, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        60, 
        77, 
        111, 
        100, 
        117, 
        108, 
        101, 
        62, 
        , 
        115, 
        97, 
        109, 
        112, 
        108, 
        101, 
        46, 
        101, 
        120, 
        101, 
        , 
        80, 
        114, 
        111, 
        103, 
        114, 
        97, 
        109, 
        , 
        109, 
        115, 
        99, 
        111, 
        114, 
        108, 
        105, 
        98, 
        , 
        83, 
        121, 
        115, 
        116, 
        101, 
        109, 
        , 
        79, 
        98, 
        106, 
        101, 
        99, 
        116, 
        , 
        77, 
        97, 
        105, 
        110, 
        , 
        46, 
        99, 
        116, 
        111, 
        114, 
        , 
        83, 
        121, 
        115, 
        116, 
        101, 
        109, 
        46, 
        82, 
        117, 
        110, 
        116, 
        105, 
        109, 
        101, 
        46, 
        67, 
        111, 
        109, 
        112, 
        105, 
        108, 
        101, 
        114, 
        83, 
        101, 
        114, 
        118, 
        105, 
        99, 
        101, 
        115, 
        , 
        67, 
        111, 
        109, 
        112, 
        105, 
        108, 
        97, 
        116, 
        105, 
        111, 
        110, 
        82, 
        101, 
        108, 
        97, 
        120, 
        97, 
        116, 
        105, 
        111, 
        110, 
        115, 
        65, 
        116, 
        116, 
        114, 
        105, 
        98, 
        117, 
        116, 
        101, 
        , 
        82, 
        117, 
        110, 
        116, 
        105, 
        109, 
        101, 
        67, 
        111, 
        109, 
        112, 
        97, 
        116, 
        105, 
        98, 
        105, 
        108, 
        105, 
        116, 
        121, 
        65, 
        116, 
        116, 
        114, 
        105, 
        98, 
        117, 
        116, 
        101, 
        , 
        115, 
        97, 
        109, 
        112, 
        108, 
        101, 
        , 
        67, 
        111, 
        110, 
        115, 
        111, 
        108, 
        101, 
        , 
        87, 
        114, 
        105, 
        116, 
        101, 
        76, 
        105, 
        110, 
        101, 
        , 
        , 
        , 
        , 
        27, 
        72, 
        , 
        101, 
        , 
        108, 
        , 
        108, 
        , 
        111, 
        , 
        44, 
        , 
        32, 
        , 
        87, 
        , 
        111, 
        , 
        114, 
        , 
        108, 
        , 
        100, 
        , 
        33, 
        , 
        , 
        , 
        , 
        , 
        146, 
        199, 
        156, 
        13, 
        90, 
        202, 
        19, 
        73, 
        158, 
        118, 
        143, 
        24, 
        114, 
        188, 
        194, 
        39, 
        , 
        8, 
        183, 
        122, 
        92, 
        86, 
        25, 
        52, 
        224, 
        137, 
        3, 
        , 
        , 
        1, 
        3, 
        32, 
        , 
        1, 
        4, 
        32, 
        1, 
        1, 
        8, 
        4, 
        , 
        1, 
        1, 
        14, 
        8, 
        1, 
        , 
        8, 
        , 
        , 
        , 
        , 
        , 
        30, 
        1, 
        , 
        1, 
        , 
        84, 
        2, 
        22, 
        87, 
        114, 
        97, 
        112, 
        78, 
        111, 
        110, 
        69, 
        120, 
        99, 
        101, 
        112, 
        116, 
        105, 
        111, 
        110, 
        84, 
        104, 
        114, 
        111, 
        119, 
        115, 
        1, 
        12, 
        35, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        46, 
        35, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        35, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        95, 
        67, 
        111, 
        114, 
        69, 
        120, 
        101, 
        77, 
        97, 
        105, 
        110, 
        , 
        109, 
        115, 
        99, 
        111, 
        114, 
        101, 
        101, 
        46, 
        100, 
        108, 
        108, 
        , 
        , 
        , 
        , 
        , 
        255, 
        37, 
        , 
        32, 
        64, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        16, 
        , 
        , 
        , 
        24, 
        , 
        , 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        1, 
        , 
        , 
        , 
        48, 
        , 
        , 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        72, 
        , 
        , 
        , 
        88, 
        64, 
        , 
        , 
        68, 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        68, 
        2, 
        52, 
        , 
        , 
        , 
        86, 
        , 
        83, 
        , 
        95, 
        , 
        86, 
        , 
        69, 
        , 
        82, 
        , 
        83, 
        , 
        73, 
        , 
        79, 
        , 
        78, 
        , 
        95, 
        , 
        73, 
        , 
        78, 
        , 
        70, 
        , 
        79, 
        , 
        , 
        , 
        , 
        , 
        189, 
        4, 
        239, 
        254, 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        63, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        68, 
        , 
        , 
        , 
        1, 
        , 
        86, 
        , 
        97, 
        , 
        114, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        73, 
        , 
        110, 
        , 
        102, 
        , 
        111, 
        , 
        , 
        , 
        , 
        , 
        36, 
        , 
        4, 
        , 
        , 
        , 
        84, 
        , 
        114, 
        , 
        97, 
        , 
        110, 
        , 
        115, 
        , 
        108, 
        , 
        97, 
        , 
        116, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        176, 
        4, 
        164, 
        1, 
        , 
        , 
        1, 
        , 
        83, 
        , 
        116, 
        , 
        114, 
        , 
        105, 
        , 
        110, 
        , 
        103, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        73, 
        , 
        110, 
        , 
        102, 
        , 
        111, 
        , 
        , 
        , 
        128, 
        1, 
        , 
        , 
        1, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        52, 
        , 
        98, 
        , 
        48, 
        , 
        , 
        , 
        44, 
        , 
        2, 
        , 
        1, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        68, 
        , 
        101, 
        , 
        115, 
        , 
        99, 
        , 
        114, 
        , 
        105, 
        , 
        112, 
        , 
        116, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        48, 
        , 
        8, 
        , 
        1, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        56, 
        , 
        11, 
        , 
        1, 
        , 
        73, 
        , 
        110, 
        , 
        116, 
        , 
        101, 
        , 
        114, 
        , 
        110, 
        , 
        97, 
        , 
        108, 
        , 
        78, 
        , 
        97, 
        , 
        109, 
        , 
        101, 
        , 
        , 
        , 
        115, 
        , 
        97, 
        , 
        109, 
        , 
        112, 
        , 
        108, 
        , 
        101, 
        , 
        46, 
        , 
        101, 
        , 
        120, 
        , 
        101, 
        , 
        , 
        , 
        , 
        , 
        40, 
        , 
        2, 
        , 
        1, 
        , 
        76, 
        , 
        101, 
        , 
        103, 
        , 
        97, 
        , 
        108, 
        , 
        67, 
        , 
        111, 
        , 
        112, 
        , 
        121, 
        , 
        114, 
        , 
        105, 
        , 
        103, 
        , 
        104, 
        , 
        116, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        64, 
        , 
        11, 
        , 
        1, 
        , 
        79, 
        , 
        114, 
        , 
        105, 
        , 
        103, 
        , 
        105, 
        , 
        110, 
        , 
        97, 
        , 
        108, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        110, 
        , 
        97, 
        , 
        109, 
        , 
        101, 
        , 
        , 
        , 
        115, 
        , 
        97, 
        , 
        109, 
        , 
        112, 
        , 
        108, 
        , 
        101, 
        , 
        46, 
        , 
        101, 
        , 
        120, 
        , 
        101, 
        , 
        , 
        , 
        , 
        , 
        52, 
        , 
        8, 
        , 
        1, 
        , 
        80, 
        , 
        114, 
        , 
        111, 
        , 
        100, 
        , 
        117, 
        , 
        99, 
        , 
        116, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        56, 
        , 
        8, 
        , 
        1, 
        , 
        65, 
        , 
        115, 
        , 
        115, 
        , 
        101, 
        , 
        109, 
        , 
        98, 
        , 
        108, 
        , 
        121, 
        , 
        32, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        12, 
        , 
        , 
        , 
        64, 
        51
    ];
    sampleBuf[3071] = 0;
    for(var i = 0; i < sampleBuf.length; i++) {
        if(!sampleBuf[i]) {
            sampleBuf[i] = 0;
        }
    }
    function read_succeds() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
    }
    test_OptionalHeader_read_sampleExe.read_succeds = read_succeds;
    function read_peMagic_NT32() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.peMagic !== pe.headers.PEMagic.NT32) {
            throw oph.peMagic;
        }
    }
    test_OptionalHeader_read_sampleExe.read_peMagic_NT32 = read_peMagic_NT32;
    function read_linkerVersion_80() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.linkerVersion !== "8.0") {
            throw oph.linkerVersion;
        }
    }
    test_OptionalHeader_read_sampleExe.read_linkerVersion_80 = read_linkerVersion_80;
    function read_sizeOfCode_1024() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfCode !== 1024) {
            throw oph.sizeOfCode;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sizeOfCode_1024 = read_sizeOfCode_1024;
    function read_sizeOfInitializedData_1536() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfInitializedData !== 1536) {
            throw oph.sizeOfInitializedData;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sizeOfInitializedData_1536 = read_sizeOfInitializedData_1536;
    function read_sizeOfUninitializedData_0() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfUninitializedData !== 0) {
            throw oph.sizeOfUninitializedData;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sizeOfUninitializedData_0 = read_sizeOfUninitializedData_0;
    function read_addressOfEntryPoint_9022() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.addressOfEntryPoint !== 9022) {
            throw oph.addressOfEntryPoint;
        }
    }
    test_OptionalHeader_read_sampleExe.read_addressOfEntryPoint_9022 = read_addressOfEntryPoint_9022;
    function read_baseOfCode_0x2000() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.baseOfCode !== 8192) {
            throw oph.baseOfCode;
        }
    }
    test_OptionalHeader_read_sampleExe.read_baseOfCode_0x2000 = read_baseOfCode_0x2000;
    function read_baseOfData_0x4000() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.baseOfData !== 16384) {
            throw oph.baseOfData;
        }
    }
    test_OptionalHeader_read_sampleExe.read_baseOfData_0x4000 = read_baseOfData_0x4000;
    function read_imageBase_0x4000() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.baseOfData !== 16384) {
            throw oph.baseOfData;
        }
    }
    test_OptionalHeader_read_sampleExe.read_imageBase_0x4000 = read_imageBase_0x4000;
    function read_sectionAlignment_0x2000() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sectionAlignment !== 8192) {
            throw oph.sectionAlignment;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sectionAlignment_0x2000 = read_sectionAlignment_0x2000;
    function read_fileAlignment_0x200() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.fileAlignment !== 512) {
            throw oph.fileAlignment;
        }
    }
    test_OptionalHeader_read_sampleExe.read_fileAlignment_0x200 = read_fileAlignment_0x200;
    function read_operatingSystemVersion_40() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.operatingSystemVersion !== "4.0") {
            throw oph.operatingSystemVersion;
        }
    }
    test_OptionalHeader_read_sampleExe.read_operatingSystemVersion_40 = read_operatingSystemVersion_40;
    function read_imageVersion_00() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.imageVersion !== "0.0") {
            throw oph.imageVersion;
        }
    }
    test_OptionalHeader_read_sampleExe.read_imageVersion_00 = read_imageVersion_00;
    function read_subsystemVersion_40() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.subsystemVersion !== "4.0") {
            throw oph.subsystemVersion;
        }
    }
    test_OptionalHeader_read_sampleExe.read_subsystemVersion_40 = read_subsystemVersion_40;
    function read_win32VersionValue_0() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.win32VersionValue !== 0) {
            throw oph.win32VersionValue;
        }
    }
    test_OptionalHeader_read_sampleExe.read_win32VersionValue_0 = read_win32VersionValue_0;
    function read_sizeOfImage_32768() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfImage !== 32768) {
            throw oph.sizeOfImage;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sizeOfImage_32768 = read_sizeOfImage_32768;
    function read_sizeOfHeaders_512() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfHeaders !== 512) {
            throw oph.sizeOfHeaders;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sizeOfHeaders_512 = read_sizeOfHeaders_512;
    function read_checkSum_0() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.checkSum !== 0) {
            throw oph.checkSum;
        }
    }
    test_OptionalHeader_read_sampleExe.read_checkSum_0 = read_checkSum_0;
    function read_subsystem_WindowsCUI() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.subsystem !== pe.headers.Subsystem.WindowsCUI) {
            throw oph.subsystem;
        }
    }
    test_OptionalHeader_read_sampleExe.read_subsystem_WindowsCUI = read_subsystem_WindowsCUI;
    function read_dllCharacteristics_0x8540() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.dllCharacteristics !== 34112) {
            throw oph.dllCharacteristics;
        }
    }
    test_OptionalHeader_read_sampleExe.read_dllCharacteristics_0x8540 = read_dllCharacteristics_0x8540;
    function read_sizeOfStackReserve_0x100000() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfStackReserve !== 1048576) {
            throw oph.sizeOfStackReserve;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sizeOfStackReserve_0x100000 = read_sizeOfStackReserve_0x100000;
    function read_sizeOfStackCommit_0x1000() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfStackCommit !== 4096) {
            throw oph.sizeOfStackCommit;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sizeOfStackCommit_0x1000 = read_sizeOfStackCommit_0x1000;
    function read_sizeOfHeapReserve_0x100000() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfHeapReserve !== 1048576) {
            throw oph.sizeOfHeapReserve;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sizeOfHeapReserve_0x100000 = read_sizeOfHeapReserve_0x100000;
    function read_sizeOfHeapCommit_0x1000() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfHeapCommit !== 4096) {
            throw oph.sizeOfHeapCommit;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sizeOfHeapCommit_0x1000 = read_sizeOfHeapCommit_0x1000;
    function read_loaderFlags_0() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.loaderFlags !== 0) {
            throw oph.loaderFlags;
        }
    }
    test_OptionalHeader_read_sampleExe.read_loaderFlags_0 = read_loaderFlags_0;
    function read_numberOfRvaAndSizes_16() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.numberOfRvaAndSizes !== 16) {
            throw oph.numberOfRvaAndSizes;
        }
    }
    test_OptionalHeader_read_sampleExe.read_numberOfRvaAndSizes_16 = read_numberOfRvaAndSizes_16;
    function read_dataDirectories_length_16() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf.slice(152));
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.dataDirectories.length !== 16) {
            throw oph.dataDirectories.length;
        }
    }
    test_OptionalHeader_read_sampleExe.read_dataDirectories_length_16 = read_dataDirectories_length_16;
})(test_OptionalHeader_read_sampleExe || (test_OptionalHeader_read_sampleExe = {}));
var test_OptionalHeader_read_NT322345;
(function (test_OptionalHeader_read_NT322345) {
    var sampleBuf = (function () {
        var array = [
            pe.headers.PEMagic.NT32 & 255, 
            (pe.headers.PEMagic.NT32 >> 8) & 255
        ];
        for(var i = 0; i < 92; i++) {
            if(i == 0 || i == 1) {
                continue;
            }
            array[i] = i;
        }
        array[array.length] = 1;
        array[array.length] = 0;
        array[array.length] = 0;
        array[array.length] = 0;
        return array;
    })();
    function read_succeds() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
    }
    test_OptionalHeader_read_NT322345.read_succeds = read_succeds;
    function read_peMagic_NT32() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.peMagic !== pe.headers.PEMagic.NT32) {
            throw oph.peMagic;
        }
    }
    test_OptionalHeader_read_NT322345.read_peMagic_NT32 = read_peMagic_NT32;
    function read_linkerVersion_23() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.linkerVersion !== "2.3") {
            throw oph.linkerVersion;
        }
    }
    test_OptionalHeader_read_NT322345.read_linkerVersion_23 = read_linkerVersion_23;
    function read_sizeOfCode_117835012() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfCode !== 117835012) {
            throw oph.sizeOfCode;
        }
    }
    test_OptionalHeader_read_NT322345.read_sizeOfCode_117835012 = read_sizeOfCode_117835012;
    function read_sizeOfInitializedData_185207048() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfInitializedData !== 185207048) {
            throw oph.sizeOfInitializedData;
        }
    }
    test_OptionalHeader_read_NT322345.read_sizeOfInitializedData_185207048 = read_sizeOfInitializedData_185207048;
    function read_sizeOfUninitializedData_252579084() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfUninitializedData !== 252579084) {
            throw oph.sizeOfUninitializedData;
        }
    }
    test_OptionalHeader_read_NT322345.read_sizeOfUninitializedData_252579084 = read_sizeOfUninitializedData_252579084;
    function read_addressOfEntryPoint_319951120() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.addressOfEntryPoint !== 319951120) {
            throw oph.addressOfEntryPoint;
        }
    }
    test_OptionalHeader_read_NT322345.read_addressOfEntryPoint_319951120 = read_addressOfEntryPoint_319951120;
    function read_baseOfCode_387323156() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.baseOfCode !== 387323156) {
            throw oph.baseOfCode;
        }
    }
    test_OptionalHeader_read_NT322345.read_baseOfCode_387323156 = read_baseOfCode_387323156;
    function read_baseOfData_454695192() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.baseOfData !== 454695192) {
            throw oph.baseOfData;
        }
    }
    test_OptionalHeader_read_NT322345.read_baseOfData_454695192 = read_baseOfData_454695192;
    function read_imageBase_454695192() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.baseOfData !== 454695192) {
            throw oph.baseOfData;
        }
    }
    test_OptionalHeader_read_NT322345.read_imageBase_454695192 = read_imageBase_454695192;
    function read_sectionAlignment_589439264() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sectionAlignment !== 589439264) {
            throw oph.sectionAlignment;
        }
    }
    test_OptionalHeader_read_NT322345.read_sectionAlignment_589439264 = read_sectionAlignment_589439264;
    function read_fileAlignment_656811300() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.fileAlignment !== 656811300) {
            throw oph.fileAlignment;
        }
    }
    test_OptionalHeader_read_NT322345.read_fileAlignment_656811300 = read_fileAlignment_656811300;
    function read_operatingSystemVersion_10536_11050() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.operatingSystemVersion !== "10536.11050") {
            throw oph.operatingSystemVersion;
        }
    }
    test_OptionalHeader_read_NT322345.read_operatingSystemVersion_10536_11050 = read_operatingSystemVersion_10536_11050;
    function read_imageVersion_11564_12078() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.imageVersion !== "11564.12078") {
            throw oph.imageVersion;
        }
    }
    test_OptionalHeader_read_NT322345.read_imageVersion_11564_12078 = read_imageVersion_11564_12078;
    function read_subsystemVersion_12592_13106() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.subsystemVersion !== "12592.13106") {
            throw oph.subsystemVersion;
        }
    }
    test_OptionalHeader_read_NT322345.read_subsystemVersion_12592_13106 = read_subsystemVersion_12592_13106;
    function read_win32VersionValue_926299444() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.win32VersionValue !== 926299444) {
            throw oph.win32VersionValue;
        }
    }
    test_OptionalHeader_read_NT322345.read_win32VersionValue_926299444 = read_win32VersionValue_926299444;
    function read_sizeOfImage_993671480() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfImage !== 993671480) {
            throw oph.sizeOfImage;
        }
    }
    test_OptionalHeader_read_NT322345.read_sizeOfImage_993671480 = read_sizeOfImage_993671480;
    function read_sizeOfHeaders_1061043516() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfHeaders !== 1061043516) {
            throw oph.sizeOfHeaders;
        }
    }
    test_OptionalHeader_read_NT322345.read_sizeOfHeaders_1061043516 = read_sizeOfHeaders_1061043516;
    function read_checkSum_1128415552() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.checkSum !== 1128415552) {
            throw oph.checkSum;
        }
    }
    test_OptionalHeader_read_NT322345.read_checkSum_1128415552 = read_checkSum_1128415552;
    function read_subsystem_17732() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.subsystem !== 17732) {
            throw oph.subsystem;
        }
    }
    test_OptionalHeader_read_NT322345.read_subsystem_17732 = read_subsystem_17732;
    function read_dllCharacteristics_18246() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.dllCharacteristics !== 18246) {
            throw oph.dllCharacteristics;
        }
    }
    test_OptionalHeader_read_NT322345.read_dllCharacteristics_18246 = read_dllCharacteristics_18246;
    function read_sizeOfStackReserve_1263159624() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfStackReserve !== 1263159624) {
            throw oph.sizeOfStackReserve;
        }
    }
    test_OptionalHeader_read_NT322345.read_sizeOfStackReserve_1263159624 = read_sizeOfStackReserve_1263159624;
    function read_sizeOfStackCommit_1330531660() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfStackCommit !== 1330531660) {
            throw oph.sizeOfStackCommit;
        }
    }
    test_OptionalHeader_read_NT322345.read_sizeOfStackCommit_1330531660 = read_sizeOfStackCommit_1330531660;
    function read_sizeOfHeapReserve_1397903696() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfHeapReserve !== 1397903696) {
            throw oph.sizeOfHeapReserve;
        }
    }
    test_OptionalHeader_read_NT322345.read_sizeOfHeapReserve_1397903696 = read_sizeOfHeapReserve_1397903696;
    function read_sizeOfHeapCommit_1465275732() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfHeapCommit !== 1465275732) {
            throw oph.sizeOfHeapCommit;
        }
    }
    test_OptionalHeader_read_NT322345.read_sizeOfHeapCommit_1465275732 = read_sizeOfHeapCommit_1465275732;
    function read_loaderFlags_1532647768() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.loaderFlags !== 1532647768) {
            throw oph.loaderFlags;
        }
    }
    test_OptionalHeader_read_NT322345.read_loaderFlags_1532647768 = read_loaderFlags_1532647768;
    function read_numberOfRvaAndSizes_1() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.numberOfRvaAndSizes !== 1) {
            throw oph.numberOfRvaAndSizes;
        }
    }
    test_OptionalHeader_read_NT322345.read_numberOfRvaAndSizes_1 = read_numberOfRvaAndSizes_1;
    function read_dataDirectories_length_1() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.dataDirectories.length !== 1) {
            throw oph.dataDirectories.length;
        }
    }
    test_OptionalHeader_read_NT322345.read_dataDirectories_length_1 = read_dataDirectories_length_1;
})(test_OptionalHeader_read_NT322345 || (test_OptionalHeader_read_NT322345 = {}));
var test_DllImport_read_sampleExe;
(function (test_DllImport_read_sampleExe) {
    var sampleBuf = [
        77, 
        90, 
        144, 
        , 
        3, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        255, 
        255, 
        , 
        , 
        184, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        128, 
        , 
        , 
        , 
        14, 
        31, 
        186, 
        14, 
        , 
        180, 
        9, 
        205, 
        33, 
        184, 
        1, 
        76, 
        205, 
        33, 
        84, 
        104, 
        105, 
        115, 
        32, 
        112, 
        114, 
        111, 
        103, 
        114, 
        97, 
        109, 
        32, 
        99, 
        97, 
        110, 
        110, 
        111, 
        116, 
        32, 
        98, 
        101, 
        32, 
        114, 
        117, 
        110, 
        32, 
        105, 
        110, 
        32, 
        68, 
        79, 
        83, 
        32, 
        109, 
        111, 
        100, 
        101, 
        46, 
        13, 
        13, 
        10, 
        36, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        80, 
        69, 
        , 
        , 
        76, 
        1, 
        3, 
        , 
        195, 
        135, 
        151, 
        80, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        224, 
        , 
        2, 
        1, 
        11, 
        1, 
        8, 
        , 
        , 
        4, 
        , 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        62, 
        35, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        32, 
        , 
        , 
        , 
        2, 
        , 
        , 
        4, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        128, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        3, 
        , 
        64, 
        133, 
        , 
        , 
        16, 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        16, 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        228, 
        34, 
        , 
        , 
        87, 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        160, 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        96, 
        , 
        , 
        12, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        8, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        8, 
        32, 
        , 
        , 
        72, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        46, 
        116, 
        101, 
        120, 
        116, 
        , 
        , 
        , 
        68, 
        3, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        96, 
        46, 
        114, 
        115, 
        114, 
        99, 
        , 
        , 
        , 
        160, 
        2, 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        64, 
        46, 
        114, 
        101, 
        108, 
        111, 
        99, 
        , 
        , 
        12, 
        , 
        , 
        , 
        , 
        96, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        10, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        66, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        35, 
        , 
        , 
        , 
        , 
        , 
        , 
        72, 
        , 
        , 
        , 
        2, 
        , 
        5, 
        , 
        104, 
        32, 
        , 
        , 
        124, 
        2, 
        , 
        , 
        1, 
        , 
        , 
        , 
        1, 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        54, 
        , 
        114, 
        1, 
        , 
        , 
        112, 
        40, 
        3, 
        , 
        , 
        10, 
        , 
        42, 
        30, 
        2, 
        40, 
        4, 
        , 
        , 
        10, 
        42, 
        , 
        , 
        66, 
        83, 
        74, 
        66, 
        1, 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        12, 
        , 
        , 
        , 
        118, 
        50, 
        46, 
        48, 
        46, 
        53, 
        48, 
        55, 
        50, 
        55, 
        , 
        , 
        , 
        , 
        5, 
        , 
        108, 
        , 
        , 
        , 
        228, 
        , 
        , 
        , 
        35, 
        126, 
        , 
        , 
        80, 
        1, 
        , 
        , 
        184, 
        , 
        , 
        , 
        35, 
        83, 
        116, 
        114, 
        105, 
        110, 
        103, 
        115, 
        , 
        , 
        , 
        , 
        8, 
        2, 
        , 
        , 
        32, 
        , 
        , 
        , 
        35, 
        85, 
        83, 
        , 
        40, 
        2, 
        , 
        , 
        16, 
        , 
        , 
        , 
        35, 
        71, 
        85, 
        73, 
        68, 
        , 
        , 
        , 
        56, 
        2, 
        , 
        , 
        68, 
        , 
        , 
        , 
        35, 
        66, 
        108, 
        111, 
        98, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        2, 
        , 
        , 
        1, 
        71, 
        20, 
        , 
        , 
        9, 
        , 
        , 
        , 
        , 
        250, 
        1, 
        51, 
        , 
        22, 
        , 
        , 
        1, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        10, 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        6, 
        , 
        45, 
        , 
        38, 
        , 
        6, 
        , 
        95, 
        , 
        63, 
        , 
        6, 
        , 
        127, 
        , 
        63, 
        , 
        6, 
        , 
        164, 
        , 
        38, 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        1, 
        , 
        , 
        , 
        16, 
        , 
        21, 
        , 
        , 
        , 
        5, 
        , 
        1, 
        , 
        1, 
        , 
        80, 
        32, 
        , 
        , 
        , 
        , 
        145, 
        , 
        52, 
        , 
        10, 
        , 
        1, 
        , 
        94, 
        32, 
        , 
        , 
        , 
        , 
        134, 
        24, 
        57, 
        , 
        14, 
        , 
        1, 
        , 
        17, 
        , 
        57, 
        , 
        18, 
        , 
        25, 
        , 
        57, 
        , 
        14, 
        , 
        33, 
        , 
        172, 
        , 
        23, 
        , 
        9, 
        , 
        57, 
        , 
        14, 
        , 
        46, 
        , 
        11, 
        , 
        28, 
        , 
        46, 
        , 
        19, 
        , 
        37, 
        , 
        4, 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        157, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        29, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        60, 
        77, 
        111, 
        100, 
        117, 
        108, 
        101, 
        62, 
        , 
        115, 
        97, 
        109, 
        112, 
        108, 
        101, 
        46, 
        101, 
        120, 
        101, 
        , 
        80, 
        114, 
        111, 
        103, 
        114, 
        97, 
        109, 
        , 
        109, 
        115, 
        99, 
        111, 
        114, 
        108, 
        105, 
        98, 
        , 
        83, 
        121, 
        115, 
        116, 
        101, 
        109, 
        , 
        79, 
        98, 
        106, 
        101, 
        99, 
        116, 
        , 
        77, 
        97, 
        105, 
        110, 
        , 
        46, 
        99, 
        116, 
        111, 
        114, 
        , 
        83, 
        121, 
        115, 
        116, 
        101, 
        109, 
        46, 
        82, 
        117, 
        110, 
        116, 
        105, 
        109, 
        101, 
        46, 
        67, 
        111, 
        109, 
        112, 
        105, 
        108, 
        101, 
        114, 
        83, 
        101, 
        114, 
        118, 
        105, 
        99, 
        101, 
        115, 
        , 
        67, 
        111, 
        109, 
        112, 
        105, 
        108, 
        97, 
        116, 
        105, 
        111, 
        110, 
        82, 
        101, 
        108, 
        97, 
        120, 
        97, 
        116, 
        105, 
        111, 
        110, 
        115, 
        65, 
        116, 
        116, 
        114, 
        105, 
        98, 
        117, 
        116, 
        101, 
        , 
        82, 
        117, 
        110, 
        116, 
        105, 
        109, 
        101, 
        67, 
        111, 
        109, 
        112, 
        97, 
        116, 
        105, 
        98, 
        105, 
        108, 
        105, 
        116, 
        121, 
        65, 
        116, 
        116, 
        114, 
        105, 
        98, 
        117, 
        116, 
        101, 
        , 
        115, 
        97, 
        109, 
        112, 
        108, 
        101, 
        , 
        67, 
        111, 
        110, 
        115, 
        111, 
        108, 
        101, 
        , 
        87, 
        114, 
        105, 
        116, 
        101, 
        76, 
        105, 
        110, 
        101, 
        , 
        , 
        , 
        , 
        27, 
        72, 
        , 
        101, 
        , 
        108, 
        , 
        108, 
        , 
        111, 
        , 
        44, 
        , 
        32, 
        , 
        87, 
        , 
        111, 
        , 
        114, 
        , 
        108, 
        , 
        100, 
        , 
        33, 
        , 
        , 
        , 
        , 
        , 
        146, 
        199, 
        156, 
        13, 
        90, 
        202, 
        19, 
        73, 
        158, 
        118, 
        143, 
        24, 
        114, 
        188, 
        194, 
        39, 
        , 
        8, 
        183, 
        122, 
        92, 
        86, 
        25, 
        52, 
        224, 
        137, 
        3, 
        , 
        , 
        1, 
        3, 
        32, 
        , 
        1, 
        4, 
        32, 
        1, 
        1, 
        8, 
        4, 
        , 
        1, 
        1, 
        14, 
        8, 
        1, 
        , 
        8, 
        , 
        , 
        , 
        , 
        , 
        30, 
        1, 
        , 
        1, 
        , 
        84, 
        2, 
        22, 
        87, 
        114, 
        97, 
        112, 
        78, 
        111, 
        110, 
        69, 
        120, 
        99, 
        101, 
        112, 
        116, 
        105, 
        111, 
        110, 
        84, 
        104, 
        114, 
        111, 
        119, 
        115, 
        1, 
        12, 
        35, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        46, 
        35, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        35, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        95, 
        67, 
        111, 
        114, 
        69, 
        120, 
        101, 
        77, 
        97, 
        105, 
        110, 
        , 
        109, 
        115, 
        99, 
        111, 
        114, 
        101, 
        101, 
        46, 
        100, 
        108, 
        108, 
        , 
        , 
        , 
        , 
        , 
        255, 
        37, 
        , 
        32, 
        64, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        16, 
        , 
        , 
        , 
        24, 
        , 
        , 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        1, 
        , 
        , 
        , 
        48, 
        , 
        , 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        72, 
        , 
        , 
        , 
        88, 
        64, 
        , 
        , 
        68, 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        68, 
        2, 
        52, 
        , 
        , 
        , 
        86, 
        , 
        83, 
        , 
        95, 
        , 
        86, 
        , 
        69, 
        , 
        82, 
        , 
        83, 
        , 
        73, 
        , 
        79, 
        , 
        78, 
        , 
        95, 
        , 
        73, 
        , 
        78, 
        , 
        70, 
        , 
        79, 
        , 
        , 
        , 
        , 
        , 
        189, 
        4, 
        239, 
        254, 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        63, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        68, 
        , 
        , 
        , 
        1, 
        , 
        86, 
        , 
        97, 
        , 
        114, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        73, 
        , 
        110, 
        , 
        102, 
        , 
        111, 
        , 
        , 
        , 
        , 
        , 
        36, 
        , 
        4, 
        , 
        , 
        , 
        84, 
        , 
        114, 
        , 
        97, 
        , 
        110, 
        , 
        115, 
        , 
        108, 
        , 
        97, 
        , 
        116, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        176, 
        4, 
        164, 
        1, 
        , 
        , 
        1, 
        , 
        83, 
        , 
        116, 
        , 
        114, 
        , 
        105, 
        , 
        110, 
        , 
        103, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        73, 
        , 
        110, 
        , 
        102, 
        , 
        111, 
        , 
        , 
        , 
        128, 
        1, 
        , 
        , 
        1, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        52, 
        , 
        98, 
        , 
        48, 
        , 
        , 
        , 
        44, 
        , 
        2, 
        , 
        1, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        68, 
        , 
        101, 
        , 
        115, 
        , 
        99, 
        , 
        114, 
        , 
        105, 
        , 
        112, 
        , 
        116, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        48, 
        , 
        8, 
        , 
        1, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        56, 
        , 
        11, 
        , 
        1, 
        , 
        73, 
        , 
        110, 
        , 
        116, 
        , 
        101, 
        , 
        114, 
        , 
        110, 
        , 
        97, 
        , 
        108, 
        , 
        78, 
        , 
        97, 
        , 
        109, 
        , 
        101, 
        , 
        , 
        , 
        115, 
        , 
        97, 
        , 
        109, 
        , 
        112, 
        , 
        108, 
        , 
        101, 
        , 
        46, 
        , 
        101, 
        , 
        120, 
        , 
        101, 
        , 
        , 
        , 
        , 
        , 
        40, 
        , 
        2, 
        , 
        1, 
        , 
        76, 
        , 
        101, 
        , 
        103, 
        , 
        97, 
        , 
        108, 
        , 
        67, 
        , 
        111, 
        , 
        112, 
        , 
        121, 
        , 
        114, 
        , 
        105, 
        , 
        103, 
        , 
        104, 
        , 
        116, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        64, 
        , 
        11, 
        , 
        1, 
        , 
        79, 
        , 
        114, 
        , 
        105, 
        , 
        103, 
        , 
        105, 
        , 
        110, 
        , 
        97, 
        , 
        108, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        110, 
        , 
        97, 
        , 
        109, 
        , 
        101, 
        , 
        , 
        , 
        115, 
        , 
        97, 
        , 
        109, 
        , 
        112, 
        , 
        108, 
        , 
        101, 
        , 
        46, 
        , 
        101, 
        , 
        120, 
        , 
        101, 
        , 
        , 
        , 
        , 
        , 
        52, 
        , 
        8, 
        , 
        1, 
        , 
        80, 
        , 
        114, 
        , 
        111, 
        , 
        100, 
        , 
        117, 
        , 
        99, 
        , 
        116, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        56, 
        , 
        8, 
        , 
        1, 
        , 
        65, 
        , 
        115, 
        , 
        115, 
        , 
        101, 
        , 
        109, 
        , 
        98, 
        , 
        108, 
        , 
        121, 
        , 
        32, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        12, 
        , 
        , 
        , 
        64, 
        51
    ];
    sampleBuf[3071] = 0;
    for(var i = 0; i < sampleBuf.length; i++) {
        if(!sampleBuf[i]) {
            sampleBuf[i] = 0;
        }
    }
    function read_succeds() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var importRange = pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.ImportSymbols];
        var importRangeReader = new pe.io.RvaBinaryReader(bi, importRange.address, pef.sectionHeaders);
        pe.unmanaged.DllImport.read(importRangeReader);
    }
    test_DllImport_read_sampleExe.read_succeds = read_succeds;
    function read_length_1() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var importRange = pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.ImportSymbols];
        var importRangeReader = new pe.io.RvaBinaryReader(bi, importRange.address, pef.sectionHeaders);
        var imports = pe.unmanaged.DllImport.read(importRangeReader);
        if(imports.length !== 1) {
            throw imports.length;
        }
    }
    test_DllImport_read_sampleExe.read_length_1 = read_length_1;
    function read_0_dllName_mscoreeDll() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var importRange = pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.ImportSymbols];
        var importRangeReader = new pe.io.RvaBinaryReader(bi, importRange.address, pef.sectionHeaders);
        var imports = pe.unmanaged.DllImport.read(importRangeReader);
        if(imports[0].dllName !== "mscoree.dll") {
            throw imports[0].dllName;
        }
    }
    test_DllImport_read_sampleExe.read_0_dllName_mscoreeDll = read_0_dllName_mscoreeDll;
    function read_0_name__CorExeMain() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var importRange = pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.ImportSymbols];
        var importRangeReader = new pe.io.RvaBinaryReader(bi, importRange.address, pef.sectionHeaders);
        var imports = pe.unmanaged.DllImport.read(importRangeReader);
        if(imports[0].name !== "_CorExeMain") {
            throw imports[0].name;
        }
    }
    test_DllImport_read_sampleExe.read_0_name__CorExeMain = read_0_name__CorExeMain;
    function read_0_ordinal_0() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var importRange = pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.ImportSymbols];
        var importRangeReader = new pe.io.RvaBinaryReader(bi, importRange.address, pef.sectionHeaders);
        var imports = pe.unmanaged.DllImport.read(importRangeReader);
        if(imports[0].ordinal !== 0) {
            throw imports[0].ordinal;
        }
    }
    test_DllImport_read_sampleExe.read_0_ordinal_0 = read_0_ordinal_0;
})(test_DllImport_read_sampleExe || (test_DllImport_read_sampleExe = {}));
var test_DllImport_read_012345;
(function (test_DllImport_read_012345) {
    var sampleBuf = (function () {
        var buf = [];
        for(var i = 0; i < 400; i++) {
            buf[i] = 0;
        }
        buf[0] = 50;
        buf[1] = buf[2] = buf[3] = 0;
        buf[50] = 150;
        buf[51] = buf[52] = buf[53] = 0;
        buf[150] = 14;
        buf[151] = 0;
        buf[152] = ("Q").charCodeAt(0);
        buf[153] = 0;
        buf[12] = 100;
        buf[13] = buf[14] = buf[15] = 0;
        buf[100] = ("Y").charCodeAt(0);
        buf[101] = 0;
        buf[54] = 250;
        buf[55] = buf[56] = 0;
        buf[57] = 128;
        return buf;
    })();
    function read_succeds() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var imports = pe.unmanaged.DllImport.read(bi);
    }
    test_DllImport_read_012345.read_succeds = read_succeds;
    function read_length_2() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var imports = pe.unmanaged.DllImport.read(bi);
        if(imports.length !== 2) {
            throw imports.length;
        }
    }
    test_DllImport_read_012345.read_length_2 = read_length_2;
    function read_0_dllName_Y() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var imports = pe.unmanaged.DllImport.read(bi);
        if(imports[0].dllName !== "Y") {
            throw imports[0].dllName;
        }
    }
    test_DllImport_read_012345.read_0_dllName_Y = read_0_dllName_Y;
    function read_0_name_Q() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var imports = pe.unmanaged.DllImport.read(bi);
        if(imports[0].name !== "Q") {
            throw imports[0].name;
        }
    }
    test_DllImport_read_012345.read_0_name_Q = read_0_name_Q;
    function read_0_ordinal_14() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var imports = pe.unmanaged.DllImport.read(bi);
        if(imports[0].ordinal !== 14) {
            throw imports[0].ordinal;
        }
    }
    test_DllImport_read_012345.read_0_ordinal_14 = read_0_ordinal_14;
    function read_1_dllName_Y() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var imports = pe.unmanaged.DllImport.read(bi);
        if(imports[1].dllName !== "Y") {
            throw imports[1].dllName;
        }
    }
    test_DllImport_read_012345.read_1_dllName_Y = read_1_dllName_Y;
    function read_1_name_null() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var imports = pe.unmanaged.DllImport.read(bi);
        if(imports[1].name !== null) {
            throw imports[1].name;
        }
    }
    test_DllImport_read_012345.read_1_name_null = read_1_name_null;
    function read_1_ordinal_250() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var imports = pe.unmanaged.DllImport.read(bi);
        if(imports[1].ordinal !== 250) {
            throw imports[1].ordinal;
        }
    }
    test_DllImport_read_012345.read_1_ordinal_250 = read_1_ordinal_250;
})(test_DllImport_read_012345 || (test_DllImport_read_012345 = {}));
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
            logPrint(typeof (syncError) === "object" ? (syncError.stack ? syncError.stack : syncError.message ? syncError.message : syncError + "") : syncError === null ? "null" : (syncError + ""));
            test.success = false;
            updateTime();
            onfinish();
            return;
        }
        var openBracketPos = test.testMethod.toString().indexOf("(");
        if(openBracketPos > 0 && test.testMethod.toString().substring(openBracketPos + 1, openBracketPos + 2) === ")") {
            if(test.success === false) {
                return;
            }
            test.success = true;
            updateTime();
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
        TestCase.prototype.toString = function () {
            return this.name + " " + this.executionTimeMsec + "ms" + (this.success ? " OK" : " FAIL") + (this.logText ? " " : "") + (this.logText && this.logText.indexOf("\n") >= 0 ? "\n    " + this.logText.replace(/\n/g, "\n    ") : this.logText);
        };
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
                sysLog(tests[i].toString());
            }
        }
        var i = 0;
        var continueNext;
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
                continueNext();
            });
        }
        var nextQueued = true;
        continueNext = function () {
            return nextQueued = true;
        };
        while(nextQueued) {
            nextQueued = false;
            next();
        }
        try  {
            if(setTimeout) {
                continueNext = function () {
                    return setTimeout(next, 1);
                };
            } else {
                continueNext = null;
            }
        } catch (setTimeoutError) {
            continueNext = null;
        }
        if(!continueNext) {
            continueNext = next;
        }
    }
    TestRunner.runTests = runTests;
})(TestRunner || (TestRunner = {}));
TestRunner.runTests({
    test_PEFile: test_PEFile,
    test_DosHeader: test_DosHeader,
    test_PEHeader: test_PEHeader,
    test_OptionalHeader: test_OptionalHeader,
    test_SectionHeader: test_SectionHeader,
    test_DataDirectory: test_DataDirectory,
    test_Long: test_Long,
    test_BinaryReader: test_BinaryReader,
    test_DataViewBinaryReader: test_DataViewBinaryReader,
    test_BufferBinaryReader: test_BufferBinaryReader,
    test_PEFile_read: test_PEFile_read,
    test_DosHeader_read_sampleExe: test_DosHeader_read_sampleExe,
    test_DosHeader_read_012345: test_DosHeader_read_MZ2345,
    test_PEHeader_read_sampleExe: test_PEHeader_read_sampleExe,
    test_PEHeader_read_PE004567: test_PEHeader_read_PE004567,
    test_OptionalHeader_read_sampleExe: test_OptionalHeader_read_sampleExe,
    test_OptionalHeader_read_NT322345: test_OptionalHeader_read_NT322345,
    test_DllImport_read_sampleExe: test_DllImport_read_sampleExe,
    test_DllImport_read_012345: test_DllImport_read_012345
});
//@ sourceMappingURL=tests.js.map
