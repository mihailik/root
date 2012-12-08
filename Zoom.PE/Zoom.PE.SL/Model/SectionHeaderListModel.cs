using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using Mi.PE;
using Mi.PE.PEFormat;

namespace Zoom.PE.Model
{
    public sealed class SectionHeaderListModel : AddressablePart
    {
        readonly PEFile peFile;
        readonly ObservableCollection<SectionHeaderModel> itemsCore = new ObservableCollection<SectionHeaderModel>();
        readonly ReadOnlyObservableCollection<SectionHeaderModel> m_Items;

        public SectionHeaderListModel(PEFile peFile, PEHeaderModel peHeader, OptionalHeaderModel optionalHeader)
            : base("Section headers")
        {
            this.peFile = peFile;

            this.m_Items = new ReadOnlyObservableCollection<SectionHeaderModel>(itemsCore);

            BindAddressToOptionalHeader(optionalHeader);
            BindToPEHeader(peHeader);
        }

        public ReadOnlyObservableCollection<SectionHeaderModel> Items { get { return m_Items; } }

        private void BindAddressToOptionalHeader(OptionalHeaderModel optionalHeader)
        {
            this.Address = optionalHeader.Address + optionalHeader.Length;

            optionalHeader.PropertyChanged += (sender, e) =>
            {
                if (e.PropertyName == "Address"
                    || e.PropertyName == "Length")
                {
                    this.Address = optionalHeader.Address + optionalHeader.Length;
                }
            };
        }

        private void BindToPEHeader(PEHeaderModel peHeader)
        {
            UpdateFromPEFile();

            peHeader.PropertyChanged += (sender, e) =>
            {
                if (e.PropertyName == "NumberOfSections")
                {
                    int oldCount = peFile.SectionHeaders.Length;

                    Array.Resize(
                        ref peFile.SectionHeaders,
                        peHeader.NumberOfSections);

                    for (int i = oldCount; i < peFile.SectionHeaders.Length; i++)
                    {
                        peFile.SectionHeaders[i] = new SectionHeader();
                    }

                    UpdateFromPEFile();
                }
            };
        }

        void UpdateFromPEFile()
        {
            while (this.itemsCore.Count > this.peFile.SectionHeaders.Length)
            {
                var se = this.itemsCore[this.itemsCore.Count - 1];
                this.itemsCore.Remove(se);
            }

            while (this.itemsCore.Count < this.peFile.SectionHeaders.Length)
            {
                var se = new SectionHeaderModel(this.peFile.SectionHeaders[this.itemsCore.Count]);
                this.itemsCore.Add(se);
            }

            this.Length = (ulong)(this.Items.Count * SectionHeader.Size);
        }
    }
}