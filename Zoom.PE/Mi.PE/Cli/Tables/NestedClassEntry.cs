using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    /// <summary>
    /// [ECMA-335 §22.32]
    /// </summary>
    public struct NestedClassEntry
    {
        /// <summary>
        /// An index into the <see cref="TableKind.TypeDef"/> table.
        /// </summary>
        public uint NestedClass;

        /// <summary>
        /// An index into the <see cref="TableKind.TypeDef"/> table.
        /// </summary>
        public uint EnclosingClass;

        public void Read(ClrModuleReader reader)
        {
            this.NestedClass = reader.ReadTableIndex(TableKind.TypeDef);
            this.EnclosingClass = reader.ReadTableIndex(TableKind.TypeDef);
        }
    }
}