using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mi.PE;
using Mi.PE.Cli;
using Mi.PE.Internal;
using Mi.PE.PEFormat;
using Mi.PE.Unmanaged;

namespace PrintClrBasics
{
    class Program
    {
        public class ArrayListDescendant : System.Collections.ArrayList { }

        static void Main(string[] args)
        {
            string mscolib = typeof(int).Assembly.Location;

            var pe = new PEFile();

            Console.WriteLine(Path.GetFileName(mscolib));
            var clrBasics = GetClrBasicsFor(mscolib, pe);

            PrintClrHeader(clrBasics);
            PrintPEBasics(pe);

            string self = typeof(Program).Assembly.Location;
            Console.WriteLine(Path.GetFileName(self));
            var clrBasics2 = GetClrBasicsFor(self, pe);

            PrintClrHeader(clrBasics2);
            PrintPEBasics(pe);
        }

        private static void PrintPEBasics(PEFile pe)
        {
            Console.WriteLine(" EntryPoint: " + pe.OptionalHeader.AddressOfEntryPoint.ToString("x") + "h");
            Console.WriteLine(" ImageVersion: " + pe.OptionalHeader.MajorImageVersion + "." + pe.OptionalHeader.MinorImageVersion);
            Console.WriteLine(" Win32Version: " + pe.OptionalHeader.Win32VersionValue);
            Console.WriteLine(" Subsystem: " + pe.OptionalHeader.Subsystem + " (" + ((int)pe.OptionalHeader.Subsystem).ToString("x") + "h)");
            Console.WriteLine(" DllCharacteristics: " + pe.OptionalHeader.DllCharacteristics + " (" + ((int)pe.OptionalHeader.DllCharacteristics).ToString("x") + "h)isibcop");
        }

        private static void PrintClrHeader(ModuleDefinition clrMod)
        {
            Console.WriteLine(" '" + clrMod.Name + "'");
            Console.WriteLine("  Flags: " + clrMod.ImageFlags);
            Console.WriteLine("  CLR v" + clrMod.RuntimeVersion);
            Console.WriteLine("  Metadata v" + clrMod.MetadataVersion + " " + clrMod.MetadataVersionString);
            Console.WriteLine("  TableStream v" + clrMod.TableStreamVersion);

            var types =
                (from t in clrMod.Types ?? new TypeDefinition[] { }
                 orderby t.Namespace, t.Name
                 select t).ToArray();

            Console.WriteLine("  " + types.Length + " types");
        }

        private static ModuleDefinition GetClrBasicsFor(string file, PEFile pe)
        {
            var stream = new MemoryStream(File.ReadAllBytes(file));
            var reader = new BinaryStreamReader(stream, new byte[1024]);
            pe.ReadFrom(reader);

            var clrDirectory = pe.OptionalHeader.DataDirectories[(int)DataDirectoryKind.Clr];

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

            rvaStream.Position = clrDirectory.VirtualAddress;

            var sectionReader = new BinaryStreamReader(rvaStream, new byte[32]);

            var clrmod = new ModuleDefinition();
            ClrModuleReader.Read(sectionReader, clrmod);

            return clrmod;
        }
    }
}