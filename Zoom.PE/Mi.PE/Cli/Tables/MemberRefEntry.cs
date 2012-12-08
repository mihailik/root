using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    using Mi.PE.Cli.CodedIndices;
    using Mi.PE.Cli.Signatures;

    /// <summary>
    /// The <see cref="TableKind.MemberRef"/> table combines two sorts of references, to Methods and to Fields of a class,
    /// known as 'MethodRef' and 'FieldRef', respectively.
    /// [ECMA-335 §22.25]
    /// </summary>
    public struct MemberRefEntry
    {
        /// <summary>
        /// An index into the <see cref="TabeKind.MethodDef"/>, <see cref="TableKind.ModuleRef"/>,
        /// <see cref="TableKind.TypeDef"/>, <see cref="TableKind.TypeRef"/>, or <see cref="TableKind.TypeSpec"/> tables;
        /// more precisely, a <see cref="MemberRefParent"/> (ECMA-335 §24.2.6) coded index.
        /// </summary>
        /// <remarks>
        /// An entry is made into the <see cref="TableKind.MemberRef"/> table
        /// whenever a reference is made in the CIL code to a method or field
        /// which is defined in another module or assembly.
        /// (Also, an entry is made for a call to a method with a VARARG signature, even when it is defined in the same module as the call site.)
        /// </remarks>
        public CodedIndex<MemberRefParent> Class;

        public string Name;

        public byte[] SignatureBlob;

        public void Read(ClrModuleReader reader)
        {
            this.Class = reader.ReadCodedIndex<MemberRefParent>();
            this.Name = reader.ReadString();
            this.SignatureBlob = reader.ReadBlob();
        }
    }
}