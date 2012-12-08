using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    using Mi.PE.Cli.CodedIndices;

    /// <summary>
    /// The first row of the TypeDef table represents the pseudo class that acts as parent for functions and variables defined at module scope.
    /// [ECMA-335 §22.38]
    /// </summary>
    public struct TypeRefEntry
    {
        public CodedIndex<ResolutionScope> ResolutionScope;

        public TypeReference.External TypeReference;

        public void Read(ClrModuleReader reader)
        {
            this.TypeReference = new TypeReference.External();

            this.ResolutionScope = reader.ReadCodedIndex<ResolutionScope>();
            this.TypeReference.Name = reader.ReadString();
            this.TypeReference.Namespace = reader.ReadString();
        }
    }
}
