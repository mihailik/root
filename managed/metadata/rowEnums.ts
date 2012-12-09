module pe.managed.metadata {
    export enum AssemblyHashAlgorithm {
        None = 0x0000,
        Reserved = 0x8003,
        Sha1 = 0x8004
    }

    export enum AssemblyFlags {
        // The assembly reference holds the full (unhashed) public key.
        PublicKey = 0x0001,
        
        // The implementation of this assembly used at runtime is not expected to match the version seen at compile time.
        // (See the text following this table.)
        Retargetable = 0x0100,

        // Reserved 
        // (a conforming implementation of the CLI can ignore this setting on read;
        // some implementations might use this bit to indicate
        // that a CIL-to-native-code compiler should not generate optimized code).
        DisableJITcompileOptimizer = 0x4000,
        
        // Reserved
        // (a conforming implementation of the CLI can ignore this setting on read;
        // some implementations might use this bit to indicate
        // that a CIL-to-native-code compiler should generate CIL-to-native code map).
        EnableJITcompileTracking = 0x8000
    }

    // [ECMA-335 §23.1.16]
    export enum ElementType {
        
        // Marks end of a list.
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

        // Followed by type.
        Ptr = 0x0f,

        // Followed by type.
        ByRef = 0x10,
        
        // Followed by <see cref="TableKind.TypeDef"/> or <see cref="TableKind.TypeRef"/> token.
        ValueType = 0x11,
        
        // Followed by <see cref="TableKind.TypeDef"/> or <see cref="TableKind.TypeRef"/> token.
        Class = 0x12,
        
        // Generic parameter in a generic type definition, represented as number (compressed unsigned integer).
        Var = 0x13,
        
        // type rank boundsCount bound1 … loCount lo1 …
        Array = 0x14,

        // Generic type instantiation.  Followed by type typearg-count type-1 ... type-n.
        GenericInst = 0x15,

        TypedByRef = 0x16,
        
        // <see cref="System.IntPtr"/>
        I = 0x18,
        
        // <see cref="System.UIntPtr"/>
        U = 0x19,
        
        // Followed by full method signature.
        FnPtr = 0x1b,
        
        // <see cref="System.Object"/>
        Object = 0x1c,
        
        // Single-dim array with 0 lower bound
        SZArray = 0x1d,

        // Generic parameter in a generic method definition, represented as number (compressed unsigned integer).
        MVar = 0x1e,

        // Required modifier : followed by <see cref="TableKind.TypeDef"/> or <see cref="TableKind.TypeRef"/> token.
        CMod_ReqD = 0x1f,
        
        // Optional modifier : followed by <see cref="TableKind.TypeDef"/> or <see cref="TableKind.TypeRef"/> token.
        CMod_Opt = 0x20,
        
        // Implemented within the CLI.
        Internal = 0x21,

        // Or'd with following element types.
        Modifier = 0x40,
        
        // Sentinel for vararg method signature.
        Sentinel = 0x01 | Modifier,
        
        // Denotes a local variable that points at a pinned object,
        Pinned = 0x05 | Modifier,

        R4_Hfa = 0x06 | Modifier,
        R8_Hfa = 0x07 | Modifier,
        
        // Indicates an argument of type <see cref="System.Type"/>.
        ArgumentType_ = 0x10 | Modifier,
        
        // Used in custom attributes to specify a boxed object (ECMA-335 §23.3).
        CustomAttribute_BoxedObject_ = 0x11 | Modifier,

        // Reserved_ = 0x12 | Modifier,
        
        // Used in custom attributes to indicate a FIELD (ECMA-335 §22.10, 23.3).
        CustomAttribute_Field_ = 0x13 | Modifier,
        
        // Used in custom attributes to indicate a PROPERTY (ECMA-335 §22.10, 23.3).
        CustomAttribute_Property_ = 0x14 | Modifier,

        // Used in custom attributes to specify an enum (ECMA-335 §23.3).
        CustomAttribute_Enum_ = 0x55
    }

}