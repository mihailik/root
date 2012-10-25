// <reference path="../Internal/FormatEnum.ts" />

// <reference path="PESignature.ts" />
// <reference path="Machine.ts" />
// <reference path="ImageCharacteristics.ts" />

module Mi.PE.PEFormat {
    export class PEHeader {
        pe: PESignature;

        // The architecture type of the computer.
        // An image file can only be run on the specified computer or a system that emulates the specified computer.
        machine: Machine;

        //  UShort. Indicates the size of the section table, which immediately follows the headers.
        //  Note that the Windows loader limits the number of sections to 96.
        numberOfSections: number;

        // The low 32 bits of the time stamp of the image.
        // This represents the date and time the image was created by the linker.
        // The value is represented in the number of seconds elapsed since
        // midnight (00:00:00), January 1, 1970, Universal Coordinated Time,
        // according to the system clock.
        timestamp: Date;

        // UInt. The offset of the symbol table, in bytes, or zero if no COFF symbol table exists.
        pointerToSymbolTable: number;

        // UInt. The number of symbols in the symbol table.
        numberOfSymbols: number;
        
        // UShort. The size of the optional header, in bytes. This value should be 0 for object files.
        sizeOfOptionalHeader: number;

        // The characteristics of the image.
        characteristics: ImageCharacteristics;

        toString()
        {
            var result = 
                Mi.PE.Internal.formatEnum(this.machine, Machine) + " " +
                Mi.PE.Internal.formatEnum(this.characteristics, ImageCharacteristics)+ " "+
                "Sections["+this.numberOfSections+"]";
            return result;
        }
    }
}