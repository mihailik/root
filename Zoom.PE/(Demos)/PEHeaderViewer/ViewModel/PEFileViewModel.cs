using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using Mi.PE;
using Mi.PE.PEFormat;

namespace PEHeaderViewer.ViewModel
{
    public sealed class PEFileViewModel : INotifyPropertyChanged
    {
        readonly PEFile m_PEFile;

        public PEFileViewModel(PEFile peFile)
        {
            this.m_PEFile = peFile;
        }

        public ushort cblp
        {
            get { return m_PEFile.DosHeader.cblp; }
            set
            {
                if (value == m_PEFile.DosHeader.cblp)
                    return;

                m_PEFile.DosHeader.cblp = value;
                OnPropertyChanged("cblp");
            }
        }
        public ushort cp
        {
            get { return m_PEFile.DosHeader.cp; }
            set
            {
                if (value == m_PEFile.DosHeader.cp)
                    return;

                m_PEFile.DosHeader.cp = value;
                OnPropertyChanged("cp");
            }
        }
        public ushort crlc
        {
            get { return m_PEFile.DosHeader.crlc; }
            set
            {
                if (value == m_PEFile.DosHeader.crlc)
                    return;

                m_PEFile.DosHeader.crlc = value;
                OnPropertyChanged("crlc");
            }
        }
        public ushort cparhdr
        {
            get { return m_PEFile.DosHeader.cparhdr; }
            set
            {
                if (value == m_PEFile.DosHeader.cparhdr)
                    return;

                m_PEFile.DosHeader.cparhdr = value;
                OnPropertyChanged("cparhdr");
            }
        }
        public ushort minalloc
        {
            get { return m_PEFile.DosHeader.minalloc; }
            set
            {
                if (value == m_PEFile.DosHeader.minalloc)
                    return;

                m_PEFile.DosHeader.minalloc = value;
                OnPropertyChanged("minalloc");
            }
        }
        public ushort maxalloc
        {
            get { return m_PEFile.DosHeader.maxalloc; }
            set
            {
                if (value == m_PEFile.DosHeader.maxalloc)
                    return;

                m_PEFile.DosHeader.maxalloc = value;
                OnPropertyChanged("maxalloc");
            }
        }
        public ushort ss
        {
            get { return m_PEFile.DosHeader.ss; }
            set
            {
                if (value == m_PEFile.DosHeader.ss)
                    return;

                m_PEFile.DosHeader.ss = value;
                OnPropertyChanged("ss");
            }
        }
        public ushort sp
        {
            get { return m_PEFile.DosHeader.sp; }
            set
            {
                if (value == m_PEFile.DosHeader.sp)
                    return;

                m_PEFile.DosHeader.sp = value;
                OnPropertyChanged("sp");
            }
        }
        public ushort csum
        {
            get { return m_PEFile.DosHeader.csum; }
            set
            {
                if (value == m_PEFile.DosHeader.csum)
                    return;

                m_PEFile.DosHeader.csum = value;
                OnPropertyChanged("csum");
            }
        }
        public ushort ip
        {
            get { return m_PEFile.DosHeader.ip; }
            set
            {
                if (value == m_PEFile.DosHeader.ip)
                    return;

                m_PEFile.DosHeader.ip = value;
                OnPropertyChanged("ip");
            }
        }
        public ushort cs
        {
            get { return m_PEFile.DosHeader.cs; }
            set
            {
                if (value == m_PEFile.DosHeader.cs)
                    return;

                m_PEFile.DosHeader.cs = value;
                OnPropertyChanged("cs");
            }
        }
        public ushort lfarlc
        {
            get { return m_PEFile.DosHeader.lfarlc; }
            set
            {
                if (value == m_PEFile.DosHeader.lfarlc)
                    return;

                m_PEFile.DosHeader.lfarlc = value;
                OnPropertyChanged("lfarlc");
            }
        }
        public ushort ovno
        {
            get { return m_PEFile.DosHeader.ovno; }
            set
            {
                if (value == m_PEFile.DosHeader.ovno)
                    return;

                m_PEFile.DosHeader.ovno = value;
                OnPropertyChanged("ovno");
            }
        }
        public ulong res1
        {
            get { return m_PEFile.DosHeader.res1; }
            set
            {
                if (value == m_PEFile.DosHeader.res1)
                    return;

                m_PEFile.DosHeader.res1 = value;
                OnPropertyChanged("res1");
            }
        }
        public ushort oemid
        {
            get { return m_PEFile.DosHeader.oemid; }
            set
            {
                if (value == m_PEFile.DosHeader.oemid)
                    return;

                m_PEFile.DosHeader.oemid = value;
                OnPropertyChanged("oemid");
            }
        }
        public ushort oeminfo
        {
            get { return m_PEFile.DosHeader.oeminfo; }
            set
            {
                if (value == m_PEFile.DosHeader.oeminfo)
                    return;

                m_PEFile.DosHeader.oeminfo = value;
                OnPropertyChanged("oeminfo");
            }
        }
        public uint ReservedNumber0
        {
            get { return m_PEFile.DosHeader.ReservedNumber0; }
            set
            {
                if (value == m_PEFile.DosHeader.ReservedNumber0)
                    return;

                m_PEFile.DosHeader.ReservedNumber0 = value;
                OnPropertyChanged("ReservedNumber0");
            }
        }
        public uint ReservedNumber1
        {
            get { return m_PEFile.DosHeader.ReservedNumber1; }
            set
            {
                if (value == m_PEFile.DosHeader.ReservedNumber1)
                    return;

                m_PEFile.DosHeader.ReservedNumber1 = value;
                OnPropertyChanged("ReservedNumber1");
            }
        }
        public uint ReservedNumber2
        {
            get { return m_PEFile.DosHeader.ReservedNumber2; }
            set
            {
                if (value == m_PEFile.DosHeader.ReservedNumber2)
                    return;

                m_PEFile.DosHeader.ReservedNumber2 = value;
                OnPropertyChanged("ReservedNumber2");
            }
        }
        public uint ReservedNumber3
        {
            get { return m_PEFile.DosHeader.ReservedNumber3; }
            set
            {
                if (value == m_PEFile.DosHeader.ReservedNumber3)
                    return;

                m_PEFile.DosHeader.ReservedNumber3 = value;
                OnPropertyChanged("ReservedNumber3");
            }
        }
        public uint ReservedNumber4
        {
            get { return m_PEFile.DosHeader.ReservedNumber4; }
            set
            {
                if (value == m_PEFile.DosHeader.ReservedNumber4)
                    return;

                m_PEFile.DosHeader.ReservedNumber4 = value;
                OnPropertyChanged("ReservedNumber4");
            }
        }

