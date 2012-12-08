using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    using Mi.PE.Cli.CodedIndices;

    /// <summary>
    /// The <see cref="Constant"/> table is used to store compile-time, constant values for fields, parameters, and properties.
    /// [ECMA-335 §22.9]
    /// </summary>
    public struct ConstantEntry
    {
        /// <summary>
        /// <see cref="Type"/> (a 1-byte constant, followed by a 1-byte padding zero); see ECMA-335 §23.1.16.
        /// The encoding of <see cref="Type"/> for the nullref value for FieldInit in ilasm (ECMA-335 §16.2)
        /// is <see cref="ElementType.Class"/> with a Value of a 4-byte zero.
        /// Unlike uses of <see cref="ElementType.Class"/> in signatures, this one is not followed by a type token.
        /// </summary>
        /// <remarks>
        /// Type shall be exactly one of:
        /// <see cref="ElementType.Boolean"/>,
        /// <see cref="ElementType.Char"/>,
        /// <see cref="ElementType.I1"/>,  <see cref="ElementType.U1"/>,
        /// <see cref="ElementType.I2"/>, <see cref="ElementType.U2"/>,
        /// <see cref="ElementType.I4"/>, <see cref="ElementType.U4"/>, 
        /// <see cref="ElementType.I8"/>, <see cref="ElementType.U8"/>,
        /// <see cref="ElementType.R4"/>, <see cref="ElementType.R8"/>,
        /// or <see cref="ElementType.String"/>;
        /// or <see cref="ElementType.Class"/> with a <see cref="ConstantEntry.Value"/> of zero (ECMA-335 §23.1.16) [ERROR]
        /// </remarks>
        public ElementType Type;

        /// <summary>
        /// <see cref="Parent"/> (an index into the <see cref="TableKind.Param"/>, <see cref="TableKind.Field"/>, or <see cref="TableKind.Property"/> table;
        /// more precisely, a <see cref="HasConstant"/> (ECMA-335 §24.2.6) coded index).
        /// </summary>
        /// <remarks>
        /// <see cref="Parent"/> shall index a valid row in the <see cref="TableKind.Param"/>, <see cref="TableKind.Field"/>, or <see cref="TableKind.Property"/> table. [ERROR]
        /// There shall be no duplicate rows, based upon <see cref="Parent"/>[ERROR]
        /// </remarks>
        public CodedIndex<HasConstant> Parent;
        
        public byte[] Value;

        public void Read(ClrModuleReader reader)
        {
            this.Type = (ElementType)reader.Binary.ReadByte();
            byte padding = reader.Binary.ReadByte();
            this.Parent = reader.ReadCodedIndex<HasConstant>();
            this.Value = reader.ReadBlob();
        }
    }
}