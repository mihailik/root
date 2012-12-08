using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli
{
    public enum AssemblyFlags
    {
        /// <summary>
        /// The assembly reference holds the full (unhashed) public key.
        /// </summary>
        PublicKey = 0x0001,

        /// <summary>
        /// The implementation of this assembly used at runtime is not expected to match the version seen at compile time.
        /// (See the text following this table.)
        /// </summary>
        Retargetable = 0x0100,

        /// <summary>
        /// Reserved 
        /// (a conforming implementation of the CLI can ignore this setting on read;
        /// some implementations might use this bit to indicate
        /// that a CIL-to-native-code compiler should not generate optimized code).
        /// </summary>
        DisableJITcompileOptimizer = 0x4000,

        /// <summary>
        /// Reserved
        /// (a conforming implementation of the CLI can ignore this setting on read;
        /// some implementations might use this bit to indicate
        /// that a CIL-to-native-code compiler should generate CIL-to-native code map).
        /// </summary>
        EnableJITcompileTracking = 0x8000
    }
}