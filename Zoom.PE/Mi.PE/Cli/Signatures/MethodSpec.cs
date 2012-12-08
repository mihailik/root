using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Cli.Signatures
{
    using Mi.PE.Internal;

    /// <summary>
    /// [ECMA-335 §23.2.15]
    /// </summary>
    public sealed class MethodSpec
    {
        public TypeReference[] GenArgs;

        public void Read(BinaryStreamReader signatureBlobReader)
        {
            byte genericInst = signatureBlobReader.ReadByte();
            if (genericInst != 0x0a)
                throw new BadImageFormatException("Invalid leading byte in MethodSpec: " + genericInst + ".");

            uint? genArgCount = signatureBlobReader.ReadCompressedUInt32();
            if(genArgCount==null)
                throw new BadImageFormatException("Null value for MethodSpec.GenArgCount is not supported.");

            this.GenArgs = new TypeReference[genArgCount.Value];
        }
    }
}