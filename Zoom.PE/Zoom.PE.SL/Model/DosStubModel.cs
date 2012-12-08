using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using Mi.PE;
using Mi.PE.PEFormat;

namespace Zoom.PE.Model
{
    public sealed class DosStubModel : AddressablePart
    {
        byte[] m_Data;

        public DosStubModel()
            : base("DOS stub")
        {
            this.Address = DosHeader.Size;
            this.Length = 0;
        }

        public byte[] Data
        {
            get { return m_Data; }
            internal set
            {
                if (value == this.Data)
                    return;

                this.m_Data = value;
                OnPropertyChanged("Data");

                if (this.Data == null)
                    this.Length = 0;
                else
                    this.Length = (ulong)this.Data.Length;
            }
        }
    }
}
