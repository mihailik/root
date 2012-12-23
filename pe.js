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
var pe;
(function (pe) {
    (function (io) {
        var AddressRange = (function () {
            function AddressRange(address, size) {
                this.address = address;
                this.size = size;
                if(!this.address) {
                    this.address = 0;
                }
                if(!this.size) {
                    this.size = 0;
                }
            }
            AddressRange.prototype.mapRelative = function (offset) {
                var result = offset - this.address;
                if(result >= 0 && result < this.size) {
                    return result;
                } else {
                    return -1;
                }
            };
            AddressRange.prototype.toString = function () {
                return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "h";
            };
            return AddressRange;
        })();
        io.AddressRange = AddressRange;        
        var AddressRangeMap = (function (_super) {
            __extends(AddressRangeMap, _super);
            function AddressRangeMap(address, size, virtualAddress) {
                        _super.call(this, address, size);
                this.virtualAddress = virtualAddress;
                if(!this.virtualAddress) {
                    this.virtualAddress = 0;
                }
            }
            AddressRangeMap.prototype.toString = function () {
                return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "@" + this.virtualAddress + "h";
            };
            return AddressRangeMap;
        })(AddressRange);
        io.AddressRangeMap = AddressRangeMap;        
    })(pe.io || (pe.io = {}));
    var io = pe.io;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (overrides) {
        var global = (function () {
            return this;
        })();
        function defineOverride(name, fallbackConstructor) {
            if(name in global) {
                return global[name];
            } else {
                return fallbackConstructor;
            }
        }
        overrides.DataView = defineOverride("DataView", FallbackDataView);
        overrides.Uint8Array = defineOverride("Uint8Array", FallbackUint8Array);
        var FallbackDataView = (function () {
            function FallbackDataView(buffer, bufferOffset, length) {
                this.buffer = buffer;
                this.bufferOffset = bufferOffset;
                this.length = length;
                if(!this.bufferOffset) {
                    this.bufferOffset = 0;
                }
                if(!this.length) {
                    this.length = this.buffer.length;
                }
            }
            FallbackDataView.prototype.getUint8 = function (offset) {
                if(offset < this.bufferOffset || offset + 1 > this.bufferOffset + this.length) {
                    throw new Error("Buffer overflow.");
                }
                return this.buffer[this.bufferOffset + offset];
            };
            FallbackDataView.prototype.getUint16 = function (offset) {
                if(offset < this.bufferOffset || offset + 2 > this.bufferOffset + this.length) {
                    throw new Error("Buffer overflow.");
                }
                var result = this.buffer[this.bufferOffset + offset] + (this.buffer[this.bufferOffset + offset + 1] << 8);
                return result;
            };
            FallbackDataView.prototype.getUint32 = function (offset) {
                if(offset < this.bufferOffset || offset + 4 > this.bufferOffset + this.length) {
                    throw new Error("Buffer overflow.");
                }
                var result = this.buffer[this.bufferOffset + offset] + (this.buffer[this.bufferOffset + offset + 1] << 8) + (this.buffer[this.bufferOffset + offset + 2] + (this.buffer[this.bufferOffset + offset + 3] << 8)) * 65536;
                return result;
            };
            return FallbackDataView;
        })();
        overrides.FallbackDataView = FallbackDataView;        
        function FallbackUint8Array(input, byteOffset, length) {
            if(typeof (input) === "number") {
                return Array(input);
            } else {
                if("length" in input) {
                    return typeof (length) === "number" ? input.slice(byteOffset, byteOffset + length) : typeof (byteOffset) === "number" ? input.slice(byteOffset) : input.slice(0);
                }
            }
        }
        overrides.FallbackUint8Array = FallbackUint8Array;
    })(pe.overrides || (pe.overrides = {}));
    var overrides = pe.overrides;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (io) {
        var BufferReader = (function () {
            function BufferReader(buffer, bufferOffset, length) {
                this.offset = 0;
                this.sections = [];
                this.currentSectionIndex = 0;
                this.view = typeof (length) === "number" ? new pe.overrides.DataView(buffer, bufferOffset, length) : typeof (bufferOffset) === "number" ? new pe.overrides.DataView(buffer, bufferOffset) : new pe.overrides.DataView(buffer);
            }
            BufferReader.prototype.readByte = function () {
                var result = this.view.getUint8(this.offset);
                this.offset++;
                return result;
            };
            BufferReader.prototype.peekByte = function () {
                var result = this.view.getUint8(this.offset);
                return result;
            };
            BufferReader.prototype.readShort = function () {
                var result = this.view.getUint16(this.offset, true);
                this.offset += 2;
                return result;
            };
            BufferReader.prototype.readInt = function () {
                var result = this.view.getUint32(this.offset, true);
                this.offset += 4;
                return result;
            };
            BufferReader.prototype.readLong = function () {
                var lo = this.view.getUint32(this.offset, true);
                var hi = this.view.getUint32(this.offset + 4, true);
                this.offset += 8;
                return new pe.Long(lo, hi);
            };
            BufferReader.prototype.readBytes = function (length) {
                var result = new pe.overrides.Uint8Array(this.view.buffer, this.view.byteOffset + this.offset, length);
                this.offset += length;
                return result;
            };
            BufferReader.prototype.readZeroFilledAscii = function (length) {
                var chars = [];
                for(var i = 0; i < length; i++) {
                    var charCode = this.view.getUint8(this.offset + i);
                    if(charCode == 0) {
                        continue;
                    }
                    chars.push(String.fromCharCode(charCode));
                }
                this.offset += length;
                return chars.join("");
            };
            BufferReader.prototype.readAsciiZ = function (maxLength) {
                if (typeof maxLength === "undefined") { maxLength = 1024; }
                var chars = [];
                var byteLength = 0;
                while(true) {
                    var nextChar = this.view.getUint8(this.offset + chars.length);
                    if(nextChar == 0) {
                        byteLength = chars.length + 1;
                        break;
                    }
                    chars.push(String.fromCharCode(nextChar));
                    if(chars.length == maxLength) {
                        byteLength = chars.length;
                        break;
                    }
                }
                this.offset += byteLength;
                return chars.join("");
            };
            BufferReader.prototype.readUtf8Z = function (maxLength) {
                var buffer = "";
                var isConversionRequired = false;
                for(var i = 0; !maxLength || i < maxLength; i++) {
                    var b = this.view.getUint8(this.offset + i);
                    if(b == 0) {
                        i++;
                        break;
                    }
                    if(b < 127) {
                        buffer += String.fromCharCode(b);
                    } else {
                        isConversionRequired = true;
                        buffer += "%";
                        buffer += b.toString(16);
                    }
                }
                this.offset += i;
                if(isConversionRequired) {
                    return decodeURIComponent(buffer);
                } else {
                    return buffer;
                }
            };
            BufferReader.prototype.getVirtualOffset = function () {
                var result = this.tryMapToVirtual(this.offset);
                if(result < 0) {
                    throw new Error("Cannot map current position into virtual address space.");
                }
                return result;
            };
            BufferReader.prototype.setVirtualOffset = function (rva) {
                if(this.currentSectionIndex >= 0 && this.currentSectionIndex < this.sections.length) {
                    var s = this.sections[this.currentSectionIndex];
                    var relative = rva - s.virtualAddress;
                    if(relative >= 0 && relative < s.size) {
                        this.offset = relative + s.address;
                        return;
                    }
                }
                for(var i = 0; i < this.sections.length; i++) {
                    var s = this.sections[i];
                    var relative = rva - s.virtualAddress;
                    if(relative >= 0 && relative < s.size) {
                        this.currentSectionIndex = i;
                        this.offset = relative + s.address;
                        return;
                    }
                }
                throw new Error("Address is outside of virtual address space.");
            };
            BufferReader.prototype.tryMapToVirtual = function (offset) {
                if(this.currentSectionIndex >= 0 && this.currentSectionIndex < this.sections.length) {
                    var s = this.sections[this.currentSectionIndex];
                    var relative = offset - s.address;
                    if(relative >= 0 && relative < s.size) {
                        return relative + s.virtualAddress;
                    }
                }
                for(var i = 0; i < this.sections.length; i++) {
                    var s = this.sections[i];
                    var relative = offset - s.address;
                    if(relative >= 0 && relative < s.size) {
                        this.currentSectionIndex = i;
                        return relative + s.virtualAddress;
                    }
                }
                return -1;
            };
            return BufferReader;
        })();
        io.BufferReader = BufferReader;        
    })(pe.io || (pe.io = {}));
    var io = pe.io;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (io) {
        function getFileBufferReader(file, onsuccess, onfailure) {
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
                    result = new io.BufferReader(resultArrayBuffer);
                } catch (error) {
                    onfailure(error);
                }
                onsuccess(result);
            };
            reader.readAsArrayBuffer(file);
        }
        io.getFileBufferReader = getFileBufferReader;
        function getUrlBufferReader(url, onsuccess, onfailure) {
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
                        result = new io.BufferReader(resultDataView);
                    } else {
                        var responseBody = new VBArray(request.responseBody).toArray();
                        var result = new io.BufferReader(responseBody);
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
        io.getUrlBufferReader = getUrlBufferReader;
        function bytesToHex(bytes) {
            if(!bytes) {
                return null;
            }
            var result = "";
            for(var i = 0; i < bytes.length; i++) {
                var hex = bytes[i].toString(16).toUpperCase();
                if(hex.length == 1) {
                    hex = "0" + hex;
                }
                result += hex;
            }
            return result;
        }
        io.bytesToHex = bytesToHex;
        function formatEnum(value, type) {
            if(!value) {
                if(typeof value == "null") {
                    return "null";
                } else {
                    if(typeof value == "undefined") {
                        return "undefined";
                    }
                }
            }
            var textValue = null;
            if(type._map) {
                textValue = type._map[value];
                if(!type._map_fixed) {
                    for(var e in type) {
                        var num = type[e];
                        if(typeof num == "number") {
                            type._map[num] = e;
                        }
                    }
                    type._map_fixed = true;
                    textValue = type._map[value];
                }
            }
            if(textValue == null) {
                if(typeof value == "number") {
                    var enumValues = [];
                    var accountedEnumValueMask = 0;
                    var zeroName = null;
                    for(var kvValueStr in type._map) {
                        var kvValue;
                        try  {
                            kvValue = Number(kvValueStr);
                        } catch (errorConverting) {
                            continue;
                        }
                        if(kvValue == 0) {
                            zeroName = kvKey;
                            continue;
                        }
                        var kvKey = type._map[kvValueStr];
                        if(typeof kvValue != "number") {
                            continue;
                        }
                        if((value & kvValue) == kvValue) {
                            enumValues.push(kvKey);
                            accountedEnumValueMask = accountedEnumValueMask | kvValue;
                        }
                    }
                    var spill = value & accountedEnumValueMask;
                    if(!spill) {
                        enumValues.push("#" + spill.toString(16).toUpperCase() + "h");
                    }
                    if(enumValues.length == 0) {
                        if(zeroName) {
                            textValue = zeroName;
                        } else {
                            textValue = "0";
                        }
                    } else {
                        textValue = enumValues.join('|');
                    }
                } else {
                    textValue = "enum:" + value;
                }
            }
            return textValue;
        }
        io.formatEnum = formatEnum;
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
                if(!this.reserved) {
                    this.reserved = [];
                }
                for(var i = 0; i < 5; i++) {
                    this.reserved[i] = reader.readInt();
                }
                this.reserved.length = 5;
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
                var result = pe.io.formatEnum(this.machine, Machine) + " " + pe.io.formatEnum(this.characteristics, ImageCharacteristics) + " " + "Sections[" + this.numberOfSections + "]";
                return result;
            };
            PEHeader.prototype.read = function (reader) {
                this.pe = reader.readInt();
                if(this.pe != PESignature.PE) {
                    throw new Error("PE signature is invalid: " + ((this.pe)).toString(16).toUpperCase() + "h.");
                }
                this.machine = reader.readShort();
                this.numberOfSections = reader.readShort();
                if(!this.timestamp) {
                    this.timestamp = new Date(0);
                }
                this.timestamp.setTime(reader.readInt() * 1000);
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
                var peMagicText = pe.io.formatEnum(this.peMagic, PEMagic);
                if(peMagicText) {
                    result.push(peMagicText);
                }
                var subsystemText = pe.io.formatEnum(this.subsystem, Subsystem);
                if(subsystemText) {
                    result.push(subsystemText);
                }
                var dllCharacteristicsText = pe.io.formatEnum(this.dllCharacteristics, DllCharacteristics);
                if(dllCharacteristicsText) {
                    result.push(dllCharacteristicsText);
                }
                var nonzeroDataDirectoriesText = [];
                if(this.dataDirectories) {
                    for(var i = 0; i < this.dataDirectories.length; i++) {
                        if(!this.dataDirectories[i] || this.dataDirectories[i].size <= 0) {
                            continue;
                        }
                        var kind = pe.io.formatEnum(i, DataDirectoryKind);
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
                        this.dataDirectories[i] = new pe.io.AddressRange(reader.readInt(), reader.readInt());
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
        var SectionHeader = (function (_super) {
            __extends(SectionHeader, _super);
            function SectionHeader() {
                        _super.call(this);
                this.name = "";
                this.pointerToRelocations = 0;
                this.pointerToLinenumbers = 0;
                this.numberOfRelocations = 0;
                this.numberOfLinenumbers = 0;
                this.characteristics = SectionCharacteristics.ContainsCode;
            }
            SectionHeader.prototype.toString = function () {
                var result = this.name + " " + _super.prototype.toString.call(this);
                return result;
            };
            SectionHeader.prototype.read = function (reader) {
                this.name = reader.readZeroFilledAscii(8);
                this.virtualSize = reader.readInt();
                this.virtualAddress = reader.readInt();
                var sizeOfRawData = reader.readInt();
                var pointerToRawData = reader.readInt();
                this.size = sizeOfRawData;
                this.address = pointerToRawData;
                this.pointerToRelocations = reader.readInt();
                this.pointerToLinenumbers = reader.readInt();
                this.numberOfRelocations = reader.readShort();
                this.numberOfLinenumbers = reader.readShort();
                this.characteristics = reader.readInt();
            };
            return SectionHeader;
        })(pe.io.AddressRangeMap);
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
        var PEFileHeaders = (function () {
            function PEFileHeaders() {
                this.dosHeader = new headers.DosHeader();
                this.peHeader = new headers.PEHeader();
                this.optionalHeader = new headers.OptionalHeader();
                this.sectionHeaders = [];
            }
            PEFileHeaders.prototype.toString = function () {
                var result = "dosHeader: " + (this.dosHeader ? this.dosHeader + "" : "null") + " " + "dosStub: " + (this.dosStub ? "[" + this.dosStub.length + "]" : "null") + " " + "peHeader: " + (this.peHeader ? "[" + this.peHeader.machine + "]" : "null") + " " + "optionalHeader: " + (this.optionalHeader ? "[" + pe.io.formatEnum(this.optionalHeader.subsystem, headers.Subsystem) + "," + this.optionalHeader.imageVersion + "]" : "null") + " " + "sectionHeaders: " + (this.sectionHeaders ? "[" + this.sectionHeaders.length + "]" : "null");
                return result;
            };
            PEFileHeaders.prototype.read = function (reader) {
                var dosHeaderSize = 64;
                if(!this.dosHeader) {
                    this.dosHeader = new headers.DosHeader();
                }
                this.dosHeader.read(reader);
                var dosHeaderLength = this.dosHeader.lfanew - dosHeaderSize;
                if(dosHeaderLength > 0) {
                    this.dosStub = reader.readBytes(dosHeaderLength);
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
            return PEFileHeaders;
        })();
        headers.PEFileHeaders = PEFileHeaders;        
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
                this.timeDateStamp = new Date(0);
            }
            DllImport.read = function read(reader, result) {
                if(!result) {
                    result = [];
                }
                var readLength = 0;
                while(true) {
                    var originalFirstThunk = reader.readInt();
                    var timeDateStamp = new Date(0);
                    timeDateStamp.setTime(reader.readInt());
                    var forwarderChain = reader.readInt();
                    var nameRva = reader.readInt();
                    var firstThunk = reader.readInt();
                    var thunkAddressPosition = originalFirstThunk == 0 ? firstThunk : originalFirstThunk;
                    if(thunkAddressPosition == 0) {
                        break;
                    }
                    var saveOffset = reader.offset;
                    var libraryName;
                    if(nameRva === 0) {
                        libraryName = null;
                    } else {
                        reader.setVirtualOffset(nameRva);
                        libraryName = reader.readAsciiZ();
                    }
                    reader.setVirtualOffset(thunkAddressPosition);
                    while(true) {
                        var newEntry = result[readLength];
                        if(!newEntry) {
                            newEntry = new DllImport();
                            result[readLength] = newEntry;
                        }
                        if(!newEntry.readEntry(reader)) {
                            break;
                        }
                        newEntry.dllName = libraryName;
                        newEntry.timeDateStamp = timeDateStamp;
                        readLength++;
                    }
                    reader.offset = saveOffset;
                }
                result.length = readLength;
                return result;
            }
            DllImport.prototype.readEntry = function (reader) {
                var importPosition = reader.readInt();
                if(importPosition == 0) {
                    return false;
                }
                if(importPosition & (1 << 31)) {
                    this.ordinal = importPosition & 2147483647;
                    this.name = null;
                } else {
                    var saveOffset = reader.offset;
                    reader.setVirtualOffset(importPosition);
                    var hint = reader.readShort();
                    var fname = reader.readAsciiZ();
                    this.ordinal = hint;
                    this.name = fname;
                    reader.offset = saveOffset;
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
                if(!result.timestamp) {
                    result.timestamp = new Date(0);
                }
                result.timestamp.setTime(reader.readInt() * 1000);
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
                    var saveOffset = reader.offset;
                    reader.setVirtualOffset(nameRva);
                    result.dllName = reader.readAsciiZ();
                    reader.offset = saveOffset;
                }
                result.length = addressTableEntries;
                for(var i = 0; i < addressTableEntries; i++) {
                    var exportEntry = new DllExport();
                    exportEntry.readExportEntry(reader, range);
                    exportEntry.ordinal = i + this.ordinalBase;
                    result[i] = exportEntry;
                }
                if(numberOfNamePointers != 0 && namePointerRva != 0 && ordinalTableRva != 0) {
                    saveOffset = reader.offset;
                    for(var i = 0; i < numberOfNamePointers; i++) {
                        reader.setVirtualOffset(ordinalTableRva + 2 * i);
                        var ordinal = reader.readShort();
                        reader.setVirtualOffset(namePointerRva + 4 * i);
                        var functionNameRva = reader.readInt();
                        var functionName;
                        if(functionNameRva == 0) {
                            functionName = null;
                        } else {
                            reader.setVirtualOffset(functionNameRva);
                            functionName = reader.readAsciiZ();
                        }
                        this.exports[ordinal].name = functionName;
                    }
                    reader.offset = saveOffset;
                }
                return result;
            }
            DllExport.prototype.readExportEntry = function (reader, range) {
                var exportOrForwarderRva = reader.readInt();
                if(range.mapRelative(exportOrForwarderRva) >= 0) {
                    this.exportRva = 0;
                    var forwarderRva = reader.readInt();
                    if(forwarderRva == 0) {
                        this.forwarder = null;
                    } else {
                        var saveOffset = reader.offset;
                        reader.setVirtualOffset(forwarderRva);
                        this.forwarder = reader.readAsciiZ();
                        reader.offset = saveOffset;
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
            ResourceDirectoryEntry.prototype.toString = function () {
                return (this.name ? this.name + " " : "") + this.integerId + (this.directory ? "[" + (this.directory.dataEntries ? this.directory.dataEntries.length : 0) + (this.directory.subdirectories ? this.directory.subdirectories.length : 0) + "]" : "[null]");
            };
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
            ResourceDataEntry.prototype.toString = function () {
                return (this.name ? this.name + " " : "") + this.integerId;
            };
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
                this.timestamp = new Date(0);
                this.version = "";
                this.subdirectories = [];
                this.dataEntries = [];
            }
            ResourceDirectory.prototype.toString = function () {
                return "subdirectories[" + (this.subdirectories ? this.subdirectories.length : "null") + "] " + "dataEntries[" + (this.dataEntries ? this.dataEntries.length : "null") + "]";
            };
            ResourceDirectory.prototype.read = function (reader) {
                var baseVirtualOffset = reader.getVirtualOffset();
                this.readCore(reader, baseVirtualOffset);
            };
            ResourceDirectory.prototype.readCore = function (reader, baseVirtualOffset) {
                this.characteristics = reader.readInt();
                if(!this.timestamp) {
                    this.timestamp = new Date(0);
                }
                this.timestamp.setTime(reader.readInt() * 1000);
                this.version = reader.readShort() + "." + reader.readShort();
                var nameEntryCount = reader.readShort();
                var idEntryCount = reader.readShort();
                var dataEntryCount = 0;
                var directoryEntryCount = 0;
                for(var i = 0; i < nameEntryCount + idEntryCount; i++) {
                    var idOrNameRva = reader.readInt();
                    var contentRva = reader.readInt();
                    var saveOffset = reader.offset;
                    var name;
                    var id;
                    var highBit = 2147483648;
                    if(idOrNameRva < highBit) {
                        id = idOrNameRva;
                        name = null;
                    } else {
                        id = 0;
                        reader.setVirtualOffset(baseVirtualOffset + idOrNameRva - highBit);
                        name = this.readName(reader);
                    }
                    if(contentRva < highBit) {
                        reader.setVirtualOffset(baseVirtualOffset + contentRva);
                        var dataEntry = this.dataEntries[dataEntryCount];
                        if(!dataEntry) {
                            this.dataEntries[dataEntryCount] = dataEntry = new unmanaged.ResourceDataEntry();
                        }
                        dataEntry.name = name;
                        dataEntry.integerId = id;
                        dataEntry.dataRva = reader.readInt();
                        dataEntry.size = reader.readInt();
                        dataEntry.codepage = reader.readInt();
                        dataEntry.reserved = reader.readInt();
                        dataEntryCount++;
                    } else {
                        contentRva = contentRva - highBit;
                        reader.setVirtualOffset(baseVirtualOffset + contentRva);
                        var directoryEntry = this.subdirectories[directoryEntryCount];
                        if(!directoryEntry) {
                            this.subdirectories[directoryEntryCount] = directoryEntry = new unmanaged.ResourceDirectoryEntry();
                        }
                        directoryEntry.name = name;
                        directoryEntry.integerId = id;
                        directoryEntry.directory = new ResourceDirectory();
                        directoryEntry.directory.readCore(reader, baseVirtualOffset);
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
                    this.location = new pe.io.AddressRangeMap();
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
                    this.metadataDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.imageFlags = clrDirReader.readInt();
                    this.entryPointToken = clrDirReader.readInt();
                    this.resourcesDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.strongNameSignatureDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.codeManagerTableDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.vtableFixupsDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.exportAddressTableJumpsDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.managedNativeHeaderDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                };
                ClrDirectory.prototype.read2 = function (clrDirReader) {
                    if(!this.location) {
                        this.location = new pe.io.AddressRangeMap(clrDirReader.offset, 0, clrDirReader.getVirtualOffset());
                    }
                    this.cb = clrDirReader.readInt();
                    if(this.cb < ClrDirectory.clrHeaderSize) {
                        throw new Error("Unexpectedly short CLR header structure " + this.cb + " reported by Cb field " + "(expected at least " + ClrDirectory.clrHeaderSize + ").");
                    }
                    this.runtimeVersion = clrDirReader.readShort() + "." + clrDirReader.readShort();
                    this.metadataDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.imageFlags = clrDirReader.readInt();
                    this.entryPointToken = clrDirReader.readInt();
                    this.resourcesDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.strongNameSignatureDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.codeManagerTableDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.vtableFixupsDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.exportAddressTableJumpsDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.managedNativeHeaderDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.location.size = clrDirReader.offset - this.location.address;
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
                    this.location = new pe.io.AddressRangeMap();
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
                ClrMetadata.prototype.read2 = function (reader) {
                    if(!this.location) {
                        this.location = new pe.io.AddressRangeMap(reader.offset, 0, reader.getVirtualOffset());
                    }
                    this.mdSignature = reader.readInt();
                    if(this.mdSignature != metadata.ClrMetadataSignature.Signature) {
                        throw new Error("Invalid CLR metadata signature field " + (this.mdSignature).toString(16) + "h (expected " + (metadata.ClrMetadataSignature.Signature).toString(16).toUpperCase() + "h).");
                    }
                    this.metadataVersion = reader.readShort() + "." + reader.readShort();
                    this.mdReserved = reader.readInt();
                    var metadataStringVersionLength = reader.readInt();
                    this.runtimeVersion = reader.readZeroFilledAscii(metadataStringVersionLength);
                    this.mdFlags = reader.readShort();
                    this.streamCount = reader.readShort();
                    this.location.size = reader.offset - this.location.address;
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
                        var range = new pe.io.AddressRange(reader.readInt(), reader.readInt());
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
                        var saveOffset = reader.offset;
                        reader.setVirtualOffset(guidRange.address);
                        this.guids = Array(guidRange.size / 16);
                        for(var i = 0; i < this.guids.length; i++) {
                            var guid = this.readGuidForStream(reader);
                            this.guids[i] = guid;
                        }
                        reader.offset = saveOffset;
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
                    for(var i = 0; i < skipCount; i++) {
                        reader.readByte();
                    }
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
            (function (CallingConventions) {
                CallingConventions._map = [];
                CallingConventions.Default = 0;
                CallingConventions.C = 1;
                CallingConventions.StdCall = 2;
                CallingConventions.FastCall = 4;
                CallingConventions.VarArg = 5;
                CallingConventions.Generic = 16;
                CallingConventions.HasThis = 32;
                CallingConventions.ExplicitThis = 64;
                CallingConventions.Sentinel = 65;
            })(metadata.CallingConventions || (metadata.CallingConventions = {}));
            var CallingConventions = metadata.CallingConventions;
            (function (TableKind) {
                TableKind._map = [];
                TableKind.Assembly = 32;
                TableKind.AssemblyProcessor = 33;
                TableKind.AssemblyOS = 34;
                TableKind.AssemblyRefOS = 37;
                TableKind.AssemblyRefProcessor = 36;
                TableKind.Module = 0;
                TableKind.ExternalType = 1;
                TableKind.TypeDef = 2;
                TableKind.FieldDefinition = 4;
                TableKind.MethodDef = 6;
                TableKind.ParameterDefinition = 8;
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
                TableKind.PropertyDefinition = 23;
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
                    this.readResolutionScope = this.createCodedIndexReader(metadata.TableKind.Module, metadata.TableKind.ModuleRef, metadata.TableKind.AssemblyRef, metadata.TableKind.ExternalType);
                    this.readTypeDefOrRef = this.createCodedIndexReader(metadata.TableKind.TypeDef, metadata.TableKind.ExternalType, metadata.TableKind.TypeSpec);
                    this.readHasConstant = this.createCodedIndexReader(metadata.TableKind.FieldDefinition, metadata.TableKind.ParameterDefinition, metadata.TableKind.PropertyDefinition);
                    this.readHasCustomAttribute = this.createCodedIndexReader(metadata.TableKind.MethodDef, metadata.TableKind.FieldDefinition, metadata.TableKind.ExternalType, metadata.TableKind.TypeDef, metadata.TableKind.ParameterDefinition, metadata.TableKind.InterfaceImpl, metadata.TableKind.MemberRef, metadata.TableKind.Module, 65535, metadata.TableKind.PropertyDefinition, metadata.TableKind.Event, metadata.TableKind.StandAloneSig, metadata.TableKind.ModuleRef, metadata.TableKind.TypeSpec, metadata.TableKind.Assembly, metadata.TableKind.AssemblyRef, metadata.TableKind.File, metadata.TableKind.ExportedType, metadata.TableKind.ManifestResource, metadata.TableKind.GenericParam, metadata.TableKind.GenericParamConstraint, metadata.TableKind.MethodSpec);
                    this.readCustomAttributeType = this.createCodedIndexReader(65535, 65535, metadata.TableKind.MethodDef, metadata.TableKind.MemberRef, 65535);
                    this.readHasDeclSecurity = this.createCodedIndexReader(metadata.TableKind.TypeDef, metadata.TableKind.MethodDef, metadata.TableKind.Assembly);
                    this.readImplementation = this.createCodedIndexReader(metadata.TableKind.File, metadata.TableKind.AssemblyRef, metadata.TableKind.ExportedType);
                    this.readHasFieldMarshal = this.createCodedIndexReader(metadata.TableKind.FieldDefinition, metadata.TableKind.ParameterDefinition);
                    this.readTypeOrMethodDef = this.createCodedIndexReader(metadata.TableKind.TypeDef, metadata.TableKind.MethodDef);
                    this.readMemberForwarded = this.createCodedIndexReader(metadata.TableKind.FieldDefinition, metadata.TableKind.MethodDef);
                    this.readMemberRefParent = this.createCodedIndexReader(metadata.TableKind.TypeDef, metadata.TableKind.ExternalType, metadata.TableKind.ModuleRef, metadata.TableKind.MethodDef, metadata.TableKind.TypeSpec);
                    this.readMethodDefOrRef = this.createCodedIndexReader(metadata.TableKind.MethodDef, metadata.TableKind.MemberRef);
                    this.readHasSemantics = this.createCodedIndexReader(metadata.TableKind.Event, metadata.TableKind.PropertyDefinition);
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
                            var saveOffset = this.baseReader.offset;
                            this.baseReader.setVirtualOffset(this.streams.strings.address + pos);
                            result = this.baseReader.readUtf8Z(1024 * 1024 * 1024);
                            this.baseReader.offset = saveOffset;
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
                TableStreamReader.prototype.readBlobHex = function () {
                    var blobIndex = this.readBlobIndex();
                    var saveOffset = this.baseReader.offset;
                    this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                    var length = this.readBlobSize();
                    var result = "";
                    for(var i = 0; i < length; i++) {
                        var hex = this.baseReader.readByte().toString(16);
                        if(hex.length == 1) {
                            result += "0";
                        }
                        result += hex;
                    }
                    this.baseReader.offset = saveOffset;
                    return result;
                };
                TableStreamReader.prototype.readBlob = function () {
                    var blobIndex = this.readBlobIndex();
                    var saveOffset = this.baseReader.offset;
                    this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                    var length = this.readBlobSize();
                    var result = this.baseReader.readBytes(length);
                    this.baseReader.offset = saveOffset;
                    return result;
                };
                TableStreamReader.prototype.readBlobIndex = function () {
                    return this.readPos(this.streams.blobs.size);
                };
                TableStreamReader.prototype.readBlobSize = function () {
                    var b0 = this.baseReader.readByte();
                    if(b0 < 128) {
                        length = b0;
                    } else {
                        var b1 = this.baseReader.readByte();
                        if((b0 & 192) == 128) {
                            length = ((b0 & 63) << 8) + b1;
                        } else {
                            var b2 = this.baseReader.readByte();
                            var b3 = this.baseReader.readByte();
                            length = ((b0 & 63) << 24) + (b1 << 16) + (b2 << 8) + b3;
                        }
                    }
                    return length;
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
                    return function () {
                        var result = tableKindBitCount + tableIndexBitCount <= 16 ? _this.baseReader.readShort() : _this.baseReader.readInt();
                        var resultIndex = result >> tableKindBitCount;
                        var resultTableIndex = result - (resultIndex << tableKindBitCount);
                        var table = tableTypes[resultTableIndex];
                        if(resultIndex == 0) {
                            return null;
                        }
                        resultIndex--;
                        var row = _this.tables[table][resultIndex];
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
                TableStreamReader.prototype.readMethodSignature = function (definition) {
                    var blobIndex = this.readBlobIndex();
                    var saveOffset = this.baseReader.offset;
                    this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                    var length = this.readBlobSize();
                    this.readSigMethodDefOrRefOrStandalone(definition);
                    this.baseReader.offset = saveOffset;
                };
                TableStreamReader.prototype.readMethodSpec = function (instantiation) {
                    var blobIndex = this.readBlobIndex();
                    var saveOffset = this.baseReader.offset;
                    this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                    var length = this.readBlobSize();
                    var leadByte = this.baseReader.readByte();
                    if(leadByte !== 10) {
                        throw new Error("Incorrect lead byte " + leadByte + " in MethodSpec signature.");
                    }
                    var genArgCount = this.readCompressedInt();
                    instantiation.length = genArgCount;
                    for(var i = 0; i < genArgCount; i++) {
                        var type = this.readSigTypeReference();
                        instantiation.push(type);
                    }
                    this.baseReader.offset = saveOffset;
                };
                TableStreamReader.prototype.readSigMethodDefOrRefOrStandalone = function (sig) {
                    var b = this.baseReader.readByte();
                    sig.callingConvention = b;
                    var genParameterCount = b & metadata.CallingConventions.Generic ? this.readCompressedInt() : 0;
                    var paramCount = this.readCompressedInt();
                    var returnTypeCustomModifiers = this.readSigCustomModifierList();
                    var returnType = this.readSigTypeReference();
                    sig.parameters = [];
                    sig.extraParameters = (sig.callingConvention & metadata.CallingConventions.VarArg) || (sig.callingConvention & metadata.CallingConventions.C) ? [] : null;
                    for(var i = 0; i < paramCount; i++) {
                        var p = this.readSigParam();
                        if(sig.extraParameters && sig.extraParameters.length > 0) {
                            sig.extraParameters.push(p);
                        } else {
                            if(sig.extraParameters && this.baseReader.peekByte() === metadata.CallingConventions.Sentinel) {
                                this.baseReader.offset++;
                                sig.extraParameters.push(p);
                            } else {
                                sig.parameters.push(p);
                            }
                        }
                    }
                };
                TableStreamReader.prototype.readFieldSignature = function (definition) {
                    var blobIndex = this.readBlobIndex();
                    var saveOffset = this.baseReader.offset;
                    this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                    var length = this.readBlobSize();
                    var leadByte = this.baseReader.readByte();
                    if(leadByte !== 6) {
                        throw new Error("Field signature lead byte 0x" + leadByte.toString(16).toUpperCase() + " is invalid.");
                    }
                    definition.customModifiers = this.readSigCustomModifierList();
                    definition.type = this.readSigTypeReference();
                    this.baseReader.offset = saveOffset;
                };
                TableStreamReader.prototype.readPropertySignature = function (definition) {
                    var blobIndex = this.readBlobIndex();
                    var saveOffset = this.baseReader.offset;
                    this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                    var length = this.readBlobSize();
                    var leadByte = this.baseReader.readByte();
                    if(!(leadByte & 8)) {
                        throw new Error("Property signature lead byte 0x" + leadByte.toString(16).toUpperCase() + " is invalid.");
                    }
                    definition.isStatic = !(leadByte & metadata.CallingConventions.HasThis);
                    var paramCount = this.readCompressedInt();
                    definition.customModifiers = this.readSigCustomModifierList();
                    definition.type = this.readSigTypeReference();
                    if(!definition.parameters) {
                        definition.parameters = [];
                    }
                    definition.parameters.length = paramCount;
                    for(var i = 0; i < paramCount; i++) {
                        definition.parameters[i] = this.readSigParam();
                    }
                    this.baseReader.offset = saveOffset;
                };
                TableStreamReader.prototype.readSigLocalVar = function () {
                    var leadByte = this.baseReader.readByte();
                    if(leadByte !== 7) {
                        throw new Error("LocalVarSig signature lead byte 0x" + leadByte.toString(16).toUpperCase() + " is invalid.");
                    }
                    var count = this.readCompressedInt();
                    var result = Array(count);
                    for(var i = 0; i < count; i++) {
                        var v = new managed.LocalVariable();
                        var varLeadByte = this.baseReader.peekByte();
                        if(varLeadByte === metadata.ElementType.TypedByRef) {
                            this.baseReader.offset++;
                            v.type = managed.KnownType.TypedReference;
                        } else {
                            while(true) {
                                var cmod = this.readSigCustomModifierOrNull();
                                if(cmod) {
                                    if(!v.customModifiers) {
                                        v.customModifiers = [];
                                    }
                                    v.customModifiers.push(cmod);
                                    continue;
                                }
                                if(this.baseReader.peekByte() === metadata.ElementType.Pinned) {
                                    this.baseReader.offset++;
                                    v.isPinned = true;
                                    continue;
                                }
                            }
                            v.type = this.readSigTypeReference();
                        }
                        result.push(v);
                    }
                    return result;
                };
                TableStreamReader.prototype.readSigCustomModifierOrNull = function () {
                    var s = this.baseReader.peekByte();
                    switch(s) {
                        case metadata.ElementType.CMod_Opt: {
                            this.baseReader.offset++;
                            return new managed.CustomModifier(false, this.readSigTypeDefOrRefOrSpecEncoded());

                        }
                        case metadata.ElementType.CMod_ReqD: {
                            this.baseReader.offset++;
                            return new managed.CustomModifier(true, this.readSigTypeDefOrRefOrSpecEncoded());

                        }
                        default: {
                            return null;

                        }
                    }
                };
                TableStreamReader.prototype.readSigTypeDefOrRefOrSpecEncoded = function () {
                    var uncompressed = this.readCompressedInt();
                    var index = Math.floor(uncompressed / 4);
                    var tableKind = uncompressed - index * 4;
                    var table;
                    switch(tableKind) {
                        case 0: {
                            table = this.tables[metadata.TableKind.TypeDef];
                            break;

                        }
                        case 1: {
                            table = this.tables[metadata.TableKind.ExternalType];
                            break;

                        }
                        case 2: {
                            table = this.tables[metadata.TableKind.TypeSpec];
                            break;

                        }
                        default: {
                            throw new Error("Unknown table kind " + tableKind + " in encoded index.");

                        }
                    }
                    var typeReference = table[index];
                    return typeReference.definition ? typeReference.definition : typeReference;
                };
                TableStreamReader.prototype.readSigCustomModifierList = function () {
                    var result = null;
                    while(true) {
                        var mod = this.readSigCustomModifierOrNull();
                        if(!mod) {
                            return result;
                        }
                        if(!result) {
                            result = [];
                        }
                        result.push(mod);
                    }
                };
                TableStreamReader.prototype.readSigParam = function () {
                    var customModifiers = this.readSigCustomModifierList();
                    var type = this.readSigTypeReference();
                    return new managed.ParameterSignature(customModifiers, type);
                };
                TableStreamReader.prototype.readSigTypeReference = function () {
                    var etype = this.baseReader.readByte();
                    switch(etype) {
                        case metadata.ElementType.Void: {
                            return managed.KnownType.Void;

                        }
                        case metadata.ElementType.Boolean: {
                            return managed.KnownType.Boolean;

                        }
                        case metadata.ElementType.Char: {
                            return managed.KnownType.Char;

                        }
                        case metadata.ElementType.I1: {
                            return managed.KnownType.SByte;

                        }
                        case metadata.ElementType.U1: {
                            return managed.KnownType.Byte;

                        }
                        case metadata.ElementType.I2: {
                            return managed.KnownType.Int16;

                        }
                        case metadata.ElementType.U2: {
                            return managed.KnownType.UInt16;

                        }
                        case metadata.ElementType.I4: {
                            return managed.KnownType.Int32;

                        }
                        case metadata.ElementType.U4: {
                            return managed.KnownType.UInt32;

                        }
                        case metadata.ElementType.I8: {
                            return managed.KnownType.Int64;

                        }
                        case metadata.ElementType.U8: {
                            return managed.KnownType.UInt64;

                        }
                        case metadata.ElementType.R4: {
                            return managed.KnownType.Single;

                        }
                        case metadata.ElementType.R8: {
                            return managed.KnownType.Double;

                        }
                        case metadata.ElementType.String: {
                            return managed.KnownType.String;

                        }
                        case metadata.ElementType.Ptr: {
                            return new managed.PointerType(this.readSigTypeReference());

                        }
                        case metadata.ElementType.ByRef: {
                            return new managed.ByRefType(this.readSigTypeReference());

                        }
                        case metadata.ElementType.ValueType: {
                            var value_type = this.readSigTypeDefOrRefOrSpecEncoded();
                            return value_type;

                        }
                        case metadata.ElementType.Class: {
                            var value_type = this.readSigTypeDefOrRefOrSpecEncoded();
                            return value_type;

                        }
                        case metadata.ElementType.Var: {
                            var varIndex = this.readCompressedInt();
                            return new managed.Var(varIndex);

                        }
                        case metadata.ElementType.Array: {
                            var arrayElementType = this.readSigTypeReference();
                            return this.readSigArrayShape(arrayElementType);

                        }
                        case metadata.ElementType.GenericInst: {
                            var genInst = new managed.GenericInstantiation();
                            var genLead = this.baseReader.readByte();
                            var isValueType;
                            switch(genLead) {
                                case metadata.ElementType.Class: {
                                    (genInst).isValueType = false;
                                    break;

                                }
                                case metadata.ElementType.ValueType: {
                                    (genInst).isValueType = true;
                                    break;

                                }
                                default: {
                                    throw new Error("Unexpected lead byte 0x" + genLead.toString(16).toUpperCase() + " in GenericInst type signature.");

                                }
                            }
                            genInst.genericType = this.readSigTypeDefOrRefOrSpecEncoded();
                            var genArgCount = this.readCompressedInt();
                            genInst.arguments = Array(genArgCount);
                            for(var iGen = 0; iGen < genArgCount; iGen++) {
                                genInst.arguments.push(this.readSigTypeReference());
                            }
                            return genInst;
                        }

                        case metadata.ElementType.TypedByRef: {
                            return managed.KnownType.TypedReference;

                        }
                        case metadata.ElementType.I: {
                            return managed.KnownType.IntPtr;

                        }
                        case metadata.ElementType.U: {
                            return managed.KnownType.UIntPtr;

                        }
                        case metadata.ElementType.FnPtr: {
                            var fnPointer = new managed.FunctionPointerType();
                            fnPointer.methodSignature = new managed.MethodSignature();
                            this.readSigMethodDefOrRefOrStandalone(fnPointer.methodSignature);
                            return fnPointer;

                        }
                        case metadata.ElementType.Object: {
                            return managed.KnownType.Object;

                        }
                        case metadata.ElementType.SZArray: {
                            return new managed.SZArrayType(this.readSigTypeReference());

                        }
                        case metadata.ElementType.MVar: {
                            var mvarIndex = this.readCompressedInt();
                            return new managed.MVar(mvarIndex);

                        }
                        case metadata.ElementType.Sentinel: {
                            return new managed.SentinelType(this.readSigTypeReference());

                        }
                        case metadata.ElementType.Pinned:
                        case metadata.ElementType.End:
                        case metadata.ElementType.Internal:
                        case metadata.ElementType.Modifier:
                        case metadata.ElementType.R4_Hfa:
                        case metadata.ElementType.R8_Hfa:
                        case metadata.ElementType.ArgumentType_:
                        case metadata.ElementType.CustomAttribute_BoxedObject_:
                        case metadata.ElementType.CustomAttribute_Field_:
                        case metadata.ElementType.CustomAttribute_Property_:
                        case metadata.ElementType.CustomAttribute_Enum_:
                        default: {
                            throw new Error("Unknown element type " + pe.io.formatEnum(etype, metadata.ElementType) + ".");

                        }
                    }
                };
                TableStreamReader.prototype.readSigArrayShape = function (arrayElementType) {
                    var rank = this.readCompressedInt();
                    var dimensions = Array(rank);
                    for(var i = 0; i < rank; i++) {
                        dimensions[i] = new managed.ArrayDimensionRange();
                    }
                    var numSizes = this.readCompressedInt();
                    for(var i = 0; i < numSizes; i++) {
                        dimensions[i].length = this.readCompressedInt();
                    }
                    var numLoBounds = this.readCompressedInt();
                    for(var i = 0; i < numLoBounds; i++) {
                        dimensions[i].lowBound = this.readCompressedInt();
                    }
                    return new managed.ArrayType(arrayElementType, dimensions);
                };
                TableStreamReader.prototype.readMemberSignature = function () {
                    var blobIndex = this.readBlobIndex();
                    var saveOffset = this.baseReader.offset;
                    this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                    var length = this.readBlobSize();
                    var result;
                    var leadByte = this.baseReader.peekByte();
                    if(leadByte & 5) {
                        this.baseReader.offset++;
                        result = new managed.FieldSignature();
                        result.customModifiers = this.readSigCustomModifierOrNull();
                        result.type = this.readSigTypeReference();
                    } else {
                        result = new managed.MethodSignature();
                        this.readSigMethodDefOrRefOrStandalone(result);
                    }
                    this.baseReader.offset = saveOffset;
                    return result;
                };
                TableStreamReader.prototype.readCompressedInt = function () {
                    var b0 = this.baseReader.readByte();
                    if(b0 < 128) {
                        length = b0;
                    } else {
                        var b1 = this.baseReader.readByte();
                        if((b0 & 192) == 128) {
                            length = ((b0 & 63) << 8) + b1;
                        } else {
                            var b2 = this.baseReader.readByte();
                            var b3 = this.baseReader.readByte();
                            length = ((b0 & 63) << 24) + (b1 << 16) + (b2 << 8) + b3;
                        }
                    }
                    return length;
                };
                TableStreamReader.prototype.readConstantValue = function (etype) {
                    var blobIndex = this.readBlobIndex();
                    var saveOffset = this.baseReader.offset;
                    this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                    var length = this.readBlobSize();
                    var result = this.readSigValue(etype, length);
                    this.baseReader.offset = saveOffset;
                    return result;
                };
                TableStreamReader.prototype.readSigValue = function (etype, length) {
                    switch(etype) {
                        case metadata.ElementType.Boolean: {
                            return this.baseReader.readByte() !== 0;

                        }
                        case metadata.ElementType.Char: {
                            return String.fromCharCode(this.baseReader.readShort());

                        }
                        case metadata.ElementType.I1: {
                            var result = this.baseReader.readByte();
                            if(result > 127) {
                                result -= 255;
                            }
                            return result;

                        }
                        case metadata.ElementType.U1: {
                            return this.baseReader.readByte();

                        }
                        case metadata.ElementType.I2: {
                            var result = this.baseReader.readShort();
                            if(result > 32767) {
                                result -= 65535;
                            }
                            return result;

                        }
                        case metadata.ElementType.U2: {
                            return this.baseReader.readShort();

                        }
                        case metadata.ElementType.I4: {
                            var result = this.baseReader.readInt();
                            if(result > 2147483647) {
                                result -= 4294967295;
                            }
                            return result;

                        }
                        case metadata.ElementType.U4: {
                            return this.baseReader.readInt();

                        }
                        case metadata.ElementType.I8:
                        case metadata.ElementType.U8: {
                            return this.baseReader.readLong();

                        }
                        case metadata.ElementType.R4: {
                            return this.baseReader.readInt();

                        }
                        case metadata.ElementType.R8: {
                            return this.baseReader.readLong();

                        }
                        case metadata.ElementType.String: {
                            var stringValue = "";
                            for(var iChar = 0; iChar < length / 2; iChar++) {
                                stringValue += String.fromCharCode(this.baseReader.readShort());
                            }
                            return stringValue;

                        }
                        case metadata.ElementType.Class: {
                            var classRef = this.baseReader.readInt();
                            if(classRef === 0) {
                                return null;
                            } else {
                                return classRef;
                            }

                        }
                        default: {
                            return "Unknown element type " + etype + ".";

                        }
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
                    this.definition = null;
                }
                Assembly.prototype.internalReadRow = function (reader) {
                    if(!this.definition) {
                        this.definition = new managed.AssemblyDefinition();
                    }
                    this.definition.hashAlgId = reader.readInt();
                    this.definition.version = reader.readShort() + "." + reader.readShort() + "." + reader.readShort() + "." + reader.readShort();
                    this.definition.flags = reader.readInt();
                    this.definition.publicKey = reader.readBlobHex();
                    this.definition.name = reader.readString();
                    this.definition.culture = reader.readString();
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
                AssemblyOS.prototype.internalReadRow = function (reader) {
                    this.osplatformID = reader.readInt();
                    this.osVersion = reader.readInt() + "." + reader.readInt();
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
                AssemblyProcessor.prototype.internalReadRow = function (reader) {
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
                AssemblyRef.prototype.internalReadRow = function (reader) {
                    if(!this.definition) {
                        this.definition = new managed.AssemblyDefinition();
                    }
                    this.definition.version = reader.readShort() + "." + reader.readShort() + "." + reader.readShort() + "." + reader.readShort();
                    this.definition.flags = reader.readInt();
                    this.definition.publicKey = reader.readBlobHex();
                    this.definition.name = reader.readString();
                    this.definition.culture = reader.readString();
                    this.hashValue = reader.readBlobHex();
                };
                AssemblyRef.prototype.toString = function () {
                    return this.definition + " #" + this.hashValue;
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
                AssemblyRefOS.prototype.internalReadRow = function (reader) {
                    if(!this.definition) {
                        this.definition = new managed.AssemblyDefinition();
                    }
                    this.definition.version = reader.readShort() + "." + reader.readShort() + "." + reader.readShort() + "." + reader.readShort();
                    this.definition.flags = reader.readInt();
                    this.definition.publicKey = reader.readBlobHex();
                    this.definition.name = reader.readString();
                    this.definition.culture = reader.readString();
                    this.hashValue = reader.readBlobHex();
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
                AssemblyRefProcessor.prototype.internalReadRow = function (reader) {
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
                ClassLayout.prototype.internalReadRow = function (reader) {
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
                function Constant() {
                    this.isSingleton = true;
                }
                Constant.prototype.internalReadRow = function (reader) {
                    var type = reader.readByte();
                    var padding = reader.readByte();
                    var parent = reader.readHasConstant();
                    var constValue = new managed.ConstantValue(type, reader.readConstantValue(type));
                    parent.value = constValue;
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
                CustomAttribute.prototype.internalReadRow = function (reader) {
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
                DeclSecurity.prototype.internalReadRow = function (reader) {
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
                Event.prototype.internalReadRow = function (reader) {
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
                EventMap.prototype.internalReadRow = function (reader) {
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
                ExportedType.prototype.internalReadRow = function (reader) {
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
            var FieldLayout = (function () {
                function FieldLayout() { }
                FieldLayout.prototype.internalReadRow = function (reader) {
                    this.offset = reader.readInt();
                    this.field = reader.readTableRowIndex(metadata.TableKind.FieldDefinition);
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
                FieldMarshal.prototype.internalReadRow = function (reader) {
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
                FieldRVA.prototype.internalReadRow = function (reader) {
                    this.rva = reader.readInt();
                    this.field = reader.readTableRowIndex(metadata.TableKind.FieldDefinition);
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
                File.prototype.internalReadRow = function (reader) {
                    this.flags = reader.readInt();
                    this.name = reader.readString();
                    this.hashValue = reader.readBlobHex();
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
                GenericParam.prototype.internalReadRow = function (reader) {
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
                GenericParamConstraint.prototype.internalReadRow = function (reader) {
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
                ImplMap.prototype.internalReadRow = function (reader) {
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
                InterfaceImpl.prototype.internalReadRow = function (reader) {
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
                ManifestResource.prototype.internalReadRow = function (reader) {
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
                MemberRef.prototype.internalReadRow = function (reader) {
                    this.classIndex = reader.readMemberRefParent();
                    this.name = reader.readString();
                    this.signatureBlob = reader.readMemberSignature();
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
            var MethodDef = (function () {
                function MethodDef() {
                    this.methodDefinition = new managed.MethodDefinition();
                    this.rva = 0;
                    this.paramList = 0;
                }
                MethodDef.prototype.internalReadRow = function (reader) {
                    if(!this.methodDefinition) {
                        this.methodDefinition = new managed.MethodDefinition();
                    }
                    this.rva = reader.readInt();
                    this.methodDefinition.implAttributes = reader.readShort();
                    this.methodDefinition.attributes = reader.readShort();
                    this.methodDefinition.name = reader.readString();
                    reader.readMethodSignature(this.methodDefinition.signature);
                    this.paramList = reader.readTableRowIndex(metadata.TableKind.ParameterDefinition);
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
                MethodImpl.prototype.internalReadRow = function (reader) {
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
                MethodSemantics.prototype.internalReadRow = function (reader) {
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
                function MethodSpec() {
                    this.instantiation = [];
                }
                MethodSpec.prototype.internalReadRow = function (reader) {
                    this.method = reader.readMethodDefOrRef();
                    reader.readMethodSpec(this.instantiation);
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
                Module.prototype.internalReadRow = function (reader) {
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
                ModuleRef.prototype.internalReadRow = function (reader) {
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
                NestedClass.prototype.internalReadRow = function (reader) {
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
            var PropertyMap = (function () {
                function PropertyMap() { }
                PropertyMap.prototype.internalReadRow = function (reader) {
                    this.parent = reader.readTableRowIndex(metadata.TableKind.TypeDef);
                    this.propertyList = reader.readTableRowIndex(metadata.TableKind.PropertyDefinition);
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
                StandAloneSig.prototype.internalReadRow = function (reader) {
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
                TypeDef.prototype.internalReadRow = function (reader) {
                    this.definition = new managed.TypeDefinition();
                    this.definition.attributes = reader.readInt();
                    this.definition.name = reader.readString();
                    this.definition.namespace = reader.readString();
                    this.definition.baseType = reader.readTypeDefOrRef();
                    this.fieldList = reader.readTableRowIndex(metadata.TableKind.FieldDefinition);
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
            var TypeSpec = (function () {
                function TypeSpec() { }
                TypeSpec.prototype.internalReadRow = function (reader) {
                    this.definition = reader.readBlob();
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
                    this.tables = null;
                    this.externalTypes = [];
                    this.module = null;
                    this.assembly = null;
                }
                TableStream.prototype.read = function (tableReader, streams) {
                    this.reserved0 = tableReader.readInt();
                    this.version = tableReader.readByte() + "." + tableReader.readByte();
                    this.heapSizes = tableReader.readByte();
                    this.reserved1 = tableReader.readByte();
                    var valid = tableReader.readLong();
                    var sorted = tableReader.readLong();
                    var tableCounts = this.readTableCounts(tableReader, valid);
                    this.initTables(tableReader, tableCounts);
                    this.readTables(tableReader, streams);
                };
                TableStream.prototype.readTableCounts = function (reader, valid) {
                    var result = [];
                    var bits = valid.lo;
                    for(var tableIndex = 0; tableIndex < 32; tableIndex++) {
                        if(bits & 1) {
                            var rowCount = reader.readInt();
                            result[tableIndex] = rowCount;
                        }
                        bits = bits >> 1;
                    }
                    bits = valid.hi;
                    for(var i = 0; i < 32; i++) {
                        var tableIndex = i + 32;
                        if(bits & 1) {
                            var rowCount = reader.readInt();
                            result[tableIndex] = rowCount;
                        }
                        bits = bits >> 1;
                    }
                    return result;
                };
                TableStream.prototype.initTables = function (reader, tableCounts) {
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
                        tableTypes[tkValue] = managed.metadata[tk] || pe.managed[tk];
                    }
                    for(var tableIndex = 0; tableIndex < tableCounts.length; tableIndex++) {
                        var rowCount = tableCounts[tableIndex];
                        if(!rowCount) {
                            continue;
                        }
                        this.initTable(tableIndex, rowCount, tableTypes[tableIndex]);
                    }
                };
                TableStream.prototype.initTable = function (tableIndex, rowCount, TableType) {
                    var tableRows = this.tables[tableIndex] = Array(rowCount);
                    if(tableIndex === metadata.TableKind.Module && tableRows.length > 0) {
                        if(!tableRows[0]) {
                            tableRows[0] = new metadata.Module();
                        }
                        tableRows[0].moduleDefinition = this.module;
                    }
                    if(tableIndex === metadata.TableKind.Assembly && tableRows.length > 0) {
                        if(!tableRows[0]) {
                            tableRows[0] = new metadata.Assembly();
                        }
                        tableRows[0].assemblyDefinition = this.assembly;
                    }
                    for(var i = 0; i < rowCount; i++) {
                        if(!tableRows[i]) {
                            tableRows[i] = new TableType();
                        }
                        if(i === 0 && tableRows[i].isSingleton) {
                            break;
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
                        var singletonRow = null;
                        for(var i = 0; i < tableRows.length; i++) {
                            if(singletonRow) {
                                singletonRow.internalReadRow(tableStreamReader);
                                continue;
                            }
                            tableRows[i].internalReadRow(tableStreamReader);
                            if(i === 0) {
                                if(tableRows[i].isSingleton) {
                                    singletonRow = tableRows[i];
                                }
                            }
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
                        assembly.headers = new pe.headers.PEFileHeaders();
                        assembly.headers.read(reader);
                    }
                    reader.sections = assembly.headers.sectionHeaders;
                    reader.setVirtualOffset(assembly.headers.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
                    var cdi = new metadata.ClrDirectory();
                    cdi.read2(reader);
                    var saveOffset = reader.offset;
                    reader.setVirtualOffset(cdi.metadataDir.address);
                    var cme = new metadata.ClrMetadata();
                    cme.read2(reader);
                    var mes = new metadata.MetadataStreams();
                    mes.read(cdi.metadataDir.address, cme.streamCount, reader);
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
                    reader.setVirtualOffset(mes.tables.address);
                    var tas = new metadata.TableStream();
                    tas.module = mainModule;
                    tas.assembly = assembly;
                    tas.read(reader, mes);
                    this.populateTypes(mainModule, tas.tables);
                    if(tas.tables[metadata.TableKind.ExternalType]) {
                        mainModule.debugExternalTypeReferences = tas.tables[metadata.TableKind.ExternalType];
                    }
                    this.populateMembers(tas.tables[metadata.TableKind.TypeDef], function (parent) {
                        return parent.fieldList;
                    }, function (parent) {
                        return parent.definition.fields;
                    }, tas.tables[metadata.TableKind.FieldDefinition], function (child) {
                        return child;
                    });
                    this.populateMembers(tas.tables[metadata.TableKind.TypeDef], function (parent) {
                        return parent.methodList;
                    }, function (parent) {
                        return parent.definition.methods;
                    }, tas.tables[metadata.TableKind.MethodDef], function (child) {
                        return child.methodDefinition;
                    });
                    this.populateMembers(tas.tables[metadata.TableKind.MethodDef], function (parent) {
                        return parent.paramList;
                    }, function (parent) {
                        return parent.methodDefinition.parameters;
                    }, tas.tables[metadata.TableKind.ParameterDefinition], function (child) {
                        return child;
                    });
                    reader.offset = saveOffset;
                };
                AssemblyReader.prototype.populateTypes = function (mainModule, tables) {
                    if(!mainModule.types) {
                        mainModule.types = [];
                    }
                    var typeDefTable = tables[metadata.TableKind.TypeDef];
                    if(typeDefTable) {
                        mainModule.types.length = typeDefTable.length;
                        for(var i = 0; i < mainModule.types.length; i++) {
                            mainModule.types[i] = typeDefTable[i].definition;
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
                        var childCount = !childTable ? 0 : iParent + 1 < parentTable.length ? getChildIndex(parentTable[iParent + 1]) - 1 - childIndex : childTable.length - childIndex;
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
                return this.name + ", version=" + this.version + (this.publicKey ? ", publicKey=" + this.publicKey : "");
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
                this.debugExternalTypeReferences = [];
            }
            ModuleDefinition.prototype.toString = function () {
                return this.name + " " + this.imageFlags;
            };
            return ModuleDefinition;
        })();
        managed.ModuleDefinition = ModuleDefinition;        
        var TypeReference = (function () {
            function TypeReference() { }
            TypeReference.prototype.getName = function () {
                throw new Error("Not implemented.");
            };
            TypeReference.prototype.getNamespace = function () {
                throw new Error("Not implemented.");
            };
            TypeReference.prototype.toString = function () {
                var ns = this.getNamespace();
                var nm = this.getName();
                if(ns && ns.length) {
                    return ns + "." + nm;
                } else {
                    return nm;
                }
            };
            return TypeReference;
        })();
        managed.TypeReference = TypeReference;        
        var MVar = (function (_super) {
            __extends(MVar, _super);
            function MVar(index) {
                        _super.call(this);
                this.index = index;
            }
            MVar.prototype.getName = function () {
                return "M" + this.index;
            };
            MVar.prototype.getNamespace = function () {
                return null;
            };
            return MVar;
        })(TypeReference);
        managed.MVar = MVar;        
        var Var = (function (_super) {
            __extends(Var, _super);
            function Var(index) {
                        _super.call(this);
                this.index = index;
            }
            Var.prototype.getName = function () {
                return "T" + this.index;
            };
            Var.prototype.getNamespace = function () {
                return null;
            };
            return Var;
        })(TypeReference);
        managed.Var = Var;        
        var TypeDefinition = (function (_super) {
            __extends(TypeDefinition, _super);
            function TypeDefinition() {
                        _super.call(this);
                this.attributes = 0;
                this.name = "";
                this.namespace = "";
                this.fields = [];
                this.methods = [];
                this.baseType = null;
            }
            TypeDefinition.prototype.getName = function () {
                return this.name;
            };
            TypeDefinition.prototype.getNamespace = function () {
                return this.namespace;
            };
            return TypeDefinition;
        })(TypeReference);
        managed.TypeDefinition = TypeDefinition;        
        var FieldDefinition = (function () {
            function FieldDefinition() {
                this.attributes = 0;
                this.name = "";
                this.customModifiers = null;
                this.customAttributes = null;
                this.type = null;
            }
            FieldDefinition.prototype.toString = function () {
                return this.name + (this.value ? " = " + this.value : "");
            };
            FieldDefinition.prototype.internalReadRow = function (reader) {
                this.attributes = reader.readShort();
                this.name = reader.readString();
                reader.readFieldSignature(this);
            };
            return FieldDefinition;
        })();
        managed.FieldDefinition = FieldDefinition;        
        var FieldSignature = (function () {
            function FieldSignature() { }
            return FieldSignature;
        })();
        managed.FieldSignature = FieldSignature;        
        var MethodDefinition = (function () {
            function MethodDefinition() {
                this.attributes = 0;
                this.implAttributes = 0;
                this.name = "";
                this.parameters = [];
                this.signature = new MethodSignature();
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
                        if(this.signature && this.signature.parameters && i < this.signature.parameters.length) {
                            result += ": " + this.signature.parameters[i].type;
                        }
                    }
                }
                result += ")";
                return result;
            };
            return MethodDefinition;
        })();
        managed.MethodDefinition = MethodDefinition;        
        var CustomModifier = (function () {
            function CustomModifier(required, type) {
                this.required = required;
                this.type = type;
            }
            CustomModifier.prototype.toString = function () {
                return (this.required ? "<req> " : "") + this.type;
            };
            return CustomModifier;
        })();
        managed.CustomModifier = CustomModifier;        
        var ParameterDefinition = (function () {
            function ParameterDefinition() {
                this.attributes = 0;
                this.name = "";
                this.index = 0;
            }
            ParameterDefinition.prototype.internalReadRow = function (reader) {
                this.attributes = reader.readShort();
                this.index = reader.readShort();
                this.name = reader.readString();
            };
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
                this.isStatic = false;
            }
            PropertyDefinition.prototype.internalReadRow = function (reader) {
                this.attributes = reader.readShort();
                this.name = reader.readString();
                reader.readPropertySignature(this);
            };
            PropertyDefinition.prototype.toString = function () {
                return this.name + (this.parameters ? "[" + this.parameters.length + "]" : "") + ":" + this.type;
            };
            return PropertyDefinition;
        })();
        managed.PropertyDefinition = PropertyDefinition;        
        var LocalVariable = (function () {
            function LocalVariable() { }
            return LocalVariable;
        })();
        managed.LocalVariable = LocalVariable;        
        var ExternalType = (function (_super) {
            __extends(ExternalType, _super);
            function ExternalType(assemblyRef, name, namespace) {
                        _super.call(this);
                this.assemblyRef = assemblyRef;
                this.name = name;
                this.namespace = namespace;
            }
            ExternalType.prototype.getName = function () {
                return this.name;
            };
            ExternalType.prototype.getNamespace = function () {
                return this.namespace;
            };
            ExternalType.prototype.internalReadRow = function (reader) {
                this.assemblyRef = reader.readResolutionScope();
                this.name = reader.readString();
                this.namespace = reader.readString();
            };
            return ExternalType;
        })(TypeReference);
        managed.ExternalType = ExternalType;        
        var PointerType = (function (_super) {
            __extends(PointerType, _super);
            function PointerType(baseType) {
                        _super.call(this);
                this.baseType = baseType;
            }
            PointerType.prototype.getName = function () {
                return this.baseType.getName() + "*";
            };
            PointerType.prototype.getNamespace = function () {
                return this.baseType.getNamespace();
            };
            return PointerType;
        })(TypeReference);
        managed.PointerType = PointerType;        
        var ByRefType = (function (_super) {
            __extends(ByRefType, _super);
            function ByRefType(baseType) {
                        _super.call(this);
                this.baseType = baseType;
            }
            ByRefType.prototype.getName = function () {
                return this.baseType.getName() + "&";
            };
            ByRefType.prototype.getNamespace = function () {
                return this.baseType.getNamespace();
            };
            return ByRefType;
        })(TypeReference);
        managed.ByRefType = ByRefType;        
        var SZArrayType = (function (_super) {
            __extends(SZArrayType, _super);
            function SZArrayType(baseType) {
                        _super.call(this);
                this.baseType = baseType;
            }
            SZArrayType.prototype.getName = function () {
                return this.baseType.getName() + "[]";
            };
            SZArrayType.prototype.getNamespace = function () {
                return this.baseType.getNamespace();
            };
            SZArrayType.prototype.toString = function () {
                return this.getNamespace() + "." + this.getName();
            };
            return SZArrayType;
        })(TypeReference);
        managed.SZArrayType = SZArrayType;        
        var SentinelType = (function (_super) {
            __extends(SentinelType, _super);
            function SentinelType(baseType) {
                        _super.call(this);
                this.baseType = baseType;
            }
            SentinelType.prototype.getName = function () {
                return this.baseType.getName() + "!sentinel";
            };
            SentinelType.prototype.getNamespace = function () {
                return this.baseType.getNamespace();
            };
            SentinelType.prototype.toString = function () {
                return this.getNamespace() + "." + this.getName();
            };
            return SentinelType;
        })(TypeReference);
        managed.SentinelType = SentinelType;        
        var KnownType = (function (_super) {
            __extends(KnownType, _super);
            function KnownType(name) {
                        _super.call(this);
                this.name = name;
            }
            KnownType.prototype.getName = function () {
                return this.name;
            };
            KnownType.prototype.getNamespace = function () {
                return "System";
            };
            KnownType.Void = new KnownType("Void");
            KnownType.Boolean = new KnownType("Boolean");
            KnownType.Char = new KnownType("Char");
            KnownType.SByte = new KnownType("SByte");
            KnownType.Byte = new KnownType("Byte");
            KnownType.Int16 = new KnownType("Int16");
            KnownType.UInt16 = new KnownType("UInt16");
            KnownType.Int32 = new KnownType("Int32");
            KnownType.UInt32 = new KnownType("UInt32");
            KnownType.Int64 = new KnownType("Int64");
            KnownType.UInt64 = new KnownType("UInt64");
            KnownType.Single = new KnownType("Single");
            KnownType.Double = new KnownType("Double");
            KnownType.String = new KnownType("String");
            KnownType.TypedReference = new KnownType("TypedReference");
            KnownType.IntPtr = new KnownType("IntPtr");
            KnownType.UIntPtr = new KnownType("UIntPtr");
            KnownType.Object = new KnownType("Object");
            KnownType.prototype.toString = function () {
                return this.getNamespace() + "." + this.getName();
            };
            return KnownType;
        })(TypeReference);
        managed.KnownType = KnownType;        
        var GenericInstantiation = (function (_super) {
            __extends(GenericInstantiation, _super);
            function GenericInstantiation() {
                _super.apply(this, arguments);

                this.genericType = null;
                this.arguments = null;
            }
            GenericInstantiation.prototype.getName = function () {
                return this.genericType.getName();
            };
            GenericInstantiation.prototype.getNamespace = function () {
                return this.genericType.getNamespace();
            };
            GenericInstantiation.prototype.toString = function () {
                return this.getNamespace() + "." + this.getName();
            };
            return GenericInstantiation;
        })(TypeReference);
        managed.GenericInstantiation = GenericInstantiation;        
        var FunctionPointerType = (function (_super) {
            __extends(FunctionPointerType, _super);
            function FunctionPointerType() {
                _super.apply(this, arguments);

                this.methodSignature = null;
            }
            FunctionPointerType.prototype.getName = function () {
                return this.methodSignature.toString();
            };
            FunctionPointerType.prototype.getNamespace = function () {
                return "<function*>";
            };
            FunctionPointerType.prototype.toString = function () {
                return this.getNamespace() + "." + this.getName();
            };
            return FunctionPointerType;
        })(TypeReference);
        managed.FunctionPointerType = FunctionPointerType;        
        var ArrayType = (function (_super) {
            __extends(ArrayType, _super);
            function ArrayType(elementType, dimensions) {
                        _super.call(this);
                this.elementType = elementType;
                this.dimensions = dimensions;
            }
            ArrayType.prototype.getName = function () {
                return this.elementType.getName() + "[" + this.dimensions.join(", ") + "]";
            };
            ArrayType.prototype.getNamespace = function () {
                return this.elementType.getNamespace();
            };
            ArrayType.prototype.toString = function () {
                return this.getNamespace() + "." + this.getName();
            };
            return ArrayType;
        })(TypeReference);
        managed.ArrayType = ArrayType;        
        var ArrayDimensionRange = (function () {
            function ArrayDimensionRange() {
                this.lowBound = 0;
                this.length = 0;
            }
            ArrayDimensionRange.prototype.toString = function () {
                return this.lowBound + ".." + (this.lowBound + this.length - 1) + "]";
            };
            return ArrayDimensionRange;
        })();
        managed.ArrayDimensionRange = ArrayDimensionRange;        
        var MethodSignature = (function () {
            function MethodSignature() {
                this.callingConvention = 0;
                this.parameters = [];
                this.extraParameters = null;
                this.returnType = null;
            }
            MethodSignature.prototype.toString = function () {
                var result = "(" + this.parameters.join(", ");
                if(this.extraParameters && this.extraParameters.length) {
                    if(result.length > 1) {
                        result += ", " + this.extraParameters.join(", ");
                    }
                }
                result += ")";
                result += " => " + this.returnType;
                return result;
            };
            return MethodSignature;
        })();
        managed.MethodSignature = MethodSignature;        
        var ParameterSignature = (function () {
            function ParameterSignature(customModifiers, type) {
                this.customModifiers = customModifiers;
                this.type = type;
            }
            ParameterSignature.prototype.toString = function () {
                return "_: " + this.type;
            };
            return ParameterSignature;
        })();
        managed.ParameterSignature = ParameterSignature;        
        var ConstantValue = (function () {
            function ConstantValue(type, value) {
                this.type = type;
                this.value = value;
            }
            ConstantValue.prototype.valueOf = function () {
                return this.value;
            };
            return ConstantValue;
        })();
        managed.ConstantValue = ConstantValue;        
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
//@ sourceMappingURL=pe.js.map
