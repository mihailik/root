using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    /// <summary>
    /// The Assembly table shall contain zero or one row. [ERROR]
    /// [ECMA-335 §22.2]
    /// </summary>
    public struct AssemblyEntry
    {
        /// <summary>
        /// <see cref="HashAlgId"/> shall be one of the specified values. [ERROR]
        /// </summary>
        public AssemblyHashAlgorithm HashAlgId;

        /// <summary>
        /// MajorVersion, MinorVersion, BuildNumber, and RevisionNumber can each have any value.
        /// </summary>
        public Version Version;

        /// <summary>
        /// <see cref="Flags"/> shall have only those values set that are specified. [ERROR]
        /// </summary>
        public AssemblyFlags Flags;

        /// <summary>
        /// <see cref="PublicKey"/> can be null or non-null.
        /// </summary>
        public byte[] PublicKey;

        /// <summary>
        /// <see cref="Name"/> shall index a non-empty string in the String heap. [ERROR]
        /// . The string indexed by <see cref="Name"/> can be of unlimited length.
        /// </summary>
        public string Name;

        /// <summary>
        /// <see cref="Culture "/> can be null or non-null.
        /// If <see cref="Culture"/> is non-null, it shall index a single string from the list specified (ECMA-335 §23.1.3). [ERROR]
        /// </summary>
        public string Culture;

        public void Read(ClrModuleReader reader)
        {
            this.HashAlgId = (AssemblyHashAlgorithm)reader.Binary.ReadUInt32();
            this.Version = reader.ReadVersion();
            this.Flags = (AssemblyFlags)reader.Binary.ReadUInt32();
            this.PublicKey = reader.ReadBlob();
            this.Name = reader.ReadString();
            this.Culture = reader.ReadString();
        }
    }
}