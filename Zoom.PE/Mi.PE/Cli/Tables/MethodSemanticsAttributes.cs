using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    /// <summary>
    /// [ECMA-335 §23.1.12]
    /// </summary>
    [Flags]
    public enum MethodSemanticsAttributes : ushort
    {
        /// <summary>
        /// Setter for property.
        /// </summary>
        Setter = 0x0001,

        /// <summary>
        /// Getter for property.
        /// </summary>
        Getter = 0x0002,

        /// <summary>
        /// Other method for property or event.
        /// </summary>
        Other = 0x0004,

        /// <summary>
        /// AddOn method for event.
        /// This refers to the required add_ method for events.  (ECMA-335 §22.13)
        /// </summary>
        AddOn = 0x0008,
        
        /// <summary>
        /// RemoveOn method for event.
        /// This refers to the required remove_ method for events. (ECMA-335 §22.13)
        /// </summary>
        RemoveOn = 0x0010,

        /// <summary>
        /// Fire method for event.
        /// This refers to the optional raise_ method for events. (ECMA-335 §22.13)
        /// </summary>
        Fire = 0x0020
    }
}