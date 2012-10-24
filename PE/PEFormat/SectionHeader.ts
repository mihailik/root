module Mi.PE.PEFormat {
    export class SectionHeader {
        
        // An 8-byte, null-padded UTF-8 string.
        // There is no terminating null character if the string is exactly eight characters long.
        // For longer names, this member contains a forward slash (/)
        // followed by an ASCII representation of a decimal number that is an offset into the string table.
        // Executable images do not use a string table
        // and do not support section names longer than eight characters.
        name: string;
        
        // Virtual address (relative to the image base) and total size of the section when loaded into memory, in bytes.
        // For object files, the virtual address is the address of the first byte before relocation is applied.
        // If size value is greater than the sizeOfRawData member, the section is filled with zeroes.
        // This field is valid only for executable images and should be set to 0 for object files.
        // This address field overlaps with physicalAddress.
        virtualRange: DataDirectory;
        
        // The file address.
        // This field overlaps with virtualSize.
        get physicalAddress() { return this.virtualRange ? this.virtualRange.address : <number><any>this.virtualRange; }
        set physicalAddress(value: number) {
            if (this.virtualRange)
                this.virtualRange.size = value;
            else
                this.virtualRange = new DataDirectory(0, value);
        }

        // The file pointer and size of the initialized data on disk, in bytes.
        // Both address and size must be multiples of the OptionalHeader.fileAlignment member of the OptionalHeader structure.
        // If size value is less than the virtualSize member, the remainder of the section is filled with zeroes.
        // If the section contains only uninitialized data, both size and address should be set to zero.
        rawData: DataDirectory;

        // A file pointer to the beginning of the relocation entries for the section.
        // If there are no relocations, this value is zero.
        pointerToRelocations: number;

        // A file pointer to the beginning of the line-number entries for the section.
        // If there are no COFF line numbers, this value is zero.
        pointerToLinenumbers;
        
        // Ushort.
        // The number of relocation entries for the section.
        // This value is zero for executable images.
        numberOfRelocations: number;

        // Ushort.
        // The number of line-number entries for the section.
        numberOfLinenumbers: number;

        // The characteristics of the image.
        characteristics: SectionCharacteristics;

        toString()
        {
            var result = this.name + " [" + this.rawData + "]=>[" + this.virtualRange + "]";
            return result;
        }
    }
}