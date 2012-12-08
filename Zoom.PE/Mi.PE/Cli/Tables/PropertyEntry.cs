using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    using Mi.PE.Cli.Signatures;

    /// <summary>
    /// Properties within metadata are best viewed as a means to gather together collections of methods
    /// defined on a class, give them a name, and not much else.
    /// The methods are typically get_ and set_ methods,
    /// already defined on the class, and inserted like any other methods into the <see cref="TableKind.MethodDef"/> table.
    /// Within the rows owned by a given row in the <see cref="TableKind.TypeDef"/> table,
    /// there shall be no duplicates based upon <see cref="Name"/>+<see cref="Type"/>. [ERROR]
    /// [ECMA-335 §22.34]
    /// </summary>
    /// <remarks>
    /// Property tables do a little more than group together existing rows from other tables.
    /// The <see cref="TableKind.Property"/> table has columns for <see cref="Flags"/>, <see cref="Name"/> and <see cref="Type"/>.
    /// In addition, the <see cref="TableKind.MethodSemantics"/> table has a column to record whether the method it points at is a set_, a get_ or other.
    /// </remarks>
    public struct PropertyEntry
    {
        public PropertyDefinition PropertyDefinition;

        /// <summary>
        /// An index into the Blob heap.
        /// The name of this column is misleading.
        /// It does not index a <see cref="TableKind.TypeDef"/> or <see cref="TableKind.TypeRef"/> table —
        /// instead it indexes the signature in the Blob heap of the Property.
        /// 
        /// <see cref="Type"/> shall index a non-null signature in the Blob heap. [ERROR]
        /// The signature indexed by <see cref="Type"/> shall be a valid signature for a property
        /// (ie, low nibble of leading byte is 0x8).
        /// Apart from this leading byte, the signature is the same as the property‘s  get_ method. [ERROR]
        /// </summary>
        public PropertySig Type;

        public void Read(ClrModuleReader reader)
        {
            this.PropertyDefinition = new PropertyDefinition();
            this.PropertyDefinition.Attributes = (PropertyAttributes)reader.Binary.ReadUInt16();
            this.PropertyDefinition.Name = reader.ReadString();
            this.Type = reader.ReadPropertySignature();
        }
    }
}