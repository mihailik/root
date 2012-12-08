using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    /// <summary>
    /// Note that each Field in any Type is defined by its Signature.
    /// When a Type instance (i.e., an object) is laid out by the CLI, each Field is one of four kinds:
    /// * Scalar: for any member of built-in type, such as int32.
    /// The size of the field is given by the size of that intrinsic, which varies between 1 and 8 bytes.
    /// * ObjectRef: for <see cref="ElementType.Class"/>, <see cref="ElementType.String"/>, <see cref="ElementType.Object"/>,
    /// <see cref="ElementType.Array"/>, <see cref="ElementType.SZArray"/>.
    /// * Pointer: for <see cref="ElementType.Ptr"/>, <see cref="ElementType.FNPtr"/>.
    /// * ValueType: for <see cref="ElementType.VaueType"/>.
    /// The instance of that ValueType is actually laid out in this object,
    /// so the size of the field is the size of that ValueType.
    /// Note that metadata specifying explicit structure layout can be valid for use on one platform but not on another, 
    /// since some of the rules specified here are dependent on platform-specific alignment rules.
    /// [ECMA-335 §22.16]
    /// </summary>
    /// <remarks>
    /// A row in the <see cref="TableKind.FieldLayout"/> table is created if the .field directive for the parent field has specified a field offset (ECMA-335 §16).
    /// </remarks>
    public struct FieldLayoutEntry
    {
        /// <summary>
        /// Offset shall be zero or more. [ERROR]
        /// Among the rows owned by a given Type it is perfectly  valid for several rows to have the same value of Offset.
        /// <see cref="ElementType.ObjectRef"/> and a <see cref="ElementType.ValueType"/> cannot have the same offset. [ERROR]
        /// Every <see cref="Field"/> of an ExplicitLayout Type shall be given an offset;
        /// that is, it shall have a row in the FieldLayout table. [ERROR]
        /// </summary>
        public uint Offset;

        /// <summary>
        /// An index into the Field table.
        /// </summary>
        public uint Field;

        public void Read(ClrModuleReader reader)
        {
            this.Offset = reader.Binary.ReadUInt32();
            this.Field = reader.ReadTableIndex(TableKind.Field);
        }
    }
}