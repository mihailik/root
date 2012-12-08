using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Unmanaged
{
    using Mi.PE.Internal;

    public sealed class ResourceDirectory
    {
        static readonly DirectoryEntry[] EmptyDirectoryEntries = new DirectoryEntry[] { };
        static readonly DataEntry[] EmptyDataEntries = new DataEntry[] { };

        public sealed class DirectoryEntry
        {
            public string Name;
            public uint IntegerID;

            public ResourceDirectory Directory;
        }

        public sealed class DataEntry
        {
            public string Name;
            public uint IntegerID;
            public uint DataRVA;
            public uint Size;
            public uint Codepage;
            public uint Reserved;
        }

        /// <summary>
        /// Resource flags. This field is reserved for future use. It is currently set to zero.
        /// </summary>
        public uint Characteristics;

        /// <summary>
        ///  The time that the resource data was created by the resource compiler
        /// </summary>
        public DateTime Timestamp;

        /// <summary>
        /// The major version number, set by the user.
        /// </summary>
        public ushort MajorVersion;

        /// <summary>
        /// The minor version number, set by the user.
        /// </summary>
        public ushort MinorVersion;

        public DirectoryEntry[] Subdirectories;

        public DataEntry[] DataEntries;

        public void Read(BinaryStreamReader reader)
        {
            Read(reader, reader.Position);
        }

        void Read(BinaryStreamReader reader, long baseOffset)
        {
            this.Characteristics = reader.ReadUInt32();
            uint timestampNum = reader.ReadUInt32();
            this.Timestamp = PEFile.TimestampEpochUTC.AddSeconds(timestampNum);
            this.MajorVersion = reader.ReadUInt16();
            this.MinorVersion = reader.ReadUInt16();
            ushort nameEntryCount = reader.ReadUInt16();
            ushort idEntryCount = reader.ReadUInt16();

            List<DirectoryEntry> subdirectories = null;
            List<DataEntry> dataEntries = null;

            for (int i = 0; i < nameEntryCount + idEntryCount; i++)
            {
                uint idOrNameRva = reader.ReadUInt32();
                uint contentRva = reader.ReadUInt32();

                string name;
                uint id;

                const uint HighBit = 1U << 31;

                if ((idOrNameRva & HighBit)==0)
                {
                    id = idOrNameRva;
                    name = null;
                }
                else
                {
                    id = 0;
                    long savePosition = reader.Position;
                    uint namePositon = idOrNameRva & ~HighBit;
                    reader.Position = baseOffset + namePositon;
                    name = ReadName(reader);
                    reader.Position = savePosition;
                }

                if ((contentRva & HighBit) == 0) // high bit is set
                {
                    var dataEntry = new DataEntry
                    {
                        Name = name,
                        IntegerID = id
                    };

                    long savePosition = reader.Position;
                    reader.Position = baseOffset + contentRva;

                    ReadResourceDataEntry(reader, dataEntry);

                    if (dataEntries == null)
                        dataEntries = new List<DataEntry>();
                    dataEntries.Add(dataEntry);
                    reader.Position = savePosition;
                }
                else
                {
                    contentRva = contentRva & ~HighBit; // clear hight bit

                    long savePosition = reader.Position;
                    reader.Position = baseOffset + contentRva;

                    var directoryEntry = new DirectoryEntry
                    {
                        Name = name,
                        IntegerID = id
                    };

                    directoryEntry.Directory = new ResourceDirectory();
                    directoryEntry.Directory.Read(reader, baseOffset);

                    if (subdirectories == null)
                        subdirectories = new List<DirectoryEntry>();
                    subdirectories.Add(directoryEntry);
                    reader.Position = savePosition;
                }
            }

            this.Subdirectories = subdirectories == null ? EmptyDirectoryEntries : subdirectories.ToArray();
            this.DataEntries = dataEntries == null ? EmptyDataEntries : dataEntries.ToArray();
        }

        static void ReadResourceDataEntry(BinaryStreamReader reader, DataEntry dataEntry)
        {
            dataEntry.DataRVA = reader.ReadUInt32();
            dataEntry.Size = reader.ReadUInt32();
            dataEntry.Codepage = reader.ReadUInt32();
            dataEntry.Reserved = reader.ReadUInt32();
        }

        private string ReadName(BinaryStreamReader reader)
        {
            ushort length = reader.ReadUInt16();
            byte[] buf = new byte[length * 2]; // two-byte Unicode characters
            reader.ReadBytes(buf, 0, buf.Length);
            string result = Encoding.Unicode.GetString(buf, 0, buf.Length);
            return result;
        }
    }
}