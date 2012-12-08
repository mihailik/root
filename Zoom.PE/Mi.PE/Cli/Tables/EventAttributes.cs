using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    /// <summary>
    /// [ECMA-335 §23.1.4]
    /// </summary>
    [Flags]
    public enum EventAttributes : ushort
    {
        /// <summary>
        /// Event is special.
        /// </summary>
        SpecialName = 0x0200,

        /// <summary>
        /// CLI provides 'special' behavior, depending upon the name of the event.
        /// </summary>
        RTSpecialName = 0x0400,
    }
}