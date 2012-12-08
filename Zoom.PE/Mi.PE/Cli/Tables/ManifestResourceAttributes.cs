using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Cli.Tables
{
    /// <summary>
    /// [ECMA-335 §23.1.9]
    /// </summary>
    public enum ManifestResourceAttributes
    {
        /// <summary>
        /// These 3 bits contain one of the following values:
        /// </summary>
        VisibilityMask = 0x0007,

        /// <summary>
        /// The Resource is exported from the Assembly.
        /// </summary>
        Public = 0x0001,
        
        /// <summary>
        /// The Resource is private to the Assembly.
        /// </summary>
        Private = 0x0002
    }
}