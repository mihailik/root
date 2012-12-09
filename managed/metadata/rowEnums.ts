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

    // [ECMA-335 para23.1.16]
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
        
        // Used in custom attributes to specify a boxed object (ECMA-335 para23.3).
        CustomAttribute_BoxedObject_ = 0x11 | Modifier,

        // Reserved_ = 0x12 | Modifier,
        
        // Used in custom attributes to indicate a FIELD (ECMA-335 para22.10, 23.3).
        CustomAttribute_Field_ = 0x13 | Modifier,
        
        // Used in custom attributes to indicate a PROPERTY (ECMA-335 para22.10, 23.3).
        CustomAttribute_Property_ = 0x14 | Modifier,

        // Used in custom attributes to specify an enum (ECMA-335 para23.3).
        CustomAttribute_Enum_ = 0x55
    }

    /// <summary>
    /// Look in ECMA-335 para22.11.
    /// </summary>
    export enum SecurityAction {
        /// <summary>
        /// Without further checks, satisfy Demand for the specified permission.
        /// Valid scope: Method, Type;
        /// </summary>
        Assert = 3,

        /// <summary>
        /// Check that all callers in the call chain have been granted specified permission,
        /// throw SecurityException (see ECMA-335 paraPartition IV) on failure.
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
        /// throw SecurityException (see ECMA-335 paraPartition IV) on failure.
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
    /// [ECMA-335 para23.1.4]
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

    /// <summary>
    /// [ECMA-335 para23.1.5]
    /// </summary>
    export enum FieldAttributes {
        /// <summary>
        /// These 3 bits contain one of the following values:
        /// <see cref="CompilerControlled"/>, <see cref="Private"/>,
        /// <see cref="FamANDAssem"/>, <see cref="Assembly"/>,
        /// <see cref="Family"/>, <see cref="FamORAssem"/>,
        /// <see cref="Public"/>.
        /// </summary>
        FieldAccessMask = 0x0007,

        /// <summary>
        /// Member not referenceable.
        /// </summary>
        CompilerControlled = 0x0000,

        /// <summary>
        /// Accessible only by the parent type.
        /// </summary>
        Private = 0x0001,
        
        /// <summary>
        /// Accessible by sub-types only in this Assembly.
        /// </summary>
        FamANDAssem = 0x0002,

        /// <summary>
        /// Accessibly by anyone in the Assembly.
        /// </summary>
        Assembly = 0x0003,

        /// <summary>
        /// Accessible only by type and sub-types.
        /// </summary>
        Family = 0x0004,
        
        /// <summary>
        /// Accessibly by sub-types anywhere, plus anyone in assembly.
        /// </summary>
        FamORAssem = 0x0005,

        /// <summary>
        /// Accessibly by anyone who has visibility to this scope field contract attributes.
        /// </summary>
        Public = 0x0006,


        /// <summary>
        /// Defined on type, else per instance.
        /// </summary>
        Static = 0x0010,
        
        /// <summary>
        /// Field can only be initialized, not written to after init.
        /// </summary>
        InitOnly = 0x0020,

        /// <summary>
        /// Value is compile time constant.
        /// </summary>
        Literal = 0x0040,
        
        /// <summary>
        /// Reserved (to indicate this field should not be serialized when type is remoted).
        /// </summary>
        NotSerialized = 0x0080,
        
        /// <summary>
        /// Field is special.
        /// </summary>
        SpecialName = 0x0200,

        // Interop Attributes

        /// <summary>
        /// Implementation is forwarded through PInvoke.
        /// </summary>
        PInvokeImpl = 0x2000,


        // Additional flags
        
        /// <summary>
        /// CLI provides 'special' behavior, depending upon the name of the field.
        /// </summary>
        RTSpecialName = 0x0400,
        
        /// <summary>
        /// Field has marshalling information.
        /// </summary>
        HasFieldMarshal = 0x1000,

        /// <summary>
        /// Field has default.
        /// </summary>
        HasDefault = 0x8000,
        
        /// <summary>
        /// Field has RVA.
        /// </summary>
        HasFieldRVA = 0x0100
    }

    /// <summary>
    /// [ECMA-335 para23.1.6]
    /// </summary>
    export enum FileAttributes {
        /// <summary>
        /// This is not a resource file.
        /// </summary>
        ContainsMetaData = 0x0000,

        /// <summary>
        /// This is a resource file or other non-metadata-containing file.
        /// </summary>
        ContainsNoMetaData = 0x0001
    }

    /// <summary>
    /// [ECMA-335 para23.1.7]
    /// </summary>
    export enum GenericParamAttributes {
        /// <summary>
        /// These 2 bits contain one of the following values:
        /// <see cref="VarianceMask"/>,
        /// <see cref="None"/>,
        /// <see cref="Covariant"/>,
        /// <see cref="Contravariant"/>.
        /// </summary>
        VarianceMask = 0x0003,
        
        /// <summary>
        /// The generic parameter is non-variant and has no special constraints.
        /// </summary>
        None = 0x0000,
        
        /// <summary>
        /// The generic parameter is covariant.
        /// </summary>
        Covariant = 0x0001,
        
        /// <summary>
        /// The generic parameter is contravariant.
        /// </summary>
        Contravariant = 0x0002,
        

        /// <summary>
        /// These 3 bits contain one of the following values:
        /// <see cref="ReferenceTypeConstraint"/>,
        /// <see cref="NotNullableValueTypeConstraint"/>,
        /// <see cref="DefaultConstructorConstraint"/>.
        /// </summary>
        SpecialConstraintMask = 0x001C,
        
        /// <summary>
        /// The generic parameter has the class special constraint.
        /// </summary>
        ReferenceTypeConstraint = 0x0004,
        
        /// <summary>
        /// The generic parameter has the valuetype special constraint.
        /// </summary>
        NotNullableValueTypeConstraint = 0x0008,
        
        /// <summary>
        /// The generic parameter has the .ctor special constraint.
        /// </summary>
        DefaultConstructorConstraint = 0x0010
    }

    /// <summary>
    /// [ECMA-335 para23.1.8]
    /// </summary>
    export enum PInvokeAttributes {
        /// <summary>
        /// PInvoke is to use the member name as specified.
        /// </summary>
        NoMangle = 0x0001,


        // Character set

        /// <summary>
        /// These 2 bits contain one of the following values:
        /// <see cref="CharSetNotSpec"/>,
        /// <see cref="CharSetAnsi"/>,
        /// <see cref="CharSetUnicode"/>,
        /// <see cref="CharSetAuto"/>.
        /// </summary>
        CharSetMask = 0x0006,
        
        CharSetNotSpec = 0x0000,
        CharSetAnsi = 0x0002,
        CharSetUnicode = 0x0004,
        CharSetAuto = 0x0006,


        /// <summary>
        /// Information about target function. Not relevant for fields.
        /// </summary>
        SupportsLastError = 0x0040,


        // Calling convention

        /// <summary>
        /// These 3 bits contain one of the following values:
        /// <see cref="CallConvPlatformapi"/>,
        /// <see cref="CallConvCdecl"/>,
        /// <see cref="CallConvStdcall"/>,
        /// <see cref="CallConvThiscall"/>,
        /// <see cref="CallConvFastcall"/>.
        /// </summary>
        CallConvMask = 0x0700,

        CallConvPlatformapi = 0x0100,

        CallConvCdecl = 0x0200,

        CallConvStdcall = 0x0300,

        CallConvThiscall = 0x0400,

        CallConvFastcall = 0x0500
    }

    /// <summary>
    /// [ECMA-335 para23.1.9]
    /// </summary>
    export enum ManifestResourceAttributes {
        /// <summary>
        /// These 3 bits contain one of the following values:
        /// </summary>
        VisibilityMask = 0x0007,

        /// <summary>
        /// The Resource is exported from the Assembly.
        /// </summary>
        Public = 0x0001,
        
        /// <summary>
        /// The Resource is private to the Assembly.
        /// </summary>
        Private = 0x0002
    }

    export enum MethodImplAttributes {
        /// <summary>
        /// These 2 bits contain one of the following values:
        /// <see cref="IL"/>, <see cref="Native"/>, <see cref="OPTIL"/>, <see cref="Runtime"/>.
        /// </summary>
        CodeTypeMask = 0x0003,
        
        /// <summary>
        /// Method impl is CIL.
        /// </summary>
        IL = 0x0000,
        
        /// <summary>
        /// Method impl is native.
        /// </summary>
        Native = 0x0001,
        
        /// <summary>
        /// Reserved: shall be zero in conforming implementations.
        /// </summary>
        OPTIL = 0x0002,

        /// <summary>
        /// Method impl is provided by the runtime.
        /// </summary>
        Runtime = 0x0003,


        /// <summary>
        /// Flags specifying whether the code is managed or unmanaged.
        /// This bit contains one of the following values:
        /// <see cref="Unmanaged"/>, <see cref="Managed"/>.
        /// </summary>
        ManagedMask = 0x0004,

        /// <summary>
        /// Method impl is unmanaged, otherwise managed.
        /// </summary>
        Unmanaged = 0x0004,
        
        /// <summary>
        /// Method impl is managed.
        /// </summary>
        Managed = 0x0000,


        // Implementation info and interop

        /// <summary>
        /// Indicates method is defined; used primarily in merge scenarios.
        /// </summary>
        ForwardRef = 0x0010,

        /// <summary>
        /// Reserved: conforming implementations can ignore.
        /// </summary>
        PreserveSig = 0x0080,

        /// <summary>
        /// Reserved: shall be zero in conforming implementations.
        /// </summary>
        InternalCall = 0x1000,

        /// <summary>
        /// Method is single threaded through the body.
        /// </summary>
        Synchronized = 0x0020,

        /// <summary>
        /// Method cannot be inlined.
        /// </summary>
        NoInlining = 0x0008,
        
        /// <summary>
        /// Range check value.
        /// </summary>
        MaxMethodImplVal = 0xffff,

        /// <summary>
        /// Method will not be optimized when generating native code.
        /// </summary>
        NoOptimization = 0x0040,
    }

    /// <summary>
    /// [ECMA-335 para23.1.10]
    /// </summary>
    export enum MethodAttributes {
        /// <summary>
        /// These 3 bits contain one of the following values:
        /// <see cref="CompilerControlled"/>, 
        /// <see cref="Private"/>, 
        /// <see cref="FamANDAssem"/>, 
        /// <see cref="Assem"/>, 
        /// <see cref="Family"/>, 
        /// <see cref="FamORAssem"/>, 
        /// <see cref="Public"/>
        /// </summary>
        MemberAccessMask = 0x0007,

        /// <summary>
        /// Member not referenceable.
        /// </summary>
        CompilerControlled = 0x0000,

        /// <summary>
        /// Accessible only by the parent type.
        /// </summary>
        Private = 0x0001,

        /// <summary>
        /// Accessible by sub-types only in this Assembly.
        /// </summary>
        FamANDAssem = 0x0002,

        /// <summary>
        /// Accessibly by anyone in the Assembly.
        /// </summary>
        Assem = 0x0003,

        /// <summary>
        /// Accessible only by type and sub-types.
        /// </summary>
        Family = 0x0004,

        /// <summary>
        /// Accessibly by sub-types anywhere, plus anyone in assembly.
        /// </summary>
        FamORAssem = 0x0005,

        /// <summary>
        /// Accessibly by anyone who has visibility to this scope.
        /// </summary>
        Public = 0x0006,


        /// <summary>
        /// Defined on type, else per instance.
        /// </summary>
        Static = 0x0010,

        /// <summary>
        /// Method cannot be overridden.
        /// </summary>
        Final = 0x0020,

        /// <summary>
        /// Method is virtual.
        /// </summary>
        Virtual = 0x0040,

        /// <summary>
        /// Method hides by name+sig, else just by name.
        /// </summary>
        HideBySig = 0x0080,


        /// <summary>
        /// Use this mask to retrieve vtable attributes. This bit contains one of the following values:
        /// <see cref="ReuseSlot"/>, <see cref="NewSlot"/>.
        /// </summary>
        VtableLayoutMask = 0x0100,

        /// <summary>
        /// Method reuses existing slot in vtable.
        /// </summary>
        ReuseSlot = 0x0000,

        /// <summary>
        /// Method always gets a new slot in the vtable.
        /// </summary>
        NewSlot = 0x0100,


        /// <summary>
        /// Method can only be overriden if also accessible.
        /// </summary>
        Strict = 0x0200,

        /// <summary>
        /// Method does not provide an implementation.
        /// </summary>
        Abstract = 0x0400,

        /// <summary>
        /// Method is special.
        /// </summary>
        SpecialName = 0x0800,


        // Interop attributes

        /// <summary>
        /// Implementation is forwarded through PInvoke.
        /// </summary>
        PInvokeImpl = 0x2000,

        /// <summary>
        /// Reserved: shall be zero for conforming implementations.
        /// </summary>
        UnmanagedExport = 0x0008,


        // Additional flags

        /// <summary>
        /// CLI provides 'special' behavior, depending upon the name of the method.
        /// </summary>
        RTSpecialName = 0x1000,

        /// <summary>
        /// Method has security associated with it.
        /// </summary>
        HasSecurity = 0x4000,

        /// <summary>
        /// Method calls another method containing security code.
        /// </summary>
        RequireSecObject = 0x8000
    }

    /// <summary>
    /// [ECMA-335 para23.1.12]
    /// </summary>
    export enum MethodSemanticsAttributes {
        /// <summary>
        /// Setter for property.
        /// </summary>
        Setter = 0x0001,

        /// <summary>
        /// Getter for property.
        /// </summary>
        Getter = 0x0002,

        /// <summary>
        /// Other method for property or event.
        /// </summary>
        Other = 0x0004,

        /// <summary>
        /// AddOn method for event.
        /// This refers to the required add_ method for events.  (ECMA-335 para22.13)
        /// </summary>
        AddOn = 0x0008,
        
        /// <summary>
        /// RemoveOn method for event.
        /// This refers to the required remove_ method for events. (ECMA-335 para22.13)
        /// </summary>
        RemoveOn = 0x0010,

        /// <summary>
        /// Fire method for event.
        /// This refers to the optional raise_ method for events. (ECMA-335 para22.13)
        /// </summary>
        Fire = 0x0020
    }

    /// <summary>
    /// [ECMA-335 para23.1.13]
    /// </summary>
    export enum ParamAttributes {
        /// <summary>
        /// Param is [In].
        /// </summary>
        In = 0x0001,

        /// <summary>
        /// Param is [out].
        /// </summary>
        Out = 0x0002,
        
        /// <summary>
        /// Param is optional.
        /// </summary>
        Optional = 0x0010,
        
        /// <summary>
        /// Param has default value.
        /// </summary>
        HasDefault = 0x1000,
        
        /// <summary>
        /// Param has FieldMarshal.
        /// </summary>
        HasFieldMarshal = 0x2000,
        
        /// <summary>
        /// Reserved: shall be zero in a conforming implementation.
        /// </summary>
        Unused = 0xcfe0,
    }

    /// <summary>
    /// [ECMA-335 para23.1.14]
    /// </summary>
    export enum PropertyAttributes {
        /// <summary>
        /// Property is special.
        /// </summary>
        SpecialName = 0x0200,

        /// <summary>
        /// Runtime(metadata internal APIs) should check name encoding.
        /// </summary>
        RTSpecialName = 0x0400,

        /// <summary>
        /// Property has default.
        /// </summary>
        HasDefault = 0x1000,
        
        /// <summary>
        /// Reserved: shall be zero in a conforming implementation.
        /// </summary>
        Unused = 0xe9ff
    }

}