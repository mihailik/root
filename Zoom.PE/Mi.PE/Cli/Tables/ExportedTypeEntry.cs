using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    using Mi.PE.Cli.CodedIndices;

    /// <summary>
    /// The <see cref="TableKind.ExportedType"/> table holds a row for each type:
    /// a. Defined within other modules of this Assembly; that is exported out of this Assembly.
    /// In essence, it stores <see cref="TableKind.TypeDef"/> row numbers of all types
    /// that are marked public in other modules that this Assembly comprises.
    /// The actual target row in a <see cref="TableKind.TypeDef"/> table is given by the combination of <see cref="TypeDefId"/>
    /// (in effect, row number) and Implementation (in effect, the module that holds the target <see cref="TableKind.TypeDef"/> table).
    /// Note that this is the only occurrence in metadata of foreign tokens;
    /// that is, token values that have a meaning in another module.
    /// (A regular token value is an index into a table in the current module);
    /// OR
    /// b. Originally defined in this Assembly but now moved to another Assembly.
    /// <see cref="Flags"/> must have <see cref="TypeAttributes.IsTypeForwarder"/> set
    /// and <see cref="Implementation"/> is an <see cref="TableKind.AssemblyRef"/>
    /// indicating the Assembly the type may now be found in.
    /// 
    /// The full name of the type need not be stored directly.
    /// Instead, it can be split into two parts at any included '.'
    /// (although typically this is done at the last '.' in the full name).
    /// The part preceding the '.' is stored as the <see cref="TypeNamespace"/>
    /// and that following the '.' is stored as the <see cref="TypeName"/>.
    /// If there is no '.' in the full name,
    /// then the <see cref="TypeNamespace"/> shall be the index of the empty string.
    /// [ECMA-335 §22.14]
    /// </summary>
    /// <remarks>
    /// The rows in the <see cref="TableKind."/> table are the result of the .class extern directive (ECMA-335 §6.7).
    /// </remarks>
    public struct ExportedTypeEntry
    {
        /// <summary>
        /// A 4-byte bitmask of type <see cref="TypeAttributes"/>, ECMA-335 §23.1.15.
        /// </summary>
        public TypeAttributes Flags;

        /// <summary>
        /// A 4-byte index into a <see cref="TableKind.TypeDef"/> table of another module in this Assembly.
        /// This column is used as a hint only.
        /// If the entry in the target <see cref="TableKind.TypeDef"/> table
        /// matches the <see cref="TypeName"/> and <see cref="TypeNamespace"/> entries in this table,
        /// resolution has succeeded.
        /// But if there is a mismatch, the CLI shall fall back to a search
        /// of the target <see cref="TableKind.TypeDef"/> table.
        /// Ignored and should be zero if <see cref="Flags"/> has <see cref="TypeAttributes.IsTypeForwarder"/> set.
        /// </summary>
        public uint TypeDefId;

        public string TypeName;

        public string TypeNamespace;

        /// <summary>
        /// This is an index (more precisely, an <see cref="Implementation"/> (ECMA-335 §24.2.6) coded index)
        /// into either of the following tables:
        /// * <see cref="TableKind.File"/> table, where that entry says which module in the current assembly holds the <see cref="TableKind.TypeDef"/>;
        /// * <see cref="TableKind.ExportedType"/> table, where that entry is the enclosing Type of the current nested Type;
        /// * <see cref="TableKind.AssemblyRef"/> table, where that entry says in which assembly the type may now be found
        /// (<see cref="Flags"/> must have the <see cref="TypeAttributes.IsTypeForwarder"/> flag set).
        /// </summary>
        public CodedIndex<Implementation> Implementation;

        public void Read(ClrModuleReader reader)
        {
            this.Flags = (TypeAttributes)reader.Binary.ReadUInt32();
            this.TypeDefId = reader.Binary.ReadUInt32();
            this.TypeName = reader.ReadString();
            this.TypeNamespace = reader.ReadString();
            this.Implementation = reader.ReadCodedIndex<Implementation>();
        }
    }
}