        public uint lfanew
        {
            get { return m_PEFile.DosHeader.lfanew; }
            set
            {
                if (value == m_PEFile.DosHeader.lfanew)
                    return;

                m_PEFile.DosHeader.lfanew = value;

                int dosStubSize = (int)(value - DosHeader.Size);
                if (dosStubSize > 0)
                {
                    if(m_PEFile.DosStub!=null)
                    {
                        Array.Resize(ref m_PEFile.DosStub, dosStubSize);
                    }
                    else
                    {
                        m_PEFile.DosStub = new byte[dosStubSize];
                    }
                }
                else
                {
                    m_PEFile.DosStub = null;
                }

                OnPropertyChanged("lfanew");
                OnPropertyChanged("IsDosStubPresent");
                OnPropertyChanged("OptionalHeaderOffset");
                OnPropertyChanged("DosStub");
            }
        }

        public bool IsDosStubPresent
        {
            get
            {
                return m_PEFile.DosHeader.lfanew > DosHeader.Size;
            }
        }

        public uint OptionalHeaderOffset
        {
            get
            {
                return m_PEFile.DosHeader.lfanew + PEHeader.Size;
            }
        }

        public byte[] DosStub
        {
            get { return m_PEFile.DosStub; }
        }

        public Machine Machine
        {
            get { return m_PEFile.PEHeader.Machine; }
            set
            {
                if (value == m_PEFile.PEHeader.Machine)
                    return;

                m_PEFile.PEHeader.Machine = value;
                OnPropertyChanged("Machine");
            }
        }
        public ushort NumberOfSections
        {
            get { return m_PEFile.PEHeader.NumberOfSections; }
            set
            {
                if (value == m_PEFile.PEHeader.NumberOfSections)
                    return;

                m_PEFile.PEHeader.NumberOfSections = value;
                OnPropertyChanged("NumberOfSections");
            }
        }
        public DateTime Timestamp
        {
            get { return m_PEFile.PEHeader.Timestamp; }
            set
            {
                if (value == m_PEFile.PEHeader.Timestamp)
                    return;

                m_PEFile.PEHeader.Timestamp = value;
                OnPropertyChanged("Timestamp");
            }
        }
        public uint PointerToSymbolTable
        {
            get { return m_PEFile.PEHeader.PointerToSymbolTable; }
            set
            {
                if (value == m_PEFile.PEHeader.PointerToSymbolTable)
                    return;

                m_PEFile.PEHeader.PointerToSymbolTable = value;
                OnPropertyChanged("PointerToSymbolTable");
            }
        }
        public uint NumberOfSymbols
        {
            get { return m_PEFile.PEHeader.NumberOfSymbols; }
            set
            {
                if (value == m_PEFile.PEHeader.NumberOfSymbols)
                    return;

                m_PEFile.PEHeader.NumberOfSymbols = value;
                OnPropertyChanged("NumberOfSymbols");
            }
        }
        public ushort SizeOfOptionalHeader
        {
            get { return m_PEFile.PEHeader.SizeOfOptionalHeader; }
            set
            {
                if (value == m_PEFile.PEHeader.SizeOfOptionalHeader)
                    return;

                m_PEFile.PEHeader.SizeOfOptionalHeader = value;
                OnPropertyChanged("SizeOfOptionalHeader");
            }
        }
        public ImageCharacteristics Characteristics
        {
            get { return m_PEFile.PEHeader.Characteristics; }
            set
            {
                if (value == m_PEFile.PEHeader.Characteristics)
                    return;

                m_PEFile.PEHeader.Characteristics = value;
                OnPropertyChanged("Characteristics");
            }
        }

