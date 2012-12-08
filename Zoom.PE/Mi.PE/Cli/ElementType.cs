using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli
{
    /// <summary>
    /// [ECMA-335 §23.1.16]
    /// </summary>
    public enum ElementType : byte
    {
        /// <summary>
        /// Marks end of a list.
        /// </summary>
        End = 0x00,

        Void = 0x01,
        
        Boolean = 0x02,
        
        Char = 0x03,
        
        I1 = 0x04,
        U1 = 0x05,
        I2 = 0x06,
        U2 = 0x07,
        I4 = 0x08,
        U4 = 0x09,
        I8 = 0x0a,
        U8 = 0x0b,
        R4 = 0x0c,
        R8 = 0x0d,
        String = 0x0e,

        /// <summary>
        /// Followed by type.
        /// </summary>
        Ptr = 0x0f,

        /// <summary>
        /// Followed by type.
        /// </summary>
        ByRef = 0x10,

        /// <summary>
        /// Followed by <see cref="TableKind.TypeDef"/> or <see cref="TableKind.TypeRef"/> token.
        /// </summary>
        ValueType = 0x11,

        /// <summary>
        /// Followed by <see cref="TableKind.TypeDef"/> or <see cref="TableKind.TypeRef"/> token.
        /// </summary>
        Class = 0x12,

        /// <summary>
        /// Generic parameter in a generic type definition, represented as number (compressed unsigned integer).
        /// </summary>
        Var = 0x13,

        /// <summary>
        /// type rank boundsCount bound1 … loCount lo1 …
        /// </summary>
        Array = 0x14,

        /// <summary>
        /// Generic type instantiation.  Followed by type typearg-count type-1 ... type-n.
        /// </summary>
        GenericInst = 0x15,

        TypedByRef = 0x16,

        /// <summary>
        /// <see cref="System.IntPtr"/>
        /// </summary>
        I = 0x18,
        
        /// <summary>
        /// <see cref="System.UIntPtr"/>
        /// </summary>
        U = 0x19,

        /// <summary>
        /// Followed by full method signature.
        /// </summary>
        FnPtr = 0x1b,

        /// <summary>
        /// <see cref="System.Object"/>
        /// </summary>
        Object = 0x1c,

        /// <summary>
        /// Single-dim array with 0 lower bound
        /// </summary>
        SZArray = 0x1d,

        /// <summary>
        /// Generic parameter in a generic method definition, represented as number (compressed unsigned integer).
        /// </summary>
        MVar = 0x1e,

        /// <summary>
        /// Required modifier : followed by <see cref="TableKind.TypeDef"/> or <see cref="TableKind.TypeRef"/> token.
        /// </summary>
        CMod_ReqD = 0x1f,

        /// <summary>
        /// Optional modifier : followed by <see cref="TableKind.TypeDef"/> or <see cref="TableKind.TypeRef"/> token.
        /// </summary>
        CMod_Opt = 0x20,

        /// <summary>
        /// Implemented within the CLI.
        /// </summary>
        Internal = 0x21,

        /// <summary>
        /// Or‘d with following element types.
        /// </summary>
        Modifier = 0x40,

        /// <summary>
        /// Sentinel for vararg method signature.
        /// </summary>
        Sentinel = 0x01 | Modifier,

        /// <summary>
        /// Denotes a local variable that points at a pinned object,
        /// </summary>
        Pinned = 0x05 | Modifier,

        R4_Hfa = 0x06 | Modifier,
        R8_Hfa = 0x07 | Modifier,

        /// <summary>
        /// Indicates an argument of type <see cref="System.Type"/>.
        /// </summary>
        ArgumentType_ = 0x10 | Modifier,

        /// <summary>
        /// Used in custom attributes to specify a boxed object (ECMA-335 §23.3).
        /// </summary>
        CustomAttribute_BoxedObject_ = 0x11 | Modifier,

        // Reserved_ = 0x12 | Modifier,

        /// <summary>
        /// Used in custom attributes to indicate a FIELD (ECMA-335 §22.10, 23.3).
        /// </summary>
        CustomAttribute_Field_ = 0x13 | Modifier,

        /// <summary>
        /// Used in custom attributes to indicate a PROPERTY (ECMA-335 §22.10, 23.3).
        /// </summary>
        CustomAttribute_Property_ = 0x14 | Modifier,

        /// <summary>
        /// Used in custom attributes to specify an enum (ECMA-335 §23.3).
        /// </summary>
        CustomAttribute_Enum_ = 0x55
    }
}