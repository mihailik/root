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
var DosHeader = (function () {
    function DosHeader() { }
    DosHeader.prototype.toString = function () {
        var result = "[" + (this.mz == MZSignature.MZ ? "MZ" : typeof this.mz == "number" ? (this.mz).toString(16) + "h" : typeof this.mz) + "]" + ".lfanew=" + (typeof this.lfanew == "number" ? this.lfanew.toString(16) + "h" : typeof this.lfanew);
        return result;
    };
    return DosHeader;
})();
var MZSignature;
(function (MZSignature) {
    MZSignature._map = [];
    MZSignature.MZ = "M".charCodeAt(0) + ("Z".charCodeAt(0) << 8);
})(MZSignature || (MZSignature = {}));
var PEHeader = (function () {
    function PEHeader() { }
    PEHeader.prototype.toString = function () {
        var result = this.machine + " " + this.characteristics + " " + "Sections[" + this.numberOfSections + "]";
        return result;
    };
    return PEHeader;
})();
var PESignature;
(function (PESignature) {
    PESignature._map = [];
    PESignature.PE = "P".charCodeAt(0) + ("E".charCodeAt(0) << 8);
})(PESignature || (PESignature = {}));
var Machine;
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
})(Machine || (Machine = {}));
var ImageCharacteristics;
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
})(ImageCharacteristics || (ImageCharacteristics = {}));
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
    return OptionalHeader;
})();
var PEMagic;
(function (PEMagic) {
    PEMagic._map = [];
    PEMagic.NT32 = 267;
    PEMagic.NT64 = 523;
    PEMagic.ROM = 263;
})(PEMagic || (PEMagic = {}));
var Subsystem;
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
})(Subsystem || (Subsystem = {}));
var DllCharacteristics;
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
})(DllCharacteristics || (DllCharacteristics = {}));
var DataDirectoryKind;
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
})(DataDirectoryKind || (DataDirectoryKind = {}));
var PEFile = (function () {
    function PEFile() { }
    return PEFile;
})();
