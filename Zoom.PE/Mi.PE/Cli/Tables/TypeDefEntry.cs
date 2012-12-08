using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    using Mi.PE.Cli.CodedIndices;

    /// <summary>
    /// The first row of the <see cref="TableKind.TypeDef"/> table represents the pseudo class that acts as parent for functions and variables defined at module scope.
    /// [ECMA-335 §22.37]
    /// </summary>
    public struct TypeDefEntry
    {
        public TypeDefinition TypeDefinition;

        /// <summary>
        /// An index into the <see cref="TableKind.TypeDef"/>, <see cref="TableKind.TypeRef"/>, or <see cref="TableKind.TypeSpec"/> table;
        /// more precisely, a <see cref="TypeDefOrRef"/> (ECMA §24.2.6) coded index.
        /// </summary>
        public CodedIndex<TypeDefOrRef> Extends;

        /// <summary>
        ///  An index into the <see cref="TableKind.Field"/> table;
        ///  it marks the first of a contiguous run of Fields owned by this Type.
        /// </summary>
        public uint FieldList;

        /// <summary>
        /// An index into the <see cref="TableKind.MethodDef"/> table;
        /// it marks the first of a continguous run of Methods owned by this Type.
        /// </summary>
        public uint MethodList;

        public void Read(ClrModuleReader reader)
        {
            this.TypeDefinition = new TypeDefinition();

            this.TypeDefinition.Attributes = (TypeAttributes)reader.Binary.ReadUInt32();
            this.TypeDefinition.Name = reader.ReadString();
            this.TypeDefinition.Namespace = reader.ReadString();
            this.Extends = reader.ReadCodedIndex<TypeDefOrRef>();
            this.FieldList = reader.ReadTableIndex(TableKind.Field);
            this.MethodList = reader.ReadTableIndex(TableKind.MethodDef);
        }
    }
}