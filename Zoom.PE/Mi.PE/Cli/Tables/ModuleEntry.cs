using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Cli.Tables
{
    /// <summary>
    /// [ECMA-335 §22.30]
    /// </summary>
    /// <remarks>
    /// The <see cref="Generation"/>, <see cref="EncId"/>, and <see cref="EncBaseId"/> columns can be written as zero,
    /// and can be ignored by conforming implementations of the CLI.
    /// The rows in the <see cref="TableKind.Module"/> table result from .module directives in the Assembly (ECMA-335 §6.4).
    /// </remarks>
    public struct ModuleEntry
    {
        public ushort Generation;

        public string Name;

        /// <summary>
        /// The <see cref="Mvid"/> column shall index a unique GUID in the GUID heap (ECMA-335 §24.2.5)
        /// that identifies this instance of the module.
        /// The <see cref="Mvid"/> can be ignored on read by conforming implementations of the CLI.
        /// The <see cref="Mvid"/> should be newly generated for every module,
        /// using the algorithm specified in ISO/IEC 11578:1996
        /// (Annex A) or another compatible algorithm.
        /// </summary>
        /// <remarks>
        /// [Rationale: While the VES itself makes no use of the Mvid,
        /// other tools (such as debuggers, which are outside the scope of this standard)
        /// rely on the fact that the <see cref="Mvid"/> almost always differs from one module to another.
        /// end rationale]
        /// </remarks>
        public Guid? Mvid;

        public Guid? EncId;
        
        public Guid? EncBaseId;

        public void Read(ClrModuleReader reader)
        {
            this.Generation = reader.Binary.ReadUInt16();
            this.Name = reader.ReadString();
            this.Mvid = reader.ReadGuid();
            this.EncId = reader.ReadGuid();
            this.EncBaseId = reader.ReadGuid();
        }
    }
}
