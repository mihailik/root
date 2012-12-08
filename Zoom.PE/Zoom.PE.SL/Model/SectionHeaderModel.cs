using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using Mi.PE;
using Mi.PE.PEFormat;

namespace Zoom.PE.Model
{
    public class SectionHeaderModel : INotifyPropertyChanged
    {
        readonly SectionHeader sectionHeader;

        public SectionHeaderModel(SectionHeader sectionHeader)
        {
            this.sectionHeader = sectionHeader;
        }

        public string Name
        {
            get { return sectionHeader.Name; }
            set
            {
                if (value == this.Name)
                    return;

                if (value != null
                    || value.Length > SectionHeader.MaximumNameSize)
                    throw new ArgumentOutOfRangeException("value");

                sectionHeader.Name = value;
                OnPropertyChanged("Name");
            }
        }

        public uint VirtualSize
        {
            get { return sectionHeader.VirtualSize; }
            set
            {
                if (value == this.VirtualSize)
                    return;

                sectionHeader.VirtualSize = value;
                OnPropertyChanged("VirtualSize");
            }
        }

        public uint VirtualAddress
        {
            get { return sectionHeader.VirtualAddress; }
            set
            {
                if (value == this.VirtualAddress)
                    return;

                sectionHeader.VirtualAddress = value;
                OnPropertyChanged("VirtualAddress");
            }
        }

        public uint SizeOfRawData
        {
            get { return sectionHeader.SizeOfRawData; }
            set
            {
                if (value == this.SizeOfRawData)
                    return;

                sectionHeader.SizeOfRawData = value;
                OnPropertyChanged("SizeOfRawData");
            }
        }

        public uint PointerToRawData
        {
            get { return sectionHeader.PointerToRawData; }
            set
            {
                if (value == this.PointerToRawData)
                    return;

                sectionHeader.PointerToRawData = value;
                OnPropertyChanged("PointerToRawData");
            }
        }

        public uint PointerToRelocations
        {
            get { return sectionHeader.PointerToRelocations; }
            set
            {
                if (value == this.PointerToRelocations)
                    return;

                sectionHeader.PointerToRelocations = value;
                OnPropertyChanged("PointerToRelocations");
            }
        }

        public uint PointerToLinenumbers
        {
            get { return sectionHeader.PointerToLinenumbers; }
            set
            {
                if (value == this.PointerToLinenumbers)
                    return;

                sectionHeader.PointerToLinenumbers = value;
                OnPropertyChanged("PointerToLinenumbers");
            }
        }

        public ushort NumberOfRelocations
        {
            get { return sectionHeader.NumberOfRelocations; }
            set
            {
                if (value == this.NumberOfRelocations)
                    return;

                sectionHeader.NumberOfRelocations = value;
                OnPropertyChanged("NumberOfRelocations");
            }
        }

        public ushort NumberOfLinenumbers
        {
            get { return sectionHeader.NumberOfLinenumbers; }
            set
            {
                if (value == this.NumberOfLinenumbers)
                    return;

                sectionHeader.NumberOfLinenumbers = value;
                OnPropertyChanged("NumberOfLinenumbers");
            }
        }

        public SectionCharacteristics Characteristics
        {
            get { return sectionHeader.Characteristics; }
            set
            {
                if (value == this.Characteristics)
                    return;

                sectionHeader.Characteristics = value;
                OnPropertyChanged("Characteristics");
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;

        void OnPropertyChanged(string propertyName)
        {
            var propertyChangedHandler = this.PropertyChanged;
            if (propertyChangedHandler != null)
                propertyChangedHandler(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
