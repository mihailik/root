using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.CodedIndices
{
    using Mi.PE.Cli.Tables;

    public interface ICodedIndexDefinition
    {
        TableKind[] Tables { get; }
    }
}