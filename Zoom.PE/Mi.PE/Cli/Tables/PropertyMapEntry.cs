using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    /// <summary>
    /// The <see cref="TableKind.PropertyMap"/> and <see cref="TableKind.Property"/> tables result from putting the .property directive on a class (ECMA-335 §17).
    /// [ECMA-335 §22.35]
    /// </summary>
    public struct PropertyMapEntry
    {
        /// <summary>
        /// An index into the <see cref="TableKind.TypeDef"/> table.
        /// </summary>
        public uint Parent;

        /// <summary>
        /// An index into the <see cref="TableKind.Property"/> table.
        /// It marks the first of a contiguous run of Properties owned by <see cref="Parent"/>.
        /// </summary>
        public uint PropertyList;

        public void Read(ClrModuleReader reader)
        {
            this.Parent = reader.ReadTableIndex(TableKind.TypeDef);
            this.PropertyList = reader.ReadTableIndex(TableKind.Property);
        }
    }
}