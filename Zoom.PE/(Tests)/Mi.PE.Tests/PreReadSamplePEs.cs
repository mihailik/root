using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using Mi.PE.Internal;

namespace Mi.PE
{
    internal static class PreReadSamplePEs
    {
        public static class Console
        {
            public static readonly PEFile AnyCPU = Read(Properties.Resources.console_anycpu);
            public static readonly PEFile X86 = Read(Properties.Resources.console_x86);
            public static readonly PEFile X64 = Read(Properties.Resources.console_x64);
            public static readonly PEFile Itanium = Read(Properties.Resources.console_itanium);
        }

        static PEFile Read(byte[] bytes)
        {
            var stream = new MemoryStream(bytes);
            var reader = new BinaryStreamReader(stream, new byte[32]);
            var pe = new PEFile();
            pe.ReadFrom(reader);
            return pe;
        }
    }
}