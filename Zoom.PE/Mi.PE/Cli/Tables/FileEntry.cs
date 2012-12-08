using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    /// <summary>
    /// [ECMA-335 §22.19]
    /// </summary>
    public struct FileEntry
    {
        /// <summary>
        /// A 4-byte bitmask of type FileAttributes, ECMA-335 §23.1.6.
        /// If this module contains a row in the <see cref="TableKind.Assembly"/> table
        /// (that is, if this module 'holds the manifest')
        /// then there shall not be any row in the <see cref="TableKind.File"/> table for this module; i.e., no self-reference. [ERROR]
        /// If the <see cref="TableKind.File"/> table is empty, then this, by definition, is a single-file assembly.
        /// In this case, the <see cref="TableKind.ExportedType"/> table should be empty  [WARNING]
        /// </summary>
        public FileAttributes Flags;
        
        /// <summary>
        /// <see cref="Name"/> shall index a non-empty string in the String heap.
        /// It shall be in the format filename.extension  (e.g., 'foo.dll', but not 'c:\utils\foo.dll'). [ERROR]
        /// There shall be no duplicate rows; that is, rows with the same <see cref="Name"/> value. [ERROR]
        /// </summary>
        public string Name;

        /// <summary>
        /// <see cref="HashValue"/> shall index a non-empty 'blob' in the Blob heap. [ERROR]
        /// </summary>
        public byte[] HashValue;

        public void Read(ClrModuleReader reader)
        {
            this.Flags = (FileAttributes)reader.Binary.ReadUInt32();
            this.Name = reader.ReadString();
            this.HashValue = reader.ReadBlob();
        }
    }
}