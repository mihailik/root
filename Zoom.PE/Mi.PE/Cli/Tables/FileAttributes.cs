using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    /// <summary>
    /// [ECMA-335 §23.1.6]
    /// </summary>
    public enum FileAttributes : uint
    {
        /// <summary>
        /// This is not a resource file.
        /// </summary>
        ContainsMetaData = 0x0000,

        /// <summary>
        /// This is a resource file or other non-metadata-containing file.
        /// </summary>
        ContainsNoMetaData = 0x0001
    }
}