using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Cli.Tables
{
    [Flags]
    public enum TypeAttributes : uint
    {
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