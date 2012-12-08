using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.CodedIndices
{
    using Mi.PE.Cli.Tables;

    public struct Implementation : ICodedIndexDefinition
    {
        public TableKind[] Tables { get { return tables; } }

        static readonly TableKind[] tables = new[]
            {
                TableKind.File,
                TableKind.AssemblyRef,
                TableKind.ExportedType
            };
    }
}