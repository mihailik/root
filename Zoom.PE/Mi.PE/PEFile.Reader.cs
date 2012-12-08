using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;

namespace Mi.PE
{
    using Mi.PE.Internal;
    using Mi.PE.PEFormat;

    partial class PEFile
    {
        internal static readonly DateTime TimestampEpochUTC = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        public void ReadFrom(BinaryStreamReader reader)
        {
            ReadDosHeader(reader);

            reader.Position = this.DosHeader.lfanew;
            ReadPEHeader(reader);
            ReadOptionalHeader(reader);

            this.SectionHeaders = new SectionHeader[this.PEHeader.NumberOfSections];

            for (int i = 0; i < this.SectionHeaders.Length; i++)
            {
                var sectionHeader = new SectionHeader();
                ReadSectionHeader(reader, sectionHeader);
                this.SectionHeaders[i] = sectionHeader;
            }
        }

        void ReadDosHeader(BinaryStreamReader reader)
        {
            if (this.DosHeader == null)
                this.DosHeader = new DosHeader();

            var signature = (MZSignature)reader.ReadInt16();
            if (signature != MZSignature.MZ)
                throw new BadImageFormatException("MZ signature expected, " + ((ushort)signature).ToString("X4") + "h found.");

            this.DosHeader.cblp = reader.ReadUInt16();
            this.DosHeader.cp = reader.ReadUInt16();
            this.DosHeader.crlc = reader.ReadUInt16();
            this.DosHeader.cparhdr = reader.ReadUInt16();
            this.DosHeader.minalloc = reader.ReadUInt16();
            this.DosHeader.maxalloc = reader.ReadUInt16();
            this.DosHeader.ss = reader.ReadUInt16();
            this.DosHeader.sp = reader.ReadUInt16();
            this.DosHeader.csum = reader.ReadUInt16();
            this.DosHeader.ip = reader.ReadUInt16();
            this.DosHeader.cs = reader.ReadUInt16();
            this.DosHeader.lfarlc = reader.ReadUInt16();
            this.DosHeader.ovno = reader.ReadUInt16();

            this.DosHeader.res1 = reader.ReadUInt64();

            this.DosHeader.oemid = reader.ReadUInt16();
            this.DosHeader.oeminfo = reader.ReadUInt16();

            this.DosHeader.ReservedNumber0 = reader.ReadUInt32();
            this.DosHeader.ReservedNumber1 = reader.ReadUInt32();
            this.DosHeader.ReservedNumber2 = reader.ReadUInt32();
            this.DosHeader.ReservedNumber3 = reader.ReadUInt32();
            this.DosHeader.ReservedNumber4 = reader.ReadUInt32();
            this.DosHeader.lfanew = reader.ReadUInt32();

            if (this.DosHeader.lfanew > DosHeader.Size)
            {
                this.DosStub = new byte[this.DosHeader.lfanew - DosHeader.Size];
                reader.ReadBytes(this.DosStub, 0, this.DosStub.Length);
            }
        }

        void ReadPEHeader(BinaryStreamReader reader)
        {
            if (this.PEHeader == null)
                this.PEHeader = new PEHeader();

            var peSignature = (PESignature)reader.ReadUInt32();
            if (peSignature != PESignature.PE00)
                throw new BadImageFormatException("PE00 signature expected, " + ((ushort)peSignature).ToString("X8") + "h found.");

            this.PEHeader.Machine = (Machine)reader.ReadInt16();
            this.PEHeader.NumberOfSections = reader.ReadUInt16();
            uint timestampNum = reader.ReadUInt32();
            this.PEHeader.Timestamp = TimestampEpochUTC.AddSeconds(timestampNum);
            this.PEHeader.PointerToSymbolTable = reader.ReadUInt32();
            this.PEHeader.NumberOfSymbols = reader.ReadUInt32();
            this.PEHeader.SizeOfOptionalHeader = reader.ReadUInt16();
            this.PEHeader.Characteristics = (ImageCharacteristics)reader.ReadInt16();
        }

