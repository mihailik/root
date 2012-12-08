using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Mi.PE;
using Mi.PE.Internal;

namespace ReadWriteRoundtrip
{
    class Program
    {
        static void Main(string[] args)
        {
            var pe = new PEFile();
            var originalBytes = Properties.Resources.console_anycpu;
            var reader = new BinaryStreamReader(new MemoryStream(originalBytes), new byte[1024]);
            pe.ReadFrom(reader);

            using (var output = File.Create("console.anycpu.exe"))
            {
                var writer = new BinaryStreamWriter(output);
                pe.WriteTo(writer);

                while (reader.Position < originalBytes.Length)
                {
                    writer.WriteByte(reader.ReadByte());
                }
            }
        }
    }
}