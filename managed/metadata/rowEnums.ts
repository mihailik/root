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

    /// <summary>
    /// Look in ECMA-335 §22.11.
    /// </summary>
    export enum SecurityAction {
        /// <summary>
        /// Without further checks, satisfy Demand for the specified permission.
        /// Valid scope: Method, Type;
        /// </summary>
        Assert = 3,

        /// <summary>
        /// Check that all callers in the call chain have been granted specified permission,
        /// throw SecurityException (see ECMA-335 §Partition IV) on failure.
        /// Valid scope: Method, Type.
        /// </summary>
        Demand = 2,

        /// <summary>
        /// Without further checks refuse Demand for the specified permission.
        /// Valid scope: Method, Type.
        /// </summary>
        Deny = 4,
        
        /// <summary>
        /// The specified permission shall be granted in order to inherit from class or override virtual method.
        /// Valid scope: Method, Type 
        /// </summary>
        InheritanceDemand = 7,

        /// <summary>
        /// Check that the immediate caller has been granted the specified permission;
        /// throw SecurityException (see ECMA-335 §Partition IV) on failure.
        /// Valid scope: Method, Type.
        /// </summary>
        LinkDemand = 6,

        /// <summary>
        ///  Check that the current assembly has been granted the specified permission;
        ///  throw SecurityException (see Partition IV) otherwise.
        ///  Valid scope: Method, Type.
        /// </summary>
        NonCasDemand = 0, // TODO: find the correct value

        /// <summary>
        /// Check that the immediate caller has been granted the specified permission;
        /// throw SecurityException (see Partition IV) otherwise.
        /// Valid scope: Method, Type.
        /// </summary>
        NonCasLinkDemand = 0,  // TODO: find the correct value

        /// <summary>
        /// Reserved for implementation-specific use.
        /// Valid scope: Assembly.
        /// </summary>
        PrejitGrant = 0,  // TODO: find the correct value
 
        /// <summary>
        /// Without further checks, refuse Demand for all permissions other than those specified.
        /// Valid scope: Method, Type 
        /// </summary>
        PermitOnly = 5,

        /// <summary>
        /// Specify the minimum permissions required to run.
        /// Valid scope: Assembly.
        /// </summary>
        RequestMinimum = 8,
        
        /// <summary>
        /// Specify the optional permissions to grant.
        /// Valid scope: Assembly.
        /// </summary>
        RequestOptional = 9,

        /// <summary>
        /// Specify the permissions not to be granted.
        /// Valid scope: Assembly.
        /// </summary>
        RequestRefuse = 10
    }

    /// <summary>
    /// [ECMA-335 §23.1.4]
    /// </summary>
    export enum EventAttributes {
        /// <summary>
        /// Event is special.
        /// </summary>
        SpecialName = 0x0200,

        /// <summary>
        /// CLI provides 'special' behavior, depending upon the name of the event.
        /// </summary>
        RTSpecialName = 0x0400,
    }

    export enum TypeAttributes {
        // Visibility attributes

        /// <summary>
        /// Use this mask to retrieve visibility information.
        /// These 3 bits contain one of the following values:
        /// <see cref="NotPublic"/>, <see cref="Public"/>,
        /// <see cref="NestedPublic"/>, <see cref="NestedPrivate"/>,
        /// <see cref="NestedFamily"/>, <see cref="NestedAssembly"/>,
        /// <see cref="NestedFamANDAssem"/>, <see cref="NestedFamORAssem"/>.
        /// </summary>
        VisibilityMask = 0x00000007,

        /// <summary>
        /// Class has no public scope.
        /// </summary>
        NotPublic = 0x00000000,

        /// <summary>
        /// Class has public scope.
        /// </summary>
        Public = 0x00000001,

        /// <summary>
        /// Class is nested with public visibility.
        /// </summary>
        NestedPublic = 0x00000002,

        /// <summary>
        /// Class is nested with private visibility.
        /// </summary>
        NestedPrivate = 0x00000003,

        /// <summary>
        /// Class is nested with family visibility.
        /// </summary>
        NestedFamily = 0x00000004,

        /// <summary>
        /// Class is nested with assembly visibility.
        /// </summary>
        NestedAssembly = 0x00000005,

        /// <summary>
        /// Class is nested with family and assembly visibility.
        /// </summary>
        NestedFamANDAssem = 0x00000006,

        /// <summary>
        /// Class is nested with family or assembly visibility.
        /// </summary>
        NestedFamORAssem = 0x00000007,


        // Class layout attributes

        /// <summary>
        /// Use this mask to retrieve class layout information.
        /// These 2 bits contain one of the following values:
        /// <see cref="AutoLayout"/>, <see cref="SequentialLayout"/>, <see cref="ExplicitLayout"/>.
        /// </summary>
        LayoutMask = 0x00000018,

        /// <summary>
        /// Class fields are auto-laid out.
        /// </summary>
        AutoLayout = 0x00000000,

        /// <summary>
        /// Class fields are laid out sequentially.
        /// </summary>
        SequentialLayout = 0x00000008,

        /// <summary>
        /// Layout is supplied explicitly.
        /// </summary>
        ExplicitLayout = 0x00000010,


        // Class semantics attributes

        /// <summary>
        /// Use this mask to retrive class semantics information.
        /// This bit contains one of the following values:
        /// <see cref="Class"/>, <see cref="Interface"/>.
        /// </summary>
        ClassSemanticsMask = 0x00000020,

        /// <summary>
        /// Type is a class.
        /// </summary>
        Class = 0x00000000,
        
        /// <summary>
        /// Type is an interface.
        /// </summary>
        Interface = 0x00000020,


        // Special semantics in addition to class semantics

        /// <summary>
        /// Class is abstract.
        /// </summary>
        Abstract = 0x00000080,

        /// <summary>
        /// Class cannot be extended.
        /// </summary>
        Sealed = 0x00000100,

        /// <summary>
        /// Class name is special.
        /// </summary>
        SpecialName = 0x00000400,


        // Implementation Attributes

        /// <summary>
        /// Class/Interface is imported.
        /// </summary>
        Import = 0x00001000,
        
        /// <summary>
        /// Reserved (Class is serializable)
        /// </summary>
        Serializable = 0x00002000,


        // String formatting Attributes

        /// <summary>
        /// Use this mask to retrieve string information for native interop.
        /// These 2 bits contain one of the following values:
        /// <see cref="AnsiClass"/>, <see cref="UnicodeClass"/>, <see cref="AutoClass"/>, <see cref="CustomFormatClass"/>.
        /// </summary>
        StringFormatMask = 0x00030000,

        /// <summary>
        /// LPSTR is interpreted as ANSI.
        /// </summary>
        AnsiClass = 0x00000000,

        /// <summary>
        /// LPSTR is interpreted as Unicode.
        /// </summary>
        UnicodeClass = 0x00010000,

        /// <summary>
        /// LPSTR is interpreted automatically.
        /// </summary>
        AutoClass = 0x00020000,

        /// <summary>
        /// A non-standard encoding specified by CustomStringFormatMask.
        /// </summary>
        CustomFormatClass = 0x00030000,

        /// <summary>
        /// Use this mask to retrieve non-standard encoding information for native interop.
        /// The meaning of the values of these 2 bits isunspecified.
        /// </summary>
        CustomStringFormatMask = 0x00C00000,


        // Class Initialization Attributes

        /// <summary>
        /// Initialize the class before first static field access.
        /// </summary>
        BeforeFieldInit = 0x00100000,


        // Additional Flags

        /// <summary>
        /// CLI provides 'special' behavior, depending upon the name of the Type
        /// </summary>
        RTSpecialName = 0x00000800,

        /// <summary>
        /// Type has security associate with it.
        /// </summary>
        HasSecurity = 0x00040000,

        /// <summary>
        /// This <see cref="ExportedTypeEntry"/> is a type forwarder.
        /// </summary>
        IsTypeForwarder = 0x00200000
    }
}