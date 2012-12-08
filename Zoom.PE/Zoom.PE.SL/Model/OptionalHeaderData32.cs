using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using Mi.PE;
using Mi.PE.PEFormat;

namespace Zoom.PE.Model
{
    public sealed class OptionalHeaderData32 : OptionalHeaderData
    {
        public OptionalHeaderData32(OptionalHeader optionalHeader)
            : base(optionalHeader)
        {
        }

        public uint BaseOfData
        {
            get { return optionalHeader.BaseOfData; }
            set
            {
                if (value == optionalHeader.BaseOfData)
                    return;

                optionalHeader.BaseOfData = value;
                OnPropertyChanged("BaseOfData");
            }
        }

        public uint ImageBase
        {
            get { return (uint)optionalHeader.ImageBase; }
            set
            {
                if (value == optionalHeader.ImageBase)
                    return;

                optionalHeader.ImageBase = value;
                OnPropertyChanged("ImageBase");
            }
        }

        public uint SizeOfStackReserve
        {
            get { return (uint)optionalHeader.SizeOfStackReserve; }
            set
            {
                if (value == optionalHeader.SizeOfStackReserve)
                    return;

                optionalHeader.SizeOfStackReserve = value;
                OnPropertyChanged("SizeOfStackReserve");
            }
        }

        public uint SizeOfStackCommit
        {
            get { return (uint)optionalHeader.SizeOfStackCommit; }
            set
            {
                if (value == optionalHeader.SizeOfStackCommit)
                    return;

                optionalHeader.SizeOfStackCommit = value;
                OnPropertyChanged("SizeOfStackCommit");
            }
        }

        public uint SizeOfHeapReserve
        {
            get { return (uint)optionalHeader.SizeOfHeapReserve; }
            set
            {
                if (value == optionalHeader.SizeOfHeapReserve)
                    return;

                optionalHeader.SizeOfHeapReserve = value;
                OnPropertyChanged("SizeOfHeapReserve");
            }
        }

        public uint SizeOfHeapCommit
        {
            get { return (uint)optionalHeader.SizeOfHeapCommit; }
            set
            {
                if (value == optionalHeader.SizeOfHeapCommit)
                    return;

                optionalHeader.SizeOfHeapCommit = value;
                OnPropertyChanged("SizeOfHeapCommit");
            }
        }
    }
}