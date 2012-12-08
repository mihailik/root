using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Unmanaged
{
    public enum BaseRelocationType
    {
        /// <summary>
        /// The base relocation is skipped.
        /// This type can be used to pad a block.
        /// </summary>
        Absolute = 0,

        /// <summary>
        /// The base relocation adds the high 16 bits of the difference to the 16-bit field at offset.
        /// The 16-bit field represents the high value of a 32-bit word.
        /// </summary>
        High = 1,

        /// <summary>
        /// The base relocation adds the low 16 bits of the difference to the 16-bit field at offset.
        /// The 16-bit field represents the low half of a 32-bit word.
        /// </summary>
        Low = 2,

        /// <summary>
        /// The base relocation applies all 32 bits of the difference to the 32-bit field at offset.
        /// </summary>
        HighLow = 3,
        
        /// <summary>
        /// The base relocation adds the high 16 bits of the difference to the 16-bit field at offset.
        /// The 16-bit field represents the high value of a 32-bit word.
        /// The low 16 bits of the 32-bit value are stored in the 16-bit word that follows this base relocation.
        /// This means that this base relocation occupies two slots.
        /// </summary>
        HighAdj = 4,

        /// <summary>
        /// For MIPS machine types, the base relocation applies to a MIPS jump instruction.
        /// </summary>
        Mips_JmpAddr = 5,

        /// <summary>
        /// For ARM machine types, the base relocation applies the difference
        /// to the 32-bit value encoded in the immediate fields
        /// of a contiguous MOVW+MOVT pair in ARM mode at offset.
        /// </summary>
        Arm_Mov32A = 5,

        // 6 is reserved

        /// <summary>
        /// The base relocation applies the difference to the 32-bit value
        /// encoded in the immediate fields of a contiguous MOVW+MOVT pair in Thumb mode at offset.
        /// </summary>
        Arm_Mov32T = 7,

        /// <summary>
        /// The base relocation applies to a MIPS16 jump instruction.
        /// </summary>
        Mips_JmpAddr16 = 9,

        /// <summary>
        /// The base relocation applies the difference to the 64-bit field at offset.
        /// </summary>
        Dir64 = 10
    }
}