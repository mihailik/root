using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using Mi.PE;
using Mi.PE.PEFormat;

namespace Zoom.PE.Model
{
    public sealed class OptionalHeaderModel : AddressablePart
    {
        readonly OptionalHeader optionalHeader;
        OptionalHeaderData m_Data;
        readonly ObservableCollection<DataDirectoryModel> coreDataDirectories = new ObservableCollection<DataDirectoryModel>();
        readonly ReadOnlyObservableCollection<DataDirectoryModel> m_DataDirectories;

        public OptionalHeaderModel(OptionalHeader optionalHeader, PEHeaderModel peHeader)
            : base("Optional header")
        {
            this.optionalHeader = optionalHeader;

            BindAddressToPEHeader(peHeader);

            this.Address = peHeader.Address + peHeader.Length;

            UpdateLength();

            UpdateDataFromPEMagic();

            this.m_DataDirectories = new ReadOnlyObservableCollection<DataDirectoryModel>(coreDataDirectories);
        
            UpdateDataDirectories();
        }

        public PEMagic PEMagic
        {
            get { return optionalHeader.PEMagic; }
            set
            {
                if (value == optionalHeader.PEMagic)
                    return;

                if (value != PEMagic.NT32
                    && value != PEMagic.NT64)
                    throw new ArgumentException("Invalid PEMagic value " + value + ".", "value");

                optionalHeader.PEMagic = value;
                OnPropertyChanged("PEMagic");

                UpdateDataFromPEMagic();
            }
        }

        public OptionalHeaderData Data
        {
            get { return m_Data; }
            private set
            {
                this.m_Data = value;
                OnPropertyChanged("Data");
            }
        }

        public ReadOnlyObservableCollection<DataDirectoryModel> DataDirectories
        {
            get { return m_DataDirectories; }
        }

        private void UpdateDataFromPEMagic()
        {
            if(this.Data!=null)
                this.Data.PropertyChanged -= Data_PropertyChanged;

            if (this.PEMagic == PEMagic.NT32)
                this.Data = new OptionalHeaderData32(this.optionalHeader);
            else
                this.Data = new OptionalHeaderData64(this.optionalHeader);

            this.Data.PropertyChanged += Data_PropertyChanged;
        }

        private void UpdateLength()
        {
            if (optionalHeader.PEMagic == PEMagic.NT32)
                this.Length = OptionalHeader.Size.NT32;
            else if (optionalHeader.PEMagic == PEMagic.NT64)
                this.Length = OptionalHeader.Size.NT64;
            else
                this.Length = 0;
        }

        private void BindAddressToPEHeader(PEHeaderModel peHeader)
        {
            peHeader.PropertyChanged += (sender, e) =>
            {
                if (e.PropertyName == "Address" || e.PropertyName == "Length")
                    this.Address = peHeader.Address + peHeader.Length;
            };
        }

        void Data_PropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (e.PropertyName == "NumberOfRvaAndSizes")
            {
                UpdateDataDirectories();
            }
        }

        void UpdateDataDirectories()
        {
            var ddList = this.optionalHeader.DataDirectories ?? new DataDirectory[] { };
            while (this.DataDirectories.Count > ddList.Length)
            {
                var removeDD = this.DataDirectories[this.DataDirectories.Count - 1];
                this.coreDataDirectories.Remove(removeDD);
            }

            while (this.DataDirectories.Count < ddList.Length)
            {
                var newDD = new DataDirectoryModel(this.optionalHeader, (DataDirectoryKind)this.DataDirectories.Count);
                this.coreDataDirectories.Add(newDD);
            }
        }
    }
}