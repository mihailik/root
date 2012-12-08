using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    /// <summary>
    /// Conceptually, each row in the <see cref="TableKind.FieldRVA"/> table is an extension to exactly one row in the <see cref="TableKind.Field"/> table,
    /// and records the RVA (Relative Virtual Address) within the image file at which this field‘s initial value is stored.
    /// A row in the <see cref="TableKind.FieldRVA"/> table is created for each static parent field that has specified the optional data label (ECMA-335 §16).
    /// The <see cref="RVA"/> column is the relative virtual address of the data in the PE file (ECMA-335 §16.3).
    /// [ECMA-335 §22.18]
    /// </summary>
    public struct FieldRVAEntry
    {
        /// <summary>
        /// A 4-byte constant.
        /// </summary>
        public uint RVA;

        /// <summary>
        /// An index into <see cref="TableKind.Field"/> table.
        /// </summary>
        public uint Field;

        public void Read(ClrModuleReader reader)
        {
            this.RVA = reader.Binary.ReadUInt32();
            this.Field = reader.ReadTableIndex(TableKind.Field);
        }
    }
}