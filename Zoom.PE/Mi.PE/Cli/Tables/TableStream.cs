using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    using Mi.PE.Internal;

    public sealed partial class TableStream
    {
        public Version Version;

        public Array[] Tables;

        public void Read(ClrModuleReader reader)
        {
            int tsReserved0 = reader.Binary.ReadInt32();
            byte tsMajorVersion = reader.Binary.ReadByte();
            byte tsMinorVersion = reader.Binary.ReadByte();

            this.Version = new Version(tsMajorVersion, tsMinorVersion);

            byte heapSizes = reader.Binary.ReadByte();
            byte reserved1 = reader.Binary.ReadByte();
            ulong valid = reader.Binary.ReadUInt64();
            ulong sorted = reader.Binary.ReadUInt64();

            ReadAndInitializeRowCounts(reader.Binary, valid);
            ReadTables(reader);
        }
    }
}