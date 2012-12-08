using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Cli
{
    public sealed class MarshalSpec
    {
        readonly byte[] blob;

        public MarshalSpec(byte[] blob)
        {
            this.blob = blob;
        }
    }
}