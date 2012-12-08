using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    using Mi.PE.Cli.CodedIndices;

    /// <summary>
    /// The <see cref="TableKind.InterfaceImpl"/> table records the interfaces a type implements explicitly.
    /// Conceptually, each row in the <see cref="TableKind.InterfaceImpl"/> table indicates that <see cref="Class"/> implements <see cref="Interface"/>.
    /// There should be no duplicates in the <see cref="TableKind.InterfaceImpl"/> table, based upon non-null <see cref="Class"/> and <see cref="Interface"/> values  [WARNING]
    /// There can be many rows with the same value for <see cref="Class"/> (since a class can implement many interfaces).
    /// There can be many rows with the same value for <see cref="Interface"/> (since many classes can implement the same interface).
    /// [ECMA-335 §22.23]
    /// </summary>
    public struct InterfaceImplEntry
    {
        /// <summary>
        /// An index into the <see cref="TypeDef"/> table.
        /// Shall be non-null [ERROR]
        /// If <see cref="Class"/> is non-null, then:
        /// a. <see cref="Class"/> shall index a valid row in the <see cref="TableKind.TypeDef"/> table  [ERROR]
        /// b. <see cref="Interface"/> shall index a valid row in the <see cref="TabeKind.TypeDef."/> or <see cref="TableKind.TypeRef"/> table [ERROR]
        /// c. The row in the <see cref="TableKind.TypeDef"/>, <see cref="TabeKind.TypeRef"/>, or <see cref="TableKind.TypeSpec"/> table
        /// indexed by <see cref="Interface"/> /// shall be an interface (Flags.<see cref="TypeAttributes.Interface"/> = 1), not a <see cref="TypeAttributes.Class"/> or <see cref="TypeAttributes.ValueType"/>  [ERROR]
        /// </summary>
        public uint Class;

        public CodedIndex<TypeDefOrRef> Interface;

        public void Read(ClrModuleReader reader)
        {
            this.Class = reader.ReadTableIndex(TableKind.TypeDef);
            this.Interface = reader.ReadCodedIndex<TypeDefOrRef>();
        }
    }
}