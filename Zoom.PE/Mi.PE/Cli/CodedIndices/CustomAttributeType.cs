using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.CodedIndices
{
    using Mi.PE.Cli.Tables;

    public struct CustomAttributeType : ICodedIndexDefinition
    {
        public TableKind[] Tables { get { return tables; } }

        static readonly TableKind[] tables = new[]
            {
                (TableKind)ushort.MaxValue, //TableKind.Not_used_0,
                (TableKind)ushort.MaxValue, //TableKind.Not_used_1,
                TableKind.MethodDef,
                TableKind.MemberRef,
                (TableKind)ushort.MaxValue //TableKind.Not_used_4
            };
    }
}