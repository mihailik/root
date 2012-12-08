using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Linq;
using Mi.PE;
using Mi.PE.PEFormat;

namespace Zoom.PE.Model
{
    public sealed class PEFileModel : ReadOnlyObservableCollection<object>
    {
        readonly string m_FileName;
        readonly PEFile peFile;
        readonly DosHeaderModel m_DosHeader;
        DosStubModel m_DosStub;
        readonly PEHeaderModel m_PEHeader;
        readonly OptionalHeaderModel m_OptionalHeader;
        readonly SectionHeaderListModel m_SectionHeaders;

        readonly ObservableCollection<object> partsCore = new ObservableCollection<object>();

        public PEFileModel(string fileName, PEFile peFile)
            : base(new ObservableCollection<object>())
        {
            this.m_FileName = fileName;
            this.peFile = peFile;

            this.m_DosHeader = new DosHeaderModel(peFile.DosHeader);
            this.Items.Add(this.DosHeader);

            UpdateDosStubFromlfanew();
            
            this.m_PEHeader = new PEHeaderModel(peFile.PEHeader, m_DosHeader);
            this.Items.Add(this.PEHeader);

            this.m_OptionalHeader = new OptionalHeaderModel(peFile.OptionalHeader, m_PEHeader);
            this.Items.Add(this.OptionalHeader);

            this.m_SectionHeaders = new SectionHeaderListModel(peFile, this.PEHeader, this.OptionalHeader);
            this.Items.Add(this.SectionHeaders);

            UpdateSectionContentParts();
            
            this.DosHeader.PropertyChanged += DosHeader_PropertyChanged;
            ((INotifyCollectionChanged)this.SectionHeaders.Items).CollectionChanged += SectionHeaders_Items_CollectionChanged;
        }

        public string FileName { get { return m_FileName; } }

        public DosHeaderModel DosHeader { get { return m_DosHeader; } }

        public DosStubModel DosStub
        {
            get { return m_DosStub; }
            private set
            {
                if (value == this.DosStub)
                    return;

                if (this.DosStub != null)
                    this.Items.RemoveAt(1);

                this.m_DosStub = value;

                if (this.DosStub != null)
                    this.Items.Insert(1, this.DosStub);

                OnPropertyChanged(new PropertyChangedEventArgs("DosStub"));
            }
        }

        public PEHeaderModel PEHeader { get { return m_PEHeader; } }

        public OptionalHeaderModel OptionalHeader { get { return m_OptionalHeader; } }

        public SectionHeaderListModel SectionHeaders { get { return m_SectionHeaders; } }

        void DosHeader_PropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (e.PropertyName == "lfanew")
                UpdateDosStubFromlfanew();
        }

        void SectionHeaders_Items_CollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            if (e.OldItems != null)
            {
                foreach (SectionHeaderModel s in e.OldItems)
                {
                    s.PropertyChanged -= SectionHeaderModel_PropertyChanged;
                }
            }

            if (e.NewItems != null)
            {
                foreach (SectionHeaderModel s in e.NewItems)
                {
                    s.PropertyChanged += SectionHeaderModel_PropertyChanged;
                }
            }

            UpdateSectionContentParts();
        }

        void SectionHeaderModel_PropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            UpdateSectionContentParts();
        }

        private void UpdateDosStubFromlfanew()
        {
            long newDosStubSize = (long)this.peFile.DosHeader.lfanew - Mi.PE.PEFormat.DosHeader.Size;

            // adjust peFile.DosStub
            if (newDosStubSize > 0)
            {
                if (this.peFile.DosStub == null)
                {
                    this.peFile.DosStub = new byte[newDosStubSize];
                }
                else
                {
                    Array.Resize(ref this.peFile.DosStub, (int)newDosStubSize);
                }
            }
            else
            {
                if (this.peFile.DosStub != null)
                {
                    this.peFile.DosStub = null;
                }
            }

            // adjust this.DosStub
            if (this.peFile.DosStub == null)
            {
                this.DosStub = null;
            }
            else
            {
                if (this.DosStub == null)
                    this.DosStub = new DosStubModel { Data = this.peFile.DosStub };
                else
                    this.DosStub.Data = this.peFile.DosStub;
            }
        }

        void UpdateSectionContentParts()
        {
            var sectionMap =
                (from s in peFile.SectionHeaders
                where s.SizeOfRawData>0
                orderby s.PointerToRawData
                select new
                {
                    Address = (ulong)s.PointerToRawData,
                    Length = (ulong)s.SizeOfRawData,
                    SectionHeader = s
                }).ToList();

            ulong top = this.SectionHeaders.Address + this.SectionHeaders.Length;

            for (int i = 0; i < sectionMap.Count; i++)
            {
                if (sectionMap[i].Address > top)
                {
                    var padding = new
                        {
                            Address = top,
                            Length = sectionMap[i].Address - top,
                            SectionHeader = (SectionHeader)null
                        };

                    sectionMap.Insert(
                        0,
                        padding);
                }
                else if (sectionMap[i].Address < top)
                {
                    RemoveAllSectionContentParts();
                    return;
                }

                top = sectionMap[i].Address + sectionMap[i].Length;
            }

            RemoveAllSectionContentParts();
            foreach (var p in sectionMap)
            {
                if (p.SectionHeader == null)
                {
                    this.Items.Add(new SectionPaddingModel(p.Address, p.Length));
                }
                else
                {
                    this.Items.Add(new SectionContentModel(p.SectionHeader));
                }
            }
        }

        private void RemoveAllSectionContentParts()
        {
            var existingSectionContentParts =
                (from p in this
                 where p is SectionContentModel
                 || p is SectionPaddingModel
                 select p).ToArray();

            foreach (var p in existingSectionContentParts)
            {
                this.Items.Remove(p);
            }
        }
    }
}