        void ReadOptionalHeader(BinaryStreamReader reader)
        {
            if (this.OptionalHeader == null)
                this.OptionalHeader = new OptionalHeader();

            var peMagic = (PEMagic)reader.ReadInt16();

            if (peMagic != PEMagic.NT32
                && peMagic != PEMagic.NT64)
                throw new BadImageFormatException("Unsupported PE magic value " + peMagic + ".");

            this.OptionalHeader.PEMagic = peMagic;

            this.OptionalHeader.MajorLinkerVersion = reader.ReadByte();
            this.OptionalHeader.MinorLinkerVersion = reader.ReadByte();
            this.OptionalHeader.SizeOfCode = reader.ReadUInt32();
            this.OptionalHeader.SizeOfInitializedData = reader.ReadUInt32();
            this.OptionalHeader.SizeOfUninitializedData = reader.ReadUInt32();
            this.OptionalHeader.AddressOfEntryPoint = reader.ReadUInt32();
            this.OptionalHeader.BaseOfCode = reader.ReadUInt32();

            if (peMagic == PEMagic.NT32)
            {
                this.OptionalHeader.BaseOfData = reader.ReadUInt32();
                this.OptionalHeader.ImageBase = reader.ReadUInt32();
            }
            else
            {
                this.OptionalHeader.ImageBase = reader.ReadUInt64();
            }

            this.OptionalHeader.SectionAlignment = reader.ReadUInt32();
            this.OptionalHeader.FileAlignment = reader.ReadUInt32();
            this.OptionalHeader.MajorOperatingSystemVersion = reader.ReadUInt16();
            this.OptionalHeader.MinorOperatingSystemVersion = reader.ReadUInt16();
            this.OptionalHeader.MajorImageVersion = reader.ReadUInt16();
            this.OptionalHeader.MinorImageVersion = reader.ReadUInt16();
            this.OptionalHeader.MajorSubsystemVersion = reader.ReadUInt16();
            this.OptionalHeader.MinorSubsystemVersion = reader.ReadUInt16();
            this.OptionalHeader.Win32VersionValue = reader.ReadUInt32();
            this.OptionalHeader.SizeOfImage = reader.ReadUInt32();
            this.OptionalHeader.SizeOfHeaders = reader.ReadUInt32();
            this.OptionalHeader.CheckSum = reader.ReadUInt32();
            this.OptionalHeader.Subsystem = (Subsystem)reader.ReadUInt16();
            this.OptionalHeader.DllCharacteristics = (DllCharacteristics)reader.ReadUInt16();

            if (peMagic == PEMagic.NT32)
            {
                this.OptionalHeader.SizeOfStackReserve = reader.ReadUInt32();
                this.OptionalHeader.SizeOfStackCommit = reader.ReadUInt32();
                this.OptionalHeader.SizeOfHeapReserve = reader.ReadUInt32();
                this.OptionalHeader.SizeOfHeapCommit = reader.ReadUInt32();
            }
            else
            {
                this.OptionalHeader.SizeOfStackReserve = reader.ReadUInt64();
                this.OptionalHeader.SizeOfStackCommit = reader.ReadUInt64();
                this.OptionalHeader.SizeOfHeapReserve = reader.ReadUInt64();
                this.OptionalHeader.SizeOfHeapCommit = reader.ReadUInt64();
            }

            this.OptionalHeader.LoaderFlags = reader.ReadUInt32();
            var rvaCountHeaderOffsetBase = reader.Position;
            this.OptionalHeader.NumberOfRvaAndSizes = reader.ReadUInt32();

            if (this.OptionalHeader.DataDirectories == null
                || this.OptionalHeader.DataDirectories.Length != this.OptionalHeader.NumberOfRvaAndSizes)
                this.OptionalHeader.DataDirectories = new DataDirectory[this.OptionalHeader.NumberOfRvaAndSizes];

            for (int i = 0; i < this.OptionalHeader.DataDirectories.Length; i++)
            {
                if (i == (int)DataDirectoryKind.Clr)
                {
                    var clrDirHeaderOffsetDelta = (reader.Position - rvaCountHeaderOffsetBase) / 4;
                }

                var dd = new DataDirectory();
                dd.Read(reader);
                this.OptionalHeader.DataDirectories[i] = dd;
            }
        }

        static void ReadSectionHeader(BinaryStreamReader reader, SectionHeader section)
        {
            section.Name = reader.ReadFixedZeroFilledAsciiString(SectionHeader.MaximumNameSize);
            section.VirtualSize = reader.ReadUInt32();
            section.VirtualAddress = reader.ReadUInt32();
            section.SizeOfRawData = reader.ReadUInt32();
            section.PointerToRawData = reader.ReadUInt32();
            section.PointerToRelocations = reader.ReadUInt32();
            section.PointerToLinenumbers = reader.ReadUInt32();
            section.NumberOfRelocations = reader.ReadUInt16();
            section.NumberOfLinenumbers = reader.ReadUInt16();
            section.Characteristics = (SectionCharacteristics)reader.ReadUInt32();
        }
    }
}