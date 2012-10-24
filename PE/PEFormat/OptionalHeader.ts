// <reference path="../Version.ts" />
// <reference path="../Internal/FormatEnum.ts" />
// <reference path="PEMagic.ts" />
// <reference path="DllCharacteristics.ts" />
// <reference path="Subsystem.ts" />

module Mi.PE.PEFormat {
    export class OptionalHeader {
        peMagic: PEMagic;

        linkerVersion: Version;

        // The size of the code section, in bytes, or the sum of all such sections if there are multiple code sections.
        sizeOfCode: number;

        // The size of the initialized data section, in bytes, or the sum of all such sections if there are multiple initialized data sections.
        sizeOfInitializedData: number;

        // The size of the uninitialized data section, in bytes, or the sum of all such sections if there are multiple uninitialized data sections.
        sizeOfUninitializedData: number;

        // A pointer to the entry point function, relative to the image base address.
        // For executable files, this is the starting address.
        // For device drivers, this is the address of the initialization function.
        // The entry point function is optional for DLLs.
        // When no entry point is present, this member is zero.
        addressOfEntryPoint: number;

        // A pointer to the beginning of the code section, relative to the image base.
        baseOfCode: number;

        // A pointer to the beginning of the data section, relative to the image base.
        baseOfData: number;

        // Uint or 64-bit long.
        // The preferred address of the first byte of the image when it is loaded in memory.
        // This value is a multiple of 64K bytes.
        // The default value for DLLs is 0x10000000.
        // The default value for applications is 0x00400000,
        // except on Windows CE where it is 0x00010000.
        imageBase: number;

        // The alignment of sections loaded in memory, in bytes.
        // This value must be greater than or equal to the FileAlignment member.
        // The default value is the page size for the system.
        sectionAlignment: number;

        // The alignment of the raw data of sections in the image file, in bytes.
        // The value should be a power of 2 between 512 and 64K (inclusive).
        // The default is 512.
        // If the <see cref="SectionAlignment"/> member is less than the system page size,
        // this member must be the same as <see cref="SectionAlignment"/>.
        fileAlignment: number;

        // The version of the required operating system.
        operatingSystemVersion: Version;
        
        // The version of the image.
        imageVersion: Version;

        // The version of the subsystem.
        subsystemVersion;
        
        // This member is reserved and must be 0.
        win32VersionValue: number;

        // The size of the image, in bytes, including all headers. Must be a multiple of <see cref="SectionAlignment"/>.
        sizeOfImage: number;

        // The combined size of the MS-DOS stub, the PE header, and the section headers,
        // rounded to a multiple of the value specified in the FileAlignment member.
        sizeOfHeaders: number;

        // The image file checksum.
        // The following files are validated at load time:
        // all drivers,
        // any DLL loaded at boot time,
        // and any DLL loaded into a critical system process.
        checkSum: number;

        // The subsystem required to run this image.
        subsystem: Subsystem;

        // The DLL characteristics of the image.
        dllCharacteristics: DllCharacteristics;

        // Uint or 64 bit long.
        // The number of bytes to reserve for the stack.
        // Only the memory specified by the <see cref="SizeOfStackCommit"/> member is committed at load time;
        // the rest is made available one page at a time until this reserve size is reached.
        sizeOfStackReserve: number;

        // Uint or 64 bit long.
        // The number of bytes to commit for the stack.
        sizeOfStackCommit: number;

        // Uint or 64 bit long.
        // The number of bytes to reserve for the local heap.
        // Only the memory specified by the <see cref="SizeOfHeapCommit"/> member is committed at load time;
        // the rest is made available one page at a time until this reserve size is reached.
        sizeOfHeapReserve: number;

        // Uint or 64 bit long.
        // The number of bytes to commit for the local heap.
        sizeOfHeapCommit: number;

        // This member is obsolete.
        loaderFlags: number;

        // The number of directory entries in the remainder of the optional header.
        // Each entry describes a location and size.
        numberOfRvaAndSizes: number;

        dataDirectories: DataDirectory[];

        toString()
        {
            var result = [];

            var peMagicText = Mi.PE.Internal.formatEnum(this.peMagic, PEMagic);
            if (peMagicText)
                result.push(peMagicText);

            var subsystemText = Mi.PE.Internal.formatEnum(this.subsystem, Subsystem);
            if (subsystemText)
                result.push(subsystemText);

            var dllCharacteristicsText = Mi.PE.Internal.formatEnum(this.dllCharacteristics, DllCharacteristics);
            if (dllCharacteristicsText)
                result.push(dllCharacteristicsText);

            var nonzeroDataDirectoriesText = []; 
            if (this.dataDirectories) {
                for (var i = 0; i < this.dataDirectories.length; i++) {
                    if (this.dataDirectories[i].size <= 0)
                        continue;

                    var kind = Mi.PE.Internal.formatEnum(i, DataDirectoryKind);
                    nonzeroDataDirectoriesText.push(kind);
                }
            }

            result.push(
                "dataDirectories[" +
                nonzeroDataDirectoriesText.join(",") + "]");

            var resultText = result.join(" ");

            return resultText;
        }
    }
}