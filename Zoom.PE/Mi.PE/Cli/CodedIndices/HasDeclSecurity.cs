using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.CodedIndices
{
    using Mi.PE.Cli.Tables;

    public struct HasDeclSecurity : ICodedIndexDefinition
    {
        public TableKind[] Tables { get { return tables; } }

        static readonly TableKind[] tables = new[]
            {
                TableKind.TypeDef,
                TableKind.MethodDef,
                TableKind.Assembly
            };
    }
}