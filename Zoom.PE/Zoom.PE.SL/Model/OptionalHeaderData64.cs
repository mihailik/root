using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using Mi.PE;
using Mi.PE.PEFormat;

namespace Zoom.PE.Model
{
    public sealed class OptionalHeaderData64 : OptionalHeaderData
    {
        public OptionalHeaderData64(OptionalHeader optionalHeader)
            : base(optionalHeader)
        {
        }

        public ulong ImageBase
        {
            get { return optionalHeader.ImageBase; }
            set
            {
                if (value == optionalHeader.ImageBase)
                    return;

                optionalHeader.ImageBase = value;
                OnPropertyChanged("ImageBase");
            }
        }

        public ulong SizeOfStackReserve
        {
            get { return optionalHeader.SizeOfStackReserve; }
            set
            {
                if (value == optionalHeader.SizeOfStackReserve)
                    return;

                optionalHeader.SizeOfStackReserve = value;
                OnPropertyChanged("SizeOfStackReserve");
            }
        }

        public ulong SizeOfStackCommit
        {
            get { return optionalHeader.SizeOfStackCommit; }
            set
            {
                if (value == optionalHeader.SizeOfStackCommit)
                    return;

                optionalHeader.SizeOfStackCommit = value;
                OnPropertyChanged("SizeOfStackCommit");
            }
        }

        public ulong SizeOfHeapReserve
        {
            get { return optionalHeader.SizeOfHeapReserve; }
            set
            {
                if (value == optionalHeader.SizeOfHeapReserve)
                    return;

                optionalHeader.SizeOfHeapReserve = value;
                OnPropertyChanged("SizeOfHeapReserve");
            }
        }

        public ulong SizeOfHeapCommit
        {
            get { return optionalHeader.SizeOfHeapCommit; }
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