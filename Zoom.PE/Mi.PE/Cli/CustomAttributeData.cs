using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Cli
{
    public sealed class CustomAttributeData
    {
        readonly byte[] blob;

        public CustomAttributeData(byte[] blob)
        {
            this.blob = blob;
        }
    }
}