using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.PEFormat
{
    using Mi.PE.Internal;
    
    public sealed class DosHeader
    {
        public const int Size = 64;

        /// <summary> Bytes on last page of file. </summary>
        public ushort cblp;

        /// <summary> Pages in file. </summary>
        public ushort cp;

        /// <summary> Relocations. </summary>
        public ushort crlc;

        /// <summary> Size of header in paragraphs. </summary>
        public ushort cparhdr;

        /// <summary> Minimum extra paragraphs needed. </summary>
        public ushort minalloc;

        /// <summary> Maximum extra paragraphs needed. </summary>
        public ushort maxalloc;

        /// <summary> Initial (relative) SS value. </summary>
        public ushort ss;

        /// <summary> Initial SP value. </summary>
        public ushort sp;

        /// <summary> Checksum. </summary>
        public ushort csum;

        /// <summary>  Initial IP value. </summary>
        public ushort ip;

        /// <summary> Initial (relative) CS value. </summary>
        public ushort cs;

        /// <summary> File address of relocation table. </summary>
        public ushort lfarlc;

        /// <summary> Overlay number. </summary>
        public ushort ovno;

        public ulong res1;

        /// <summary> OEM identifier (for e_oeminfo). </summary>
        public ushort oemid;

        /// <summary> OEM information; e_oemid specific. </summary>
        public ushort oeminfo;

        public uint ReservedNumber0;
        public uint ReservedNumber1;
        public uint ReservedNumber2;
        public uint ReservedNumber3;
        public uint ReservedNumber4;

        /// <summary> File address of PE header. </summary>
        public uint lfanew;

        #region ToString
        public override string ToString()
        {
            return "[MZ].lfanew=" + this.lfanew.ToString("X") + "h";
        }
        #endregion
    }
}