using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Unmanaged
{
    public sealed class BaseRelocationEntry
    {
        public const int Size = 2;

        /// <summary>
        ///  Type of base relocation to be applied.
        /// </summary>
        public BaseRelocationType Type;

        /// <summary>
        /// Offset from the starting address that was specified in the <see cref="PageRVA"/> field for the block.
        /// This offset specifies where the base relocation is to be applied.
        /// </summary>
        public ushort Offset;

        #region ToString
        public override string ToString()
        {
            return this.Offset.ToString("X4") + "h " + this.Type;
        }
        #endregion
    }
}