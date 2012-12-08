using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using Mi.PE;
using Mi.PE.PEFormat;

namespace Zoom.PE.Model
{
    public sealed class PEHeaderModel : AddressablePart
    {
        readonly PEHeader peHeader;

        public PEHeaderModel(PEHeader peHeader, DosHeaderModel dosHeaderModel)
            : base("PE header")
        {
            this.peHeader = peHeader;

            this.Address = dosHeaderModel.lfanew;
            this.Length = PEHeader.Size;

            BindAddressToDosHeaderlfanew(dosHeaderModel);
        }

        public Machine Machine
        {
            get { return peHeader.Machine; }
            set
            {
                if (value == this.Machine)
                    return;

                peHeader.Machine = value;
                OnPropertyChanged("Machine");
            }
        }

        public ushort NumberOfSections
        {
            get { return peHeader.NumberOfSections; }
            set
            {
                if (value == this.NumberOfSections)
                    return;

                peHeader.NumberOfSections = value;
                OnPropertyChanged("NumberOfSections");
            }
        }
        
        public DateTime Timestamp
        {
            get { return peHeader.Timestamp; }
            set
            {
                if (value == this.Timestamp)
                    return;

                peHeader.Timestamp = value;
                OnPropertyChanged("Timestamp");
            }
        }
        
        public uint PointerToSymbolTable
        {
            get { return peHeader.PointerToSymbolTable; }
            set
            {
                if (value == this.PointerToSymbolTable)
                    return;

                peHeader.PointerToSymbolTable = value;
                OnPropertyChanged("PointerToSymbolTable");
            }
        }
        
        public uint NumberOfSymbols
        {
            get { return peHeader.NumberOfSymbols; }
            set
            {
                if (value == this.NumberOfSymbols)
                    return;

                peHeader.NumberOfSymbols = value;
                OnPropertyChanged("NumberOfSymbols");
            }
        }
        
        public ushort SizeOfOptionalHeader
        {
            get { return peHeader.SizeOfOptionalHeader; }
            set
            {
                if (value == this.SizeOfOptionalHeader)
                    return;

                peHeader.SizeOfOptionalHeader = value;
                OnPropertyChanged("SizeOfOptionalHeader");
            }
        }
        
        public ImageCharacteristics Characteristics
        {
            get { return peHeader.Characteristics; }
            set
            {
                if (value == this.Characteristics)
                    return;

                peHeader.Characteristics = value;
                OnPropertyChanged("Characteristics");
            }
        }

        private void BindAddressToDosHeaderlfanew(DosHeaderModel dosHeaderModel)
        {
            dosHeaderModel.PropertyChanged += (sender, e) =>
            {
                if (e.PropertyName == "lfanew")
                    this.Address = dosHeaderModel.lfanew;
            };
        }
    }
}