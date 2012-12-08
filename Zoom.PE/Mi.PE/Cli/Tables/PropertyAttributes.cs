using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    /// <summary>
    /// [ECMA-335 §23.1.14]
    /// </summary>
    [Flags]
    public enum PropertyAttributes : ushort
    {
        /// <summary>
        /// Property is special.
        /// </summary>
        SpecialName = 0x0200,

        /// <summary>
        /// Runtime(metadata internal APIs) should check name encoding.
        /// </summary>
        RTSpecialName = 0x0400,

        /// <summary>
        /// Property has default.
        /// </summary>
        HasDefault = 0x1000,
        
        /// <summary>
        /// Reserved: shall be zero in a conforming implementation.
        /// </summary>
        Unused = 0xe9ff
    }
}