using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Cli
{
    using Mi.PE.Cli.Tables;

    public sealed class MethodDefinition
    {
        public string Name;
        public MethodAttributes Attributes;
        public MethodImplAttributes ImplAttributes;
        public ParameterDefinition[] Parameters;
    }
}