using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    using Mi.PE.Cli.CodedIndices;

    /// <summary>
    /// The <see cref="TabeKind.ImplMap"/> table holds information about unmanaged methods
    /// that can be reached from managed code, using PInvoke dispatch.
    /// Each row of the <see cref="TableKind.ImplMap"/> table associates a row in the <see cref="TableKind.MethodDef"/> table
    /// (<see cref="MemberForwarded"/>)
    /// with the name of a routine (<see cref="ImportName"/>) in some unmanaged DLL (<see cref="ImportScope"/>).  
    /// [ECMA-335 §22.22]
    /// </summary>
    public struct ImplMapEntry
    {
        /// <summary>
        /// A 2-byte bitmask of type <see cref="PInvokeAttributes"/>, ECMA-335 §23.1.8.
        /// </summary>
        public PInvokeAttributes MappingFlags;

        /// <summary>
        /// An index into the <see cref="TableKind.Field"/> or <see cref="TableKind.MethodDef"/> table;
        /// more precisely, a <see cref="MemberForwarded"/> (ECMA-335 §24.2.6) coded index.
        /// However, it only ever indexes the <see cref="TableKind.MethodDef"/> table, since Field export is not supported.
        /// </summary>
        public CodedIndex<MemberForwarded> MemberForwarded;

        public string ImportName;

        /// <summary>
        /// An index into the <see cref="TableKind.ModuleRef"/> table.
        /// </summary>
        public uint ImportScope;

        public void Read(ClrModuleReader reader)
        {
            this.MappingFlags = (PInvokeAttributes)reader.Binary.ReadUInt16();
            this.MemberForwarded = reader.ReadCodedIndex<MemberForwarded>();
            this.ImportName = reader.ReadString();
            this.ImportScope = reader.ReadTableIndex(TableKind.ModuleRef);
        }
    }
}