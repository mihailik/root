// <reference path="DataDirectory.ts" />

class SectionHeader {

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
    // get physicalAddress() { return this.virtualRange ? this.virtualRange.address : <number><any>this.virtualRange; }

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

    toString() {
        var result = this.name + " [" + this.rawData + "]=>[" + this.virtualRange + "]";
        return result;
    }
}

enum SectionCharacteristics {
    Reserved_0h = 0x00000000,
    Reserved_1h = 0x00000001,
    Reserved_2h = 0x00000002,
    Reserved_4h = 0x00000004,

    // The section should not be padded to the next boundary.
    // This flag is obsolete and is replaced by Align1Bytes.
    NoPadding = 0x00000008,

    Reserved_10h = 0x00000010,

    // The section contains executable code.
    ContainsCode = 0x00000020,

    // The section contains initialized data.
    ContainsInitializedData = 0x00000040,

    // The section contains uninitialized data.
    ContainsUninitializedData = 0x00000080,

    // Reserved.
    LinkerOther = 0x00000100,

    // The section contains comments or other information.
    // This is valid only for object files.
    LinkerInfo = 0x00000200,

    Reserved_400h = 0x00000400,

    // The section will not become part of the image.
    // This is valid only for object files.
    LinkerRemove = 0x00000800,

    // The section contains COMDAT data.
    // This is valid only for object files.
    LinkerCOMDAT = 0x00001000,

    Reserved_2000h = 0x00002000,

    // Reset speculative exceptions handling bits in the TLB entries for this section.
    NoDeferredSpeculativeExecution = 0x00004000,

    // The section contains data referenced through the global pointer.
    GlobalPointerRelative = 0x00008000,

    Reserved_10000h = 0x00010000,

    // Reserved.
    MemoryPurgeable = 0x00020000,

    // Reserved.
    MemoryLocked = 0x00040000,

    // Reserved.
    MemoryPreload = 0x00080000,

    // Align data on a 1-byte boundary.
    // This is valid only for object files.
    Align1Bytes = 0x00100000,

    // Align data on a 2-byte boundary.
    // This is valid only for object files.
    Align2Bytes = 0x00200000,

    // Align data on a 4-byte boundary.
    // This is valid only for object files.
    Align4Bytes = 0x00300000,

    // Align data on a 8-byte boundary.
    // This is valid only for object files.
    Align8Bytes = 0x00400000,

    // Align data on a 16-byte boundary.
    // This is valid only for object files.
    Align16Bytes = 0x00500000,

    // Align data on a 32-byte boundary.
    // This is valid only for object files.
    Align32Bytes = 0x00600000,

    // Align data on a 64-byte boundary.
    // This is valid only for object files.
    Align64Bytes = 0x00700000,

    // Align data on a 128-byte boundary.
    // This is valid only for object files.
    Align128Bytes = 0x00800000,

    // Align data on a 256-byte boundary.
    // This is valid only for object files.
    Align256Bytes = 0x00900000,

    // Align data on a 512-byte boundary.
    // This is valid only for object files.
    Align512Bytes = 0x00A00000,

    // Align data on a 1024-byte boundary.
    // This is valid only for object files.
    Align1024Bytes = 0x00B00000,

    // Align data on a 2048-byte boundary.
    // This is valid only for object files.
    Align2048Bytes = 0x00C00000,

    // Align data on a 4096-byte boundary.
    // This is valid only for object files.
    Align4096Bytes = 0x00D00000,

    // Align data on a 8192-byte boundary.
    // This is valid only for object files.
    Align8192Bytes = 0x00E00000,

    // The section contains extended relocations.
    // The count of relocations for the section exceeds the 16 bits that is reserved for it in the section header.
    // If the NumberOfRelocations field in the section header is 0xffff,
    // the actual relocation count is stored in the VirtualAddress field of the first relocation.
    // It is an error if LinkerRelocationOverflow is set and there are fewer than 0xffff relocations in the section.
    LinkerRelocationOverflow = 0x01000000,

    // The section can be discarded as needed.
    MemoryDiscardable = 0x02000000,

    // The section cannot be cached.
    MemoryNotCached = 0x04000000,

    // The section cannot be paged.
    MemoryNotPaged = 0x08000000,

    // The section can be shared in memory.
    MemoryShared = 0x10000000,

    // The section can be executed as code.
    MemoryExecute = 0x20000000,

    // The section can be read.
    MemoryRead = 0x40000000,

    // The section can be written to.
    MemoryWrite = 0x80000000
}