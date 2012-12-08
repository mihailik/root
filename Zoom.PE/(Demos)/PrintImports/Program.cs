using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mi.PE;
using Mi.PE.Internal;
using Mi.PE.PEFormat;

namespace PrintImports
{
    class Program
    {
        static void Main(string[] args)
        {
            string kernel32 = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.System),
                "kernel32.dll");

            Console.WriteLine(Path.GetFileName(kernel32));
            var imports = GetImportsFor(kernel32);

            foreach (var i in imports)
            {
                Console.WriteLine("  " + i.ToString());
            }

            string self = typeof(Program).Assembly.Location;
            Console.WriteLine(Path.GetFileName(self));
            imports = GetImportsFor(self);

            foreach (var i in imports)
            {
                Console.WriteLine("  " + i.ToString());
            }
        }

        private static Mi.PE.Unmanaged.Import[] GetImportsFor(string file)
        {
            var stream = new MemoryStream(File.ReadAllBytes(file));
            var reader = new BinaryStreamReader(stream, new byte[1024]);
            var pe = new PEFile();
            pe.ReadFrom(reader);

            var importDirectory = pe.OptionalHeader.DataDirectories[(int)DataDirectoryKind.ImportSymbols];

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

            rvaStream.Position = importDirectory.VirtualAddress;

            var sectionReader = new BinaryStreamReader(rvaStream, new byte[32]);

            var imports = Mi.PE.Unmanaged.Import.ReadImports(sectionReader);
            return imports;
        }
    }
}