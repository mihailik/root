using System;

namespace Mi.PE.PEFormat
{
    public enum MZSignature : short
    {
        MZ = 'M' + ('Z' << 8)
    }
}