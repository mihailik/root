using System;
using System.Collections.Generic;
using System.Linq;
using Mi.PE.Internal;

namespace Mi.PE.Unmanaged
{
    public sealed class BaseRelocationBlock
    {
        public const int HeaderSize = 8;

        /// <summary>
        ///  The image base plus the page RVA is added to each offset to create the VA where the base relocation must be applied.
        /// </summary>
        public uint PageRVA;

        /// <summary>
        ///  The total number of bytes in the base relocation block, including the <see cref="PageRVA"/> and <see cref="Size"/> fields and the Type/Offset fields that follow.
        /// </summary>
        public uint Size;

        public BaseRelocationEntry[] Entries;

        public static BaseRelocationBlock[] ReadBlocks(BinaryStreamReader reader, uint totalSize)
        {
            uint remainingSpace = totalSize;

            var result = new List<BaseRelocationBlock>();
            while (remainingSpace >= BaseRelocationBlock.HeaderSize)
            {
                var block = new BaseRelocationBlock();
                block.PageRVA = reader.ReadUInt32();
                block.Size = reader.ReadUInt32();

                remainingSpace -= BaseRelocationBlock.HeaderSize;

                uint remainingBlockSpace = block.Size - BaseRelocationBlock.HeaderSize;
                remainingBlockSpace = Math.Min(remainingBlockSpace, remainingSpace);

                remainingSpace -= remainingBlockSpace;
                
                uint entryCount = remainingBlockSpace / 2;
                var entries  = new BaseRelocationEntry[entryCount];
                for (int i = 0; i < entries.Length; i++)
                {
                    var entry = new BaseRelocationEntry();
                    ushort encodedEntry = reader.ReadUInt16();

                    entry.Type = (BaseRelocationType)(encodedEntry >> 12);
                    entry.Offset = (ushort)(encodedEntry & 0xFFF);

                    entries[i] = entry;
                }

                block.Entries = entries;

                result.Add(block);
            }

            return result.ToArray();
        }

        public override string ToString()
        {
            return this.PageRVA.ToString("X") + "h (" + this.Size + ")";
        }
    }
}