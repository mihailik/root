using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    /// <summary>
    /// This record should not be emitted into any PE file. 
    /// However, if present in a PE file, it shall be treated as if all its fields were zero.
    /// It shall be ignored by the CLI.
    /// [ECMA-335 §22.3]
    /// </summary>
    public struct AssemblyOSEntry
    {
        public uint OSPlatformID;
        public uint OSMajorVersion;
        public uint OSMinorVersion;

        public void Read(ClrModuleReader reader)
        {
            this.OSPlatformID = reader.Binary.ReadUInt32();
            this.OSMajorVersion = reader.Binary.ReadUInt32();
            this.OSMinorVersion = reader.Binary.ReadUInt32();
        }
    }
}