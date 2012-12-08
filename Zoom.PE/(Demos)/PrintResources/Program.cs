using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Mi.PE;
using Mi.PE.Internal;
using Mi.PE.PEFormat;
using Mi.PE.Unmanaged;

namespace PrintResources
{
    class Program
    {
        static void Main(string[] args)
        {
            string filename = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.System),
                "kernel32.dll");

            Console.WriteLine(Path.GetFileName(filename));
            var pe = new PEFile();
            var resources = GetResourcesFor(filename, pe);
            Print(resources);

            filename = typeof(int).Assembly.Location;

            Console.WriteLine(Path.GetFileName(filename));
            pe = new PEFile();
            resources = GetResourcesFor(filename, pe);
            Print(resources);

            filename = typeof(Program).Assembly.Location;

            Console.WriteLine(Path.GetFileName(filename));
            pe = new PEFile();
            resources = GetResourcesFor(filename, pe);
            Print(resources);

            filename = typeof(PEFile).Assembly.Location;

            Console.WriteLine(Path.GetFileName(filename));
            pe = new PEFile();
            resources = GetResourcesFor(filename, pe);
            Print(resources);
        }

        static ResourceDirectory GetResourcesFor(string file, PEFile pe)
        {
            var stream = new MemoryStream(File.ReadAllBytes(file));
            var reader = new BinaryStreamReader(stream, new byte[1024]);
            pe.ReadFrom(reader);

            var resDataDir = pe.OptionalHeader.DataDirectories[(int)DataDirectoryKind.Resources];

            var rvaStream = new RvaStream(
                stream,
                pe.SectionHeaders.Select(
                s => new RvaStream.Range
                {
                    PhysicalAddress = s.PointerToRawData,
                    Size = s.VirtualSize,
                    VirtualAddress = s.VirtualAddress
                })
                .ToArray());

            rvaStream.Position = resDataDir.VirtualAddress;

            var sectionReader = new BinaryStreamReader(rvaStream, new byte[32]);

            var res = new ResourceDirectory();
            res.Read(sectionReader);

            return res;
        }

        private static void Print(ResourceDirectory resources)
        {
            Print(resources, 0);
            Console.WriteLine();
        }

        private static void Print(ResourceDirectory resources, int indent)
        {
            foreach (var dir in resources.Subdirectories)
            {
                Console.WriteLine(new string(' ', indent * 3) + "["+(dir.Name == null ? dir.IntegerID.ToString() : "'" + dir.Name + "'")+"]");
                Print(dir.Directory, indent + 1);
            }

            foreach (var d in resources.DataEntries)
            {
                Console.WriteLine(new string(' ', indent * 3) + (d.Name == null ? d.IntegerID.ToString() : "'" + d.Name + "'") + " : " + d.DataRVA.ToString("X") + ":" + d.Size.ToString("X") + "h");
            }
        }
    }
}
