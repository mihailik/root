using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    /// <summary>
    /// There shall be no duplicate rows, based upon <see cref="Parent"/>
    /// (a given class has only one 'pointer' to the start of its event list). [ERROR]
    /// There shall be no duplicate rows, based upon <see cref="EventList"/>
    /// (different classes cannot share rows in the <see cref="TableKind.Event"/> table). [ERROR]
    /// [ECMA-335 §22.12]
    /// </summary>
    /// <remarks>
    /// Note that <see cref="TableKind.EventMap"/> info does not directly influence runtime behavior;
    /// what counts is the information stored for each method that the event comprises.
    /// The <see cref="TableKind.EventMap"/> and <see cref="TableKind.Event"/> tables result from putting the .event directive on a class (ECMA-335 §18).
    /// </remarks>
    public struct EventMapEntry
    {
        /// <summary>
        /// An index into the <see cref="TableKind.TypeDef"/> table.
        /// </summary>
        public uint Parent;

        /// <summary>
        /// An index into the <see cref="TableKind.Event"/> table.
        /// It marks the first of a contiguous run of Events owned by this Type.
        /// </summary>
        public uint EventList;

        public void Read(ClrModuleReader reader)
        {
            this.Parent = reader.ReadTableIndex(TableKind.TypeDef);
            this.EventList = reader.ReadTableIndex(TableKind.Event);
        }
    }
}