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
        public void WriteTo(BinaryStreamWriter writer)
        {
            WriteDosHeader(this.DosHeader, writer);

            if (this.DosStub != null)
                writer.WriteBytes(this.DosStub, 0, this.DosStub.Length);

            WritePEHeader(this.PEHeader, writer);
            WriteOptionalHeader(this.OptionalHeader, writer);

            foreach (var s in this.SectionHeaders)
            {
                WriteSectionHeader(writer, s);
            }
        }

        static void WriteDosHeader(DosHeader dosHeader, BinaryStreamWriter writer)
        {
            writer.WriteUInt16((ushort)MZSignature.MZ);
            writer.WriteUInt16(dosHeader.cblp);
            writer.WriteUInt16(dosHeader.cp);
            writer.WriteUInt16(dosHeader.crlc);
            writer.WriteUInt16(dosHeader.cparhdr);
            writer.WriteUInt16(dosHeader.minalloc);
            writer.WriteUInt16(dosHeader.maxalloc);
            writer.WriteUInt16(dosHeader.ss);
            writer.WriteUInt16(dosHeader.sp);
            writer.WriteUInt16(dosHeader.csum);
            writer.WriteUInt16(dosHeader.ip);
            writer.WriteUInt16(dosHeader.cs);
            writer.WriteUInt16(dosHeader.lfarlc);
            writer.WriteUInt16(dosHeader.ovno);

            writer.WriteUInt64(dosHeader.res1);

            writer.WriteUInt16(dosHeader.oemid);
            writer.WriteUInt16(dosHeader.oeminfo);

            writer.WriteUInt32(dosHeader.ReservedNumber0);
            writer.WriteUInt32(dosHeader.ReservedNumber1);
            writer.WriteUInt32(dosHeader.ReservedNumber2);
            writer.WriteUInt32(dosHeader.ReservedNumber3);
            writer.WriteUInt32(dosHeader.ReservedNumber4);
            writer.WriteUInt32(dosHeader.lfanew);
        }

        static void WritePEHeader(PEHeader peHeader, BinaryStreamWriter writer)
        {
            writer.WriteUInt32((uint)PESignature.PE00);
            writer.WriteUInt16((ushort)peHeader.Machine);
            writer.WriteUInt16(peHeader.NumberOfSections);

            double timestampDouble = (peHeader.Timestamp - TimestampEpochUTC).TotalSeconds;
            uint timestampNum = checked((uint)timestampDouble);
            if (timestampDouble - timestampNum > 0.5)
                timestampNum++;
            writer.WriteUInt32(timestampNum);

            writer.WriteUInt32(peHeader.PointerToSymbolTable);
            writer.WriteUInt32(peHeader.NumberOfSymbols);
            writer.WriteUInt16(peHeader.SizeOfOptionalHeader);
            writer.WriteUInt16((ushort)peHeader.Characteristics);
        }

        static void WriteOptionalHeader(OptionalHeader optionalHeader, BinaryStreamWriter writer)
        {
            writer.WriteUInt16((ushort)optionalHeader.PEMagic);

            writer.WriteByte(optionalHeader.MajorLinkerVersion);
            writer.WriteByte(optionalHeader.MinorLinkerVersion);
            writer.WriteUInt32(optionalHeader.SizeOfCode);
            writer.WriteUInt32(optionalHeader.SizeOfInitializedData);
            writer.WriteUInt32(optionalHeader.SizeOfUninitializedData);
            writer.WriteUInt32(optionalHeader.AddressOfEntryPoint);
            writer.WriteUInt32(optionalHeader.BaseOfCode);

            if (optionalHeader.PEMagic == PEMagic.NT32)
            {
                writer.WriteUInt32(optionalHeader.BaseOfData);
                writer.WriteUInt32(checked((uint)optionalHeader.ImageBase));
            }
            else
            {
                writer.WriteUInt64(optionalHeader.ImageBase);
            }

            writer.WriteUInt32(optionalHeader.SectionAlignment);
            writer.WriteUInt32(optionalHeader.FileAlignment);
            writer.WriteUInt16(optionalHeader.MajorOperatingSystemVersion);
            writer.WriteUInt16(optionalHeader.MinorOperatingSystemVersion);
            writer.WriteUInt16(optionalHeader.MajorImageVersion);
            writer.WriteUInt16(optionalHeader.MinorImageVersion);
            writer.WriteUInt16(optionalHeader.MajorSubsystemVersion);
            writer.WriteUInt16(optionalHeader.MinorSubsystemVersion);
            writer.WriteUInt32(optionalHeader.Win32VersionValue);
            writer.WriteUInt32(optionalHeader.SizeOfImage);
            writer.WriteUInt32(optionalHeader.SizeOfHeaders);
            writer.WriteUInt32(optionalHeader.CheckSum);
            writer.WriteUInt16((ushort)optionalHeader.Subsystem);
            writer.WriteUInt16((ushort)optionalHeader.DllCharacteristics);

            if (optionalHeader.PEMagic == PEMagic.NT32)
            {
                writer.WriteUInt32(checked((uint)optionalHeader.SizeOfStackReserve));
                writer.WriteUInt32(checked((uint)optionalHeader.SizeOfStackCommit));
                writer.WriteUInt32(checked((uint)optionalHeader.SizeOfHeapReserve));
                writer.WriteUInt32(checked((uint)optionalHeader.SizeOfHeapCommit));
            }
            else
            {
                writer.WriteUInt64(optionalHeader.SizeOfStackReserve);
                writer.WriteUInt64(optionalHeader.SizeOfStackCommit);
                writer.WriteUInt64(optionalHeader.SizeOfHeapReserve);
                writer.WriteUInt64(optionalHeader.SizeOfHeapCommit);
            }

            writer.WriteUInt32(optionalHeader.LoaderFlags);
            writer.WriteUInt32(optionalHeader.NumberOfRvaAndSizes);

            for (int i = 0; i < optionalHeader.DataDirectories.Length; i++)
            {
                writer.WriteUInt32(optionalHeader.DataDirectories[i].VirtualAddress);
                writer.WriteUInt32(optionalHeader.DataDirectories[i].Size);
            }
        }

        static void WriteSectionHeader(BinaryStreamWriter writer, SectionHeader section)
        {
            writer.WriteFixedZeroFilledAsciiString(section.Name, SectionHeader.MaximumNameSize);
            writer.WriteUInt32(section.VirtualSize);
            writer.WriteUInt32(section.VirtualAddress);
            writer.WriteUInt32(section.SizeOfRawData);
            writer.WriteUInt32(section.PointerToRawData);
            writer.WriteUInt32(section.PointerToRelocations);
            writer.WriteUInt32(section.PointerToLinenumbers);
            writer.WriteUInt16(section.NumberOfRelocations);
            writer.WriteUInt16(section.NumberOfLinenumbers);
            writer.WriteUInt32((uint)section.Characteristics);
        }
    }
}