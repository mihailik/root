using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using Mi.PE;
using Mi.PE.PEFormat;

namespace Zoom.PE.Model
{
    public sealed class SectionPaddingModel : AddressablePart
    {
        public SectionPaddingModel(ulong address, ulong length)
            : base("padding")
        {
            this.Address = address;
            this.Length = length;
        }
    }
}
