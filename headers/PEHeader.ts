/// <reference path="../io/io.ts" />

module pe.headers {

    export class PEHeader {
        pe: PESignature = PESignature.PE;

        // The architecture type of the computer.
        // An image file can only be run on the specified computer or a system that emulates the specified computer.
        machine: Machine = Machine.I386;

        //  UShort. Indicates the size of the section table, which immediately follows the headers.
        //  Note that the Windows loader limits the number of sections to 96.
        numberOfSections: number = 0;

        // The low 32 bits of the time stamp of the image.
        // This represents the date and time the image was created by the linker.
        // The value is represented in the number of seconds elapsed since
        // midnight (00:00:00), January 1, 1970, Universal Coordinated Time,
        // according to the system clock.
        timestamp: Date = new Date(0);

        // UInt. The offset of the symbol table, in bytes, or zero if no COFF symbol table exists.
        pointerToSymbolTable: number = 0;

        // UInt. The number of symbols in the symbol table.
        numberOfSymbols: number = 0;

        // UShort. The size of the optional header, in bytes. This value should be 0 for object files.
        sizeOfOptionalHeader: number = 0;

        // The characteristics of the image.
        characteristics: ImageCharacteristics = ImageCharacteristics.Dll | ImageCharacteristics.Bit32Machine;

        toString() {
            var result =
                io.formatEnum(this.machine, Machine) + " " +
                io.formatEnum(this.characteristics, ImageCharacteristics) + " " +
                "Sections[" + this.numberOfSections + "]";
            return result;
        }

        read(reader: io.BinaryReader) {
            this.pe = reader.readInt();
            if (this.pe != <number>PESignature.PE)
                throw new Error("PE signature is invalid: " + (<number>(this.pe)).toString(16).toUpperCase() + "h.");

            this.machine = reader.readShort();
            this.numberOfSections = reader.readShort();

            if (!this.timestamp)
                this.timestamp = new Date(0);
            reader.readTimestamp(this.timestamp);

            this.pointerToSymbolTable = reader.readInt();
            this.numberOfSymbols = reader.readInt();
            this.sizeOfOptionalHeader = reader.readShort();
            this.characteristics = reader.readShort();
        }
    }

    export enum PESignature {
        PE =
            "P".charCodeAt(0) +
            ("E".charCodeAt(0) << 8)
    }

    export enum Machine {
        // The target CPU is unknown or not specified.
        Unknown = 0x0000,

        // Intel 386.
        I386 = 0x014C,

        // MIPS little-endian
        R3000 = 0x0162,

        // MIPS little-endian
        R4000 = 0x0166,

        // MIPS little-endian
        R10000 = 0x0168,

        // MIPS little-endian WCE v2
        WCEMIPSV2 = 0x0169,

        // Alpha_AXP
        Alpha = 0x0184,

        // SH3 little-endian
        SH3 = 0x01a2,

        // SH3 little-endian. DSP.
        SH3DSP = 0x01a3,

        // SH3E little-endian.
        SH3E = 0x01a4,

        // SH4 little-endian.
        SH4 = 0x01a6,

        // SH5.
        SH5 = 0x01a8,

        // ARM Little-Endian
        ARM = 0x01c0,

        // Thumb.
        Thumb = 0x01c2,

        // AM33
        AM33 = 0x01d3,

        // IBM PowerPC Little-Endian
        PowerPC = 0x01F0,

        // PowerPCFP
        PowerPCFP = 0x01f1,

        // Intel 64
        IA64 = 0x0200,

        // MIPS
        MIPS16 = 0x0266,

        // ALPHA64
        Alpha64 = 0x0284,

        // MIPS
        MIPSFPU = 0x0366,

        // MIPS
        MIPSFPU16 = 0x0466,

        // AXP64
        AXP64 = Alpha64,

        // Infineon
        Tricore = 0x0520,

        // CEF
        CEF = 0x0CEF,

        // EFI Byte Code
        EBC = 0x0EBC,

        // AMD64 (K8)
        AMD64 = 0x8664,

        // M32R little-endian
        M32R = 0x9041,

        // CEE
        CEE = 0xC0EE,
    }

    export enum ImageCharacteristics {
        // Relocation information was stripped from the file.
        // The file must be loaded at its preferred base address.
        // If the base address is not available, the loader reports an error.
        RelocsStripped = 0x0001,

        // The file is executable (there are no unresolved external references).
        ExecutableImage = 0x0002,

        // COFF line numbers were stripped from the file.
        LineNumsStripped = 0x0004,

        // COFF symbol table entries were stripped from file.
        LocalSymsStripped = 0x0008,

        // Aggressively trim the working set.
        // This value is obsolete as of Windows 2000.
        AggressiveWsTrim = 0x0010,

        // The application can handle addresses larger than 2 GB.
        LargeAddressAware = 0x0020,

        // The bytes of the word are reversed. This flag is obsolete.
        BytesReversedLo = 0x0080,

        // The computer supports 32-bit words.
        Bit32Machine = 0x0100,

        // Debugging information was removed and stored separately in another file.
        DebugStripped = 0x0200,

        // If the image is on removable media, copy it to and run it from the swap file.
        RemovableRunFromSwap = 0x0400,

        // If the image is on the network, copy it to and run it from the swap file.
        NetRunFromSwap = 0x0800,

        // The image is a system file.
        System = 0x1000,

        // The image is a DLL file.
        // While it is an executable file, it cannot be run directly.
        Dll = 0x2000,

        // The file should be run only on a uniprocessor computer.
        UpSystemOnly = 0x4000,

        // The bytes of the word are reversed. This flag is obsolete.
        BytesReversedHi = 0x8000
    }
}