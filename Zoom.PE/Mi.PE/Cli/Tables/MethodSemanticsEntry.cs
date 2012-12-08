using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    using Mi.PE.Cli.CodedIndices;

    /// <summary>
    /// [ECMA-335 §22.28]
    /// </summary>
    /// <remarks>
    /// The rows of the <see cref="TableKind.MethodSemantics"/> table are filled
    /// by .property (ECMA-335 §17) and .event directives (ECMA-335 §18). (See ECMA-335 §22.13 for more information.)
    /// 
    /// If this row is for an Event, and its <see cref="Semantics"/> is
    /// <see cref="MethodSemanticsAttributes.Addon"/>
    /// or <see cref="MethodSemanticsAttributes.RemoveOn"/>,
    /// then the row in the <see cref="TableKind.MethodDef"/> table indexed by Method
    /// shall take a Delegate as a parameter, and return void. [ERROR]
    /// 
    /// If this row is for an Event, and its <see cref="Semantics"/> is
    /// <see cref="MethodSemanticsAttributes.Fire"/>,
    /// then the row indexed in the <see cref="TableKind.MethodDef"/> table by Method
    /// can return any type.
    /// </remarks>
    public struct MethodSemanticsEntry
    {
        /// <summary>
        /// A 2-byte bitmask of type <see cref="MethodSemanticsAttributes"/>, ECMA-335 §23.1.12.
        /// If this row is for a Property, then exactly one of
        /// <see cref="MethodSemanticsAttributes.Setter"/>, 
        /// <see cref="MethodSemanticsAttributes.Getter"/>,
        /// or <see cref="MethodSemanticsAttributes.Other"/> shall be set. [ERROR]
        /// If this row is for an Event, then exactly one of
        /// <see cref="MethodSemanticsAttributes.AddOn"/>,
        /// <see cref="MethodSemanticsAttributes.RemoveOn"/>,
        /// <see cref="MethodSemanticsAttributes.Fire"/>,
        /// or <see cref="MethodSemanticsAttributes.Other"/> shall be set. [ERROR]
        /// </summary>
        public MethodSemanticsAttributes Semantics;

        /// <summary>
        /// An index into the <see cref="TableKind.MethodDef"/> table.
        /// Method shall index a valid row in the <see cref="TableKind.MethodDef"/> table,
        /// and that row shall be for a method defined on the same class as the Property or Event this row describes. [ERROR]
        /// </summary>
        public uint Method;

        /// <summary>
        /// An index into the <see cref="TableKind.Event"/> or <see cref="TableKind.Property"/> table;
        /// more precisely, a HasSemantics (ECMA-335 §24.2.6) coded index.
        /// </summary>
        public CodedIndex<HasSemantics> Association;

        public void Read(ClrModuleReader reader)
        {
            this.Semantics = (MethodSemanticsAttributes)reader.Binary.ReadUInt16();
            this.Method = reader.ReadTableIndex(TableKind.MethodDef);
            this.Association = reader.ReadCodedIndex<HasSemantics>();
        }
    }
}