using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    /// <summary>
    /// These records should not be emitted into any PE file.
    /// However, if present in a PE file, they should be treated as-if their fields were zero.
    /// They should be ignored by the CLI.
    /// [ECMA-335 §22.7]
    /// </summary>
    public struct AssemblyRefProcessorEntry
    {
        public uint Processor;

        public void Read(ClrModuleReader reader)
        {
            this.Processor = reader.Binary.ReadUInt32();
        }
    }
}