using System;
using System.Collections.Generic;
using System.Linq;
using Mi.PE.Internal;

namespace Mi.PE.PEFormat
{
    public struct DataDirectory
    {
        /// <summary> The relative virtual address of the table. </summary>
        public uint VirtualAddress;

        /// <summary> The size of the table, in bytes. </summary>
        public uint Size;

        public void Read(BinaryStreamReader reader)
        {
            this.VirtualAddress = reader.ReadUInt32();
            this.Size = reader.ReadUInt32();
        }

        #region ToString
        public override string ToString()
        {
            return this.VirtualAddress.ToString("X") + ":" + this.Size.ToString("X") + "h";
        }
        #endregion
    }
}