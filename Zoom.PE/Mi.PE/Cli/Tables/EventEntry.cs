using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Cli.Tables
{
    using Mi.PE.Cli.CodedIndices;

    /// <summary>
    /// For each row, there shall be one add_ and one remove_ row in the <see cref="TableKind.MethodSemantics"/> table. [ERROR]
    /// For each row, there can be zero or one raise_ row, as well as zero or more other rows in the <see cref="TableKind.MethodSemantics"/> table. [ERROR]
    /// [ECMA-335 §22.13]
    /// </summary>
    /// <remarks>
    /// Events are treated within metadata much like Properties;
    /// that is, as a way to associate a collection of methods defined on a given class.
    /// There are two required methods (add_ and remove_) plus an optional one (raise_);
    /// additonal methods with other names are also permitted (ECMA-335 §18).
    /// All of the methods gathered together as an <see cref="TableKind.Event"/> shall be defined on the class (ECMA-335 §I.8.11.4)
    /// the association between a row in the <see cref="TableKind.TypeDef"/> table and the collection of methods
    /// that make up a given Event is held in three separate tables (exactly analogous to the approach used for Properties).
    /// 
    /// Event tables do a little more than group together existing rows from other tables.
    /// The <see cref="TableKind.Event"/> table has columns for <see cref="EventFlags"/>, <see cref="Name"/>, and <see cref="EventType"/>.
    /// In addition, the <see cref="TableKind.MethodSemantics"/> table has a column to record whether the method it indexes is an add_, a remove_, a raise_, or other function.
    /// </remarks>
    public struct EventEntry
    {
        /// <summary>
        /// A 2-byte bitmask of type EventAttributes, ECMA-335 §23.1.4.
        /// </summary>
        public EventAttributes EventFlags;

        /// <summary>
        /// Name shall index a non-empty string in the String heap. [ERROR]
        /// </summary>
        public string Name;

        /// <summary>
        /// An index into a <see cref="TableKind.TypeDef"/>, a <see cref="TableKind.TypeRef"/>, or <see cref="TableKind.TypeSpec"/> table;
        /// more precisely, a <see cref="TableKind.TypeDefOrRef"/> (ECMA-335 §24.2.6) coded index.
        /// This corresponds to the Type of the <see cref="EventEntry"/>; it is not the Type that owns this event.
        /// 
        /// <see cref="EventType"/> can be null or non-null.
        /// </summary>
        public CodedIndex<TypeDefOrRef> EventType;

        public void Read(ClrModuleReader reader)
        {
            this.EventFlags = (EventAttributes)reader.Binary.ReadUInt16();
            this.Name = reader.ReadString();
            this.EventType = reader.ReadCodedIndex<TypeDefOrRef>();
        }
    }
}