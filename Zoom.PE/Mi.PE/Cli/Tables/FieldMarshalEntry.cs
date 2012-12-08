using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    using Mi.PE.Cli.CodedIndices;

    /// <summary>
    /// The <see cref="TabeKind.FieldMarshal"/> table has two columns.
    /// It 'links' an existing row in the <see cref="TableKind.Field"/> or <see cref="TabeKind.Param"/> table,
    /// to information in the Blob heap that defines how that field or parameter
    /// (which, as usual, covers the method return, as parameter number 0)
    /// shall be marshalled when calling to or from unmanaged code via PInvoke dispatch.
    /// [ECMA-335 §22.17]
    /// </summary>
    /// <remarks>
    /// Note that <see cref="TableKind.FieldMarshal"/> information is used only by code paths that arbitrate operation with unmanaged code.
    /// In order to execute such paths, the caller, on most platforms, would be installed with elevated security permission. 
    /// Once it invokes unmanaged code, it lies outside the regime that the CLI can check—it is simply trusted not to violate the type system.
    /// A row in the FieldMarshal table is created if the .field directive for the parent field has specified a marshal attribute (§16.1).
    /// </remarks>
    public struct FieldMarshalEntry
    {
        /// <summary>
        /// An index into <see cref="TableKind.Field"/> or <see cref="TableKind.Param"/> table;
        /// more precisely, a <see cref="HasFieldMarshal"/> (ECMA-335 §24.2.6) coded index.
        /// </summary>
        public CodedIndex<HasFieldMarshal> Parent;

        /// <summary>
        /// An index into the Blob heap.
        /// For the detailed format of the 'blob', see ECMA-335 §23.4.
        /// </summary>
        public MarshalSpec NativeType;

        public void Read(ClrModuleReader reader)
        {
            this.Parent = reader.ReadCodedIndex<HasFieldMarshal>();
            this.NativeType = new MarshalSpec(reader.ReadBlob());
        }
    }
}