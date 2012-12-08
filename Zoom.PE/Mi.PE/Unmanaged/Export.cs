using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Mi.PE.Internal;

namespace Mi.PE.Unmanaged
{
    public sealed class Export
    {
        public sealed class Header
        {
            /// <summary>
            ///  Reserved, must be 0.
            /// </summary>
            public uint Flags;

            /// <summary>
            /// The time and date that the export data was created.
            /// </summary>
            public DateTime Timestamp;

            /// <summary>
            /// The major version number. The major and minor version numbers can be set by the user.
            /// </summary>
            public ushort MajorVersion;

            /// <summary>
            /// The minor version number.
            /// </summary>
            public ushort MinorVersion;

            /// <summary>
            /// The ASCII string that contains the name of the DLL. This address is relative to the image base.
            /// </summary>
            public string DllName;

            /// <summary>
            /// The starting ordinal number for exports in this image.
            /// This field specifies the starting ordinal number for the export address table.
            /// It is usually set to 1.
            /// </summary>
            public uint OrdinalBase;

            public Export[] Exports;

            public void ReadExports(BinaryStreamReader reader, uint rangeSize)
            {
                long initialAddress = reader.Position;

                this.Flags = reader.ReadUInt32();
                uint timestampNum = reader.ReadUInt32();
                this.Timestamp = PEFile.TimestampEpochUTC.AddSeconds(timestampNum);
                this.MajorVersion = reader.ReadUInt16();
                this.MinorVersion = reader.ReadUInt16();

                // need to read string from that RVA later
                uint nameRva = reader.ReadUInt32();
                
                this.OrdinalBase = reader.ReadUInt32();

                // The number of entries in the export address table.
                uint addressTableEntries = reader.ReadUInt32();

                // The number of entries in the name pointer table. This is also the number of entries in the ordinal table.
                uint numberOfNamePointers = reader.ReadUInt32();

                // The address of the export address table, relative to the image base.
                uint exportAddressTableRva = reader.ReadUInt32();

                // The address of the export name pointer table, relative to the image base.
                // The table size is given by the Number of Name Pointers field.
                uint namePointerRva = reader.ReadUInt32();

                // The address of the ordinal table, relative to the image base.
                uint ordinalTableRva = reader.ReadUInt32();

                if (nameRva == 0)
                {
                    this.DllName = null;
                }
                else
                {
                    reader.Position = nameRva;
                    this.DllName = ReadAsciiZ(reader);
                }


                if (addressTableEntries == 0)
                {
                    this.Exports = null;
                }
                else
                {
                    if (this.Exports == null
                        || this.Exports.Length != addressTableEntries)
                        this.Exports = new Export[addressTableEntries];

                    reader.Position = exportAddressTableRva;
                    for (int i = 0; i < addressTableEntries; i++)
                    {
                        if (this.Exports[i] == null)
                            this.Exports[i] = new Export();

                        uint exportOrForwarderRva = reader.ReadUInt32();

                        if (exportOrForwarderRva >= initialAddress
                            && exportOrForwarderRva < initialAddress + rangeSize)
                        {
                            this.Exports[i].ExportRva = 0;

                            uint forwarderRva = reader.ReadUInt32();
                            if (forwarderRva == 0)
                            {
                                this.Exports[i].Forwarder = null;
                            }
                            else
                            {
                                long savePosition = reader.Position;
                                reader.Position = forwarderRva;
                                this.Exports[i].Forwarder = ReadAsciiZ(reader);
                                reader.Position = savePosition;
                            }
                        }
                        else
                        {
                            this.Exports[i].ExportRva = reader.ReadUInt32();
                            this.Exports[i].Forwarder = null;
                        }

                        this.Exports[i].FunctionName = null;
                        this.Exports[i].FunctionOrdinal = (uint)(i + this.OrdinalBase);
                    }

                    if (numberOfNamePointers!=0
                        && namePointerRva !=0
                        && ordinalTableRva != 0)
                    {
                        for (int i = 0; i < numberOfNamePointers; i++)
                        {
                            reader.Position = ordinalTableRva + 2 * i;
                            uint ordinal = reader.ReadUInt16();

                            reader.Position = namePointerRva + 4 * i;
                            uint functionNameRva = reader.ReadUInt32();

                            string functionName;
                            if (functionNameRva == 0)
                            {
                                functionName = null;
                            }
                            else
                            {
                                reader.Position = functionNameRva;
                                functionName = ReadAsciiZ(reader);
                            }

                            this.Exports[ordinal].FunctionName = functionName;
                        }
                    }
                }
            }

            static string ReadAsciiZ(BinaryStreamReader reader)
            {
                var resultBuilder = new StringBuilder();
                for (int i = 0; i < 1000; i++)
                {
                    byte b = reader.ReadByte();
                    if (b == 0)
                        break;

                    char c = (char)b;
                    resultBuilder.Append(c);
                }
                return resultBuilder.ToString();
            }
        }

        public string FunctionName;
        public uint FunctionOrdinal;

        /// <summary>
        /// The address of the exported symbol when loaded into memory, relative to the image base.
        /// For example, the address of an exported function.
        /// </summary>
        public uint ExportRva;

        /// <summary>
        /// Null-terminated ASCII string in the export section.
        /// This string must be within the range that is given by the export table data directory entry.
        /// This string gives the DLL name and the name of the export (for example, "MYDLL.expfunc")
        /// or the DLL name and the ordinal number of the export (for example, "MYDLL.#27").
        /// </summary>
        public string Forwarder;

        public override string ToString()
        {
            return
                (this.FunctionOrdinal != 0 ? "[" + this.FunctionOrdinal + "]" : "") +
                this.FunctionName + " " +
                (this.ExportRva == 0 ? "" : this.ExportRva.ToString("X") + "h ") +
                Forwarder;
        }
    }
}