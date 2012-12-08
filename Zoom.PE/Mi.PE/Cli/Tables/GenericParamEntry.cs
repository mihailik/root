using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    using Mi.PE.Cli.CodedIndices;

    /// <summary>
    /// The <see cref="TableKind.GenericParam"/> table stores the generic parameters used in generic type definitions and generic method definitions.
    /// These generic parameters can be constrained
    /// (i.e., generic arguments shall extend some class and/or implement certain interfaces)
    /// or unconstrained.
    /// (Such constraints are stored in the <see cref="TableKind.GenericParamConstraint"/> table.)
    /// Conceptually, each row in the <see cref="TableKind.GenericParam"/> table is owned by one, and only one, row
    /// in either the <see cref="TableKind.TypeDef"/> or <see cref="TableKind.MethodDef"/> tables.
    /// [ECMA-335 §22.20]
    /// </summary>
    public struct GenericParamEntry
    {
        /// <summary>
        /// The 2-byte index of the generic parameter, numbered left-to-right, from zero.
        /// </summary>
        public ushort Number;

        /// <summary>
        /// A 2-byte bitmask of type <see cref="GenericParamAttributes"/>, ECMA-335 §23.1.7.
        /// </summary>
        public GenericParamAttributes Flags;

        /// <summary>
        /// An index into the <see cref="TableKind.TypeDef"/> or <see cref="TableKind.MethodDef"/> table,
        /// specifying the Type or Method to which this generic parameter applies;
        /// more precisely, a <see cref="TypeOrMethodDef"/> (ECMA-335 §24.2.6) coded index.
        /// </summary>
        /// <remarks>
        /// The following additional restrictions apply:
        /// * <see cref="Owner"/> cannot be a non nested enumeration type; and
        /// * If <see cref="Owner"/> is a nested enumeration type then Number must be less than or equal
        /// to the number of generic parameters of the enclosing class.
        /// Rationale: generic enumeration types serve little purpose and usually only exist to meet CLR Rule 42.
        /// These additional restrictions limit the genericty of enumeration types while allowing CLS Rule 42 to be met.
        /// </remarks>
        public CodedIndex<TypeOrMethodDef> Owner;

        /// <summary>
        /// This is purely descriptive and is used only by source language compilers and by Reflection.
        /// </summary>
        public string Name;

        public void Read(ClrModuleReader reader)
        {
            this.Number = reader.Binary.ReadUInt16();
            this.Flags = (GenericParamAttributes)reader.Binary.ReadUInt16();
            this.Owner = reader.ReadCodedIndex<TypeOrMethodDef>();
            this.Name = reader.ReadString();
        }
    }
}