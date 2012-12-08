using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using Mi.PE;
using Mi.PE.PEFormat;

namespace Zoom.PE.Model
{
    public sealed class SectionContentModel :AddressablePart
    {
        readonly SectionHeader sectionHeader;

        public SectionContentModel(SectionHeader sectionHeader)
            : base(sectionHeader.Name)
        {
            this.sectionHeader = sectionHeader;
            this.Address = sectionHeader.PointerToRawData;
            this.Length = sectionHeader.SizeOfRawData;
        }

        public ulong VirtualAddress { get { return sectionHeader.VirtualAddress; } }
    }
}