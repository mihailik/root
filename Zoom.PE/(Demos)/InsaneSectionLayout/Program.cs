using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Mi.PE;
using Mi.PE.Internal;
using Mi.PE.PEFormat;

namespace InsaneSectionLayout
{
    class Program
    {
        static void Main(string[] args)
        {
            var pe = new PEFile();
            var stream = new MemoryStream(Properties.Resources.console_anycpu);
            var reader = new BinaryStreamReader(stream, new byte[1024]);
            pe.ReadFrom(reader);

            uint lowestPointerToRawData = uint.MaxValue;
            uint lowestVirtualAddress = uint.MaxValue;
            uint highestVirtualAddress = uint.MinValue;

            foreach (var s in pe.SectionHeaders)
            {
                lowestPointerToRawData = Math.Min(lowestPointerToRawData, s.PointerToRawData);
                lowestVirtualAddress = Math.Min(lowestVirtualAddress, s.VirtualAddress);
                highestVirtualAddress = Math.Max(highestVirtualAddress, s.VirtualAddress + (uint)s.VirtualSize);
            }

            byte[] allSectionContent = new byte[highestVirtualAddress - lowestVirtualAddress];
            foreach (var s in pe.SectionHeaders)
            {
                reader.Position = s.PointerToRawData;
                reader.ReadBytes(allSectionContent, (int)(s.VirtualAddress - lowestVirtualAddress), (int)s.VirtualSize);
            }

            pe.PEHeader.NumberOfSections = 1;
            var singleSection = pe.SectionHeaders[0];
            singleSection.VirtualSize = (uint)allSectionContent.Length;
            pe.SectionHeaders = new[] { singleSection };

            using (var peFileStream = File.Create("console.anycpu.insane.exe"))
            {
                var writer = new BinaryStreamWriter(peFileStream);
                pe.WriteTo(writer);
                writer.Position = lowestPointerToRawData;
                writer.WriteBytes(allSectionContent, 0, allSectionContent.Length);
            }
        }
    }
}