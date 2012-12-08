using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    using Mi.PE.Cli.CodedIndices;

    /// <summary>
    /// [ECMA-335 §22.24]
    /// </summary>
    /// <remarks>
    /// The rows in the table result from .mresource directives on the Assembly (ECMA-335 §6.2.2).
    /// </remarks>
    public struct ManifestResourceEntry
    {
        /// <summary>
        ///  A 4-byte constant.
        ///  The <see cref="Offset"/> specifies the byte offset within the referenced file at which this resource record begins.
        /// <see cref="Offset"/> shall be a valid offset into the target file, starting from the Resource entry in the CLI header. [ERROR]
        /// If the resource is an index into the <see cref="TableKind.File"/> table, <see cref="Offset"/> shall be zero. [ERROR]
        /// </summary>
        public uint Offset;
        
        /// <summary>
        /// A 4-byte bitmask of type <see cref="ManifestResourceAttributes"/>, ECMA-335 §23.1.9.
        /// </summary>
        public ManifestResourceAttributes Flags; 

        public string Name;

        /// <summary>
        /// An index into a <see cref="TableKind.File"/> table, a <see cref="TableKind.AssemblyRef"/> table, or  null;
        /// more precisely, an <see cref="Implementation"/> (ECMA-335 §24.2.6) coded index.
        /// <see cref="Implementation"/> specifies which file holds this resource.
        /// <see cref="Implementation"/> can be null or non-null (if null, it means the resource is stored in the current file).
        /// </summary>
        public CodedIndex<Implementation> Implementation;

        public void Read(ClrModuleReader reader)
        {
            this.Offset = reader.Binary.ReadUInt32();
            this.Flags = (ManifestResourceAttributes)reader.Binary.ReadUInt32();
            this.Name = reader.ReadString();
            this.Implementation = reader.ReadCodedIndex<Implementation>();
        }
    }
}