using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    using Mi.PE.Cli.Signatures;

    /// <summary>
    /// The <see cref="TableKind.TypeSpec"/> table has just one column,
    /// which indexes the specification of a Type, stored in the Blob heap.
    /// This provides a metadata token for that Type (rather than simply an index into the Blob heap).
    /// This is required, typically, for array operations, such as creating, or calling methods on the array class.
    /// [ECMA-335 §22.39]
    /// </summary>
    /// <remarks>
    /// Note that TypeSpec tokens can be used with any of the CIL instructions
    /// that take a TypeDef or TypeRef token;
    /// specifically, castclass, cpobj, initobj, isinst, ldelema, ldobj, mkrefany, newarr, refanyval, sizeof, stobj, box, and unbox.
    /// </remarks>
    public struct TypeSpecEntry
    {
        public TypeReference Signature;

        public void Read(ClrModuleReader reader)
        {
            this.Signature = reader.ReadTypeSpec();
        }
    }
}