        public PEMagic PEMagic
        {
            get { return m_PEFile.OptionalHeader.PEMagic; }
            set
            {
                if (value == m_PEFile.OptionalHeader.PEMagic)
                    return;

                if (value != Mi.PE.PEFormat.PEMagic.NT32
                    && value != Mi.PE.PEFormat.PEMagic.NT64)
                    throw new ArgumentException("Invalid PEMagic value " + value + ".", "value");

                m_PEFile.OptionalHeader.PEMagic = value;
                OnPropertyChanged("PEMagic");
            }
        }
        public byte MajorLinkerVersion
        {
            get { return m_PEFile.OptionalHeader.MajorLinkerVersion; }
            set
            {
                if (value == m_PEFile.OptionalHeader.MajorLinkerVersion)
                    return;

                m_PEFile.OptionalHeader.MajorLinkerVersion = value;
                OnPropertyChanged("MajorLinkerVersion");
            }
        }
        public byte MinorLinkerVersion
        {
            get { return m_PEFile.OptionalHeader.MinorLinkerVersion; }
            set
            {
                if (value == m_PEFile.OptionalHeader.MinorLinkerVersion)
                    return;

                m_PEFile.OptionalHeader.MinorLinkerVersion = value;
                OnPropertyChanged("MinorLinkerVersion");
            }
        }
        public uint SizeOfCode
        {
            get { return m_PEFile.OptionalHeader.SizeOfCode; }
            set
            {
                if (value == m_PEFile.OptionalHeader.SizeOfCode)
                    return;

                m_PEFile.OptionalHeader.SizeOfCode = value;
                OnPropertyChanged("SizeOfCode");
            }
        }
        public uint SizeOfInitializedData
        {
            get { return m_PEFile.OptionalHeader.SizeOfInitializedData; }
            set
            {
                if (value == m_PEFile.OptionalHeader.SizeOfInitializedData)
                    return;

                m_PEFile.OptionalHeader.SizeOfInitializedData = value;
                OnPropertyChanged("SizeOfInitializedData");
            }
        }
        public uint SizeOfUninitializedData
        {
            get { return m_PEFile.OptionalHeader.SizeOfUninitializedData; }
            set
            {
                if (value == m_PEFile.OptionalHeader.SizeOfUninitializedData)
                    return;

                m_PEFile.OptionalHeader.SizeOfUninitializedData = value;
                OnPropertyChanged("SizeOfUninitializedData");
            }
        }
        public uint AddressOfEntryPoint
        {
            get { return m_PEFile.OptionalHeader.AddressOfEntryPoint; }
            set
            {
                if (value == m_PEFile.OptionalHeader.AddressOfEntryPoint)
                    return;

                m_PEFile.OptionalHeader.AddressOfEntryPoint = value;
                OnPropertyChanged("AddressOfEntryPoint");
            }
        }
        public uint BaseOfCode
        {
            get { return m_PEFile.OptionalHeader.BaseOfCode; }
            set
            {
                if (value == m_PEFile.OptionalHeader.BaseOfCode)
                    return;

                m_PEFile.OptionalHeader.BaseOfCode = value;
                OnPropertyChanged("BaseOfCode");
            }
        }
        public uint BaseOfData
        {
            get { return m_PEFile.OptionalHeader.BaseOfData; }
            set
            {
                if (value == m_PEFile.OptionalHeader.BaseOfData)
                    return;

                m_PEFile.OptionalHeader.BaseOfData = value;
                OnPropertyChanged("BaseOfData");
            }
        }
        public ulong ImageBase
        {
            get { return m_PEFile.OptionalHeader.ImageBase; }
            set
            {
                if (value == m_PEFile.OptionalHeader.ImageBase)
                    return;

                m_PEFile.OptionalHeader.ImageBase = value;
                OnPropertyChanged("ImageBase");
            }
        }
        public uint SectionAlignment
        {
            get { return m_PEFile.OptionalHeader.SectionAlignment; }
            set
            {
                if (value == m_PEFile.OptionalHeader.SectionAlignment)
                    return;

                m_PEFile.OptionalHeader.SectionAlignment = value;
                OnPropertyChanged("SectionAlignment");
            }
        }
        public uint FileAlignment
        {
            get { return m_PEFile.OptionalHeader.FileAlignment; }
            set
            {
                if (value == m_PEFile.OptionalHeader.FileAlignment)
                    return;

                m_PEFile.OptionalHeader.FileAlignment = value;
                OnPropertyChanged("FileAlignment");
            }
        }
        public ushort MajorOperatingSystemVersion
        {
            get { return m_PEFile.OptionalHeader.MajorOperatingSystemVersion; }
            set
            {
                if (value == m_PEFile.OptionalHeader.MajorOperatingSystemVersion)
                    return;

                m_PEFile.OptionalHeader.MajorOperatingSystemVersion = value;
                OnPropertyChanged("MajorOperatingSystemVersion");
            }
        }
        public ushort MinorOperatingSystemVersion
        {
            get { return m_PEFile.OptionalHeader.MinorOperatingSystemVersion; }
            set
            {
                if (value == m_PEFile.OptionalHeader.MinorOperatingSystemVersion)
                    return;

                m_PEFile.OptionalHeader.MinorOperatingSystemVersion = value;
                OnPropertyChanged("MinorOperatingSystemVersion");
            }
        }
        public ushort MajorImageVersion
        {
            get { return m_PEFile.OptionalHeader.MajorImageVersion; }
            set
            {
                if (value == m_PEFile.OptionalHeader.MajorImageVersion)
                    return;

                m_PEFile.OptionalHeader.MajorImageVersion = value;
                OnPropertyChanged("MajorImageVersion");
            }
        }
        public ushort MinorImageVersion
        {
            get { return m_PEFile.OptionalHeader.MinorImageVersion; }
            set
            {
                if (value == m_PEFile.OptionalHeader.MinorImageVersion)
                    return;

                m_PEFile.OptionalHeader.MinorImageVersion = value;
                OnPropertyChanged("MinorImageVersion");
            }
        }
        public ushort MajorSubsystemVersion
        {
            get { return m_PEFile.OptionalHeader.MajorSubsystemVersion; }
            set
            {
                if (value == m_PEFile.OptionalHeader.MajorSubsystemVersion)
                    return;

                m_PEFile.OptionalHeader.MajorSubsystemVersion = value;
                OnPropertyChanged("MajorSubsystemVersion");
            }
        }
        public ushort MinorSubsystemVersion
        {
            get { return m_PEFile.OptionalHeader.MinorSubsystemVersion; }
            set
            {
                if (value == m_PEFile.OptionalHeader.MinorSubsystemVersion)
                    return;

                m_PEFile.OptionalHeader.MinorSubsystemVersion = value;
                OnPropertyChanged("MinorSubsystemVersion");
            }
        }
        public uint Win32VersionValue
        {
            get { return m_PEFile.OptionalHeader.Win32VersionValue; }
            set
            {
                if (value == m_PEFile.OptionalHeader.Win32VersionValue)
                    return;

                m_PEFile.OptionalHeader.Win32VersionValue = value;
                OnPropertyChanged("Win32VersionValue");
            }
        }
        public uint SizeOfImage
        {
            get { return m_PEFile.OptionalHeader.SizeOfImage; }
            set
            {
                if (value == m_PEFile.OptionalHeader.SizeOfImage)
                    return;

                m_PEFile.OptionalHeader.SizeOfImage = value;
                OnPropertyChanged("SizeOfImage");
            }
        }
        public uint SizeOfHeaders
        {
            get { return m_PEFile.OptionalHeader.SizeOfHeaders; }
            set
            {
                if (value == m_PEFile.OptionalHeader.SizeOfHeaders)
                    return;

                m_PEFile.OptionalHeader.SizeOfHeaders = value;
                OnPropertyChanged("SizeOfHeaders");
            }
        }
        public uint CheckSum
        {
            get { return m_PEFile.OptionalHeader.CheckSum; }
            set
            {
                if (value == m_PEFile.OptionalHeader.CheckSum)
                    return;

                m_PEFile.OptionalHeader.CheckSum = value;
                OnPropertyChanged("CheckSum");
            }
        }
        public Subsystem Subsystem
        {
            get { return m_PEFile.OptionalHeader.Subsystem; }
            set
            {
                if (value == m_PEFile.OptionalHeader.Subsystem)
                    return;

                m_PEFile.OptionalHeader.Subsystem = value;
                OnPropertyChanged("Subsystem");
            }
        }
        public DllCharacteristics DllCharacteristics
        {
            get { return m_PEFile.OptionalHeader.DllCharacteristics; }
            set
            {
                if (value == m_PEFile.OptionalHeader.DllCharacteristics)
                    return;

                m_PEFile.OptionalHeader.DllCharacteristics = value;
                OnPropertyChanged("DllCharacteristics");
            }
        }
        public ulong SizeOfStackReserve
        {
            get { return m_PEFile.OptionalHeader.SizeOfStackReserve; }
            set
            {
                if (value == m_PEFile.OptionalHeader.SizeOfStackReserve)
                    return;

                m_PEFile.OptionalHeader.SizeOfStackReserve = value;
                OnPropertyChanged("SizeOfStackReserve");
            }
        }
        public ulong SizeOfStackCommit
        {
            get { return m_PEFile.OptionalHeader.SizeOfStackCommit; }
            set
            {
                if (value == m_PEFile.OptionalHeader.SizeOfStackCommit)
                    return;

                m_PEFile.OptionalHeader.SizeOfStackCommit = value;
                OnPropertyChanged("SizeOfStackCommit");
            }
        }
        public ulong SizeOfHeapReserve
        {
            get { return m_PEFile.OptionalHeader.SizeOfHeapReserve; }
            set
            {
                if (value == m_PEFile.OptionalHeader.SizeOfHeapReserve)
                    return;

                m_PEFile.OptionalHeader.SizeOfHeapReserve = value;
                OnPropertyChanged("SizeOfHeapReserve");
            }
        }
        public ulong SizeOfHeapCommit
        {
            get { return m_PEFile.OptionalHeader.SizeOfHeapCommit; }
            set
            {
                if (value == m_PEFile.OptionalHeader.SizeOfHeapCommit)
                    return;

                m_PEFile.OptionalHeader.SizeOfHeapCommit = value;
                OnPropertyChanged("SizeOfHeapCommit");
            }
        }
        public uint LoaderFlags
        {
            get { return m_PEFile.OptionalHeader.LoaderFlags; }
            set
            {
                if (value == m_PEFile.OptionalHeader.LoaderFlags)
                    return;

                m_PEFile.OptionalHeader.LoaderFlags = value;
                OnPropertyChanged("LoaderFlags");
            }
        }

        public uint NumberOfRvaAndSizes
        {
            get { return m_PEFile.OptionalHeader.NumberOfRvaAndSizes; }
            set
            {
                if (value == m_PEFile.OptionalHeader.NumberOfRvaAndSizes)
                    return;

                m_PEFile.OptionalHeader.NumberOfRvaAndSizes = value;
                OnPropertyChanged("NumberOfRvaAndSizes");
            }
        }



        public event PropertyChangedEventHandler PropertyChanged;

        private void OnPropertyChanged(string propertyName)
        {
            var temp = this.PropertyChanged;
            if (temp != null)
                temp(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
