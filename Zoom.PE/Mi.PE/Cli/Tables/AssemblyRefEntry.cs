using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    /// <summary>
    /// The AssemblyRef table shall contain no duplicates
    /// (where duplicate rows are deemd to be those having the same
    /// MajorVersion, MinorVersion, BuildNumber, RevisionNumber, PublicKeyOrToken, Name, and Culture). [WARNING]
    /// [ECMA-335 §22.5]
    /// </summary>
    public struct AssemblyRefEntry
    {
        /// <summary>
        /// MajorVersion, MinorVersion, BuildNumber, and RevisionNumber can each have any value.
        /// </summary>
        public Version Version;

        /// <summary>
        /// <see cref="Flags"/> shall have only one bit set, the PublicKey bit (ECMA-335 §23.1.2). All other bits shall be zero. [ERROR]
        /// </summary>
        public AssemblyFlags Flags;

        /// <summary>
        /// <see cref="PublicKeyOrToken"/> can be null, or non-null
        /// (note that the Flags.PublicKey bit specifies whether the 'blob' is a full public key, or the short hashed token).
        /// If non-null, then <see cref="PublicKeyOrToken"/> shall index a valid offset in the Blob heap. [ERROR]
        /// </summary>
        public byte[] PublicKeyOrToken;

        /// <summary>
        /// <see cref="Name"/> shall index a non-empty string, in the String heap (there is no limit to its length). [ERROR]
        /// </summary>
        public string Name;

        /// <summary>
        /// <see cref="Culture"/> can be null or non-null.
        /// If non-null, it shall index a single string from the list specified (ECMA-335 §23.1.3). [ERROR]
        /// </summary>
        public string Culture;

        /// <summary>
        /// <see cref="HashValue"/> can be null or non-null.
        /// If non-null, then <see cref="HashValue"/> shall index a non-empty 'blob' in the Blob heap. [ERROR]
        /// </summary>
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