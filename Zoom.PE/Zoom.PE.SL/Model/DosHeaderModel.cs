using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using Mi.PE;
using Mi.PE.PEFormat;

namespace Zoom.PE.Model
{
    public sealed class DosHeaderModel : AddressablePart
    {
        readonly DosHeader dosHeader;

        public DosHeaderModel(DosHeader dosHeader)
            : base("DOS header")
        {
            this.dosHeader = dosHeader;
            this.Address = 0;
            this.Length = DosHeader.Size;
        }

        public MZSignature Signature { get { return MZSignature.MZ; } }

        public ushort cblp
        {
            get { return dosHeader.cblp; }
            set
            {
                if (value == dosHeader.cblp)
                    return;

                dosHeader.cblp = value;
                OnPropertyChanged("cblp");
            }
        }

        public ushort cp
        {
            get { return dosHeader.cp; }
            set
            {
                if (value == dosHeader.cp)
                    return;

                dosHeader.cp = value;
                OnPropertyChanged("cp");
            }
        }
        
        public ushort crlc
        {
            get { return dosHeader.crlc; }
            set
            {
                if (value == dosHeader.crlc)
                    return;

                dosHeader.crlc = value;
                OnPropertyChanged("crlc");
            }
        }
        
        public ushort cparhdr
        {
            get { return dosHeader.cparhdr; }
            set
            {
                if (value == dosHeader.cparhdr)
                    return;

                dosHeader.cparhdr = value;
                OnPropertyChanged("cparhdr");
            }
        }
        
        public ushort minalloc
        {
            get { return dosHeader.minalloc; }
            set
            {
                if (value == dosHeader.minalloc)
                    return;

                dosHeader.minalloc = value;
                OnPropertyChanged("minalloc");
            }
        }
        
        public ushort maxalloc
        {
            get { return dosHeader.maxalloc; }
            set
            {
                if (value == dosHeader.maxalloc)
                    return;

                dosHeader.maxalloc = value;
                OnPropertyChanged("maxalloc");
            }
        }
        
        public ushort ss
        {
            get { return dosHeader.ss; }
            set
            {
                if (value == dosHeader.ss)
                    return;

                dosHeader.ss = value;
                OnPropertyChanged("ss");
            }
        }
        
        public ushort sp
        {
            get { return dosHeader.sp; }
            set
            {
                if (value == dosHeader.sp)
                    return;

                dosHeader.sp = value;
                OnPropertyChanged("sp");
            }
        }
        
        public ushort csum
        {
            get { return dosHeader.csum; }
            set
            {
                if (value == dosHeader.csum)
                    return;

                dosHeader.csum = value;
                OnPropertyChanged("csum");
            }
        }
        
        public ushort ip
        {
            get { return dosHeader.ip; }
            set
            {
                if (value == dosHeader.ip)
                    return;

                dosHeader.ip = value;
                OnPropertyChanged("ip");
            }
        }
        
        public ushort cs
        {
            get { return dosHeader.cs; }
            set
            {
                if (value == dosHeader.cs)
                    return;

                dosHeader.cs = value;
                OnPropertyChanged("cs");
            }
        }
        
        public ushort lfarlc
        {
            get { return dosHeader.lfarlc; }
            set
            {
                if (value == dosHeader.lfarlc)
                    return;

                dosHeader.lfarlc = value;
                OnPropertyChanged("lfarlc");
            }
        }
        
        public ushort ovno
        {
            get { return dosHeader.ovno; }
            set
            {
                if (value == dosHeader.ovno)
                    return;

                dosHeader.ovno = value;
                OnPropertyChanged("ovno");
            }
        }
        
        public ulong res1
        {
            get { return dosHeader.res1; }
            set
            {
                if (value == dosHeader.res1)
                    return;

                dosHeader.res1 = value;
                OnPropertyChanged("res1");
            }
        }
        
        public ushort oemid
        {
            get { return dosHeader.oemid; }
            set
            {
                if (value == dosHeader.oemid)
                    return;

                dosHeader.oemid = value;
                OnPropertyChanged("oemid");
            }
        }
        
        public ushort oeminfo
        {
            get { return dosHeader.oeminfo; }
            set
            {
                if (value == dosHeader.oeminfo)
                    return;

                dosHeader.oeminfo = value;
                OnPropertyChanged("oeminfo");
            }
        }
        
        public uint ReservedNumber0
        {
            get { return dosHeader.ReservedNumber0; }
            set
            {
                if (value == dosHeader.ReservedNumber0)
                    return;

                dosHeader.ReservedNumber0 = value;
                OnPropertyChanged("ReservedNumber0");
            }
        }
        
        public uint ReservedNumber1
        {
            get { return dosHeader.ReservedNumber1; }
            set
            {
                if (value == dosHeader.ReservedNumber1)
                    return;

                dosHeader.ReservedNumber1 = value;
                OnPropertyChanged("ReservedNumber1");
            }
        }
        
        public uint ReservedNumber2
        {
            get { return dosHeader.ReservedNumber2; }
            set
            {
                if (value == dosHeader.ReservedNumber2)
                    return;

                dosHeader.ReservedNumber2 = value;
                OnPropertyChanged("ReservedNumber2");
            }
        }
        
        public uint ReservedNumber3
        {
            get { return dosHeader.ReservedNumber3; }
            set
            {
                if (value == dosHeader.ReservedNumber3)
                    return;

                dosHeader.ReservedNumber3 = value;
                OnPropertyChanged("ReservedNumber3");
            }
        }
        
        public uint ReservedNumber4
        {
            get { return dosHeader.ReservedNumber4; }
            set
            {
                if (value == dosHeader.ReservedNumber4)
                    return;

                dosHeader.ReservedNumber4 = value;
                OnPropertyChanged("ReservedNumber4");
            }
        }

        public uint lfanew
        {
            get { return this.dosHeader.lfanew; }
            set
            {
                if (value == this.lfanew)
                    return;

                this.dosHeader.lfanew = value;

                OnPropertyChanged("lfanew");
            }
        }
    }
}