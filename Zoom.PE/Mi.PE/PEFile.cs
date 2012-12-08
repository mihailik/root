using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Reflection;

namespace Mi.PE
{
    using Mi.PE.PEFormat;

    public sealed partial class PEFile
    {
        public DosHeader DosHeader;
        public byte[] DosStub;
        public PEHeader PEHeader;
        public OptionalHeader OptionalHeader;
        public SectionHeader[] SectionHeaders;
    }
}