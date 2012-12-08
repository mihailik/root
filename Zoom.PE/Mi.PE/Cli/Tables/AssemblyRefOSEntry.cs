using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    /// <summary>
    /// These records should not be emitted into any PE file.
    /// However, if present in a PE file, they should be treated as-if their fields were zero.
    /// They should be ignored by the CLI.
    /// [ECMA-335 §22.6]
    /// </summary>
    public struct AssemblyRefOSEntry
    {
        public Version Version;
        public AssemblyFlags Flags;
        public byte[] PublicKeyOrToken;
        public string Name;
        public string Culture;
        public byte[] HashValue;

        public void Read(ClrModuleReader reader)
        {
            this.Version = reader.ReadVersion();
            this.Flags = (AssemblyFlags)reader.Binary.ReadUInt32();
            this.PublicKeyOrToken = reader.ReadBlob();
            this.Name = reader.ReadString();
            this.Culture = reader.ReadString();
            this.HashValue = reader.ReadBlob();
        }
    }
}