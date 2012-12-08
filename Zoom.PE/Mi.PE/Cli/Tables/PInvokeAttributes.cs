using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    /// <summary>
    /// [ECMA-335 §23.1.8]
    /// </summary>
    [Flags]
    public enum PInvokeAttributes : ushort
    {
        /// <summary>
        /// PInvoke is to use the member name as specified.
        /// </summary>
        NoMangle = 0x0001,


        // Character set

        /// <summary>
        /// These 2 bits contain one of the following values:
        /// <see cref="CharSetNotSpec"/>,
        /// <see cref="CharSetAnsi"/>,
        /// <see cref="CharSetUnicode"/>,
        /// <see cref="CharSetAuto"/>.
        /// </summary>
        CharSetMask = 0x0006,
        
        CharSetNotSpec = 0x0000,
        CharSetAnsi = 0x0002,
        CharSetUnicode = 0x0004,
        CharSetAuto = 0x0006,


        /// <summary>
        /// Information about target function. Not relevant for fields.
        /// </summary>
        SupportsLastError = 0x0040,


        // Calling convention

        /// <summary>
        /// These 3 bits contain one of the following values:
        /// <see cref="CallConvPlatformapi"/>,
        /// <see cref="CallConvCdecl"/>,
        /// <see cref="CallConvStdcall"/>,
        /// <see cref="CallConvThiscall"/>,
        /// <see cref="CallConvFastcall"/>.
        /// </summary>
        CallConvMask = 0x0700,

        CallConvPlatformapi = 0x0100,

        CallConvCdecl = 0x0200,

        CallConvStdcall = 0x0300,

        CallConvThiscall = 0x0400,

        CallConvFastcall = 0x0500
    }
}