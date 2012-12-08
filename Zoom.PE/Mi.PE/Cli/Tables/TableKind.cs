using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Cli.Tables
{
    public enum TableKind
    {
        /// <summary> ECMA-335 §22.2. </summary>
        Assembly = 0x20,
        /// <summary> ECMA-335 §22.4 Shall be ignored by the CLI. </summary>
        AssemblyProcessor = 0x21,
        /// <summary> ECMA-335 §22.3 Shall be ignored by the CLI. </summary>
        AssemblyOS = 0x22,
        /// <summary> ECMA-335 §22.6 Shall be ignored by the CLI. </summary>
        AssemblyRefOS = 0x25,
        /// <summary> ECMA-335 §22.7 Shall be ignored by the CLI. </summary>
        AssemblyRefProcessor = 0x24,

        /// <summary>
        /// The rows in the Module table result from .module directives in the Assembly.
        /// </summary>
        Module = 0x00,

        /// <summary>
        /// Contains ResolutionScope, TypeName and TypeNamespace columns.
        /// </summary>
        TypeRef = 0x01,

        /// <summary>
        /// The first row of the TypeDef table represents the pseudo class that acts as parent for functions and variables 
        /// defined at module scope.
        /// If a type is generic, its parameters are defined in the GenericParam table (§22.20). Entries in the 
        /// GenericParam table reference entries in the TypeDef table; there is no reference from the TypeDef table to the 
        /// GenericParam table.
        /// </summary>
        TypeDef = 0x02,

        /// <summary>
        /// Each row in the Field table results from a top-level .field directive, or a .field directive inside a 
        /// Type. 
        /// </summary>
        Field = 0x04,

        /// <summary>
        /// Conceptually, every row in the MethodDef table is owned by one, and only one, row in the TypeDef table.
        /// The rows in the MethodDef table result from .method directives (§15). The RVA column is computed when 
        /// the image for the PE file is emitted and points to the COR_ILMETHOD structure for the body of the method.
        /// </summary>
        MethodDef = 0x06,

        /// <summary>
        /// Conceptually, every row in the Param table is owned by one, and only one, row in the MethodDef table.
        /// The rows in the Param table result from the parameters in a method declaration (§15.4), or from a .param
        /// attribute attached to a method.
        /// </summary>
        Param = 0x08,

        /// <summary>
        /// Combines two sorts of references, to Methods and to Fields of a class, known as 'MethodRef' and 'FieldRef', respectively.
        /// An entry is made into the MemberRef table whenever a reference is made in the CIL code to a method or field 
        /// which is defined in another module or assembly.  (Also, an entry is made for a call to a method with a VARARG
        /// signature, even when it is defined in the same module as the call site.) 
        /// </summary>
        MemberRef = 0x0A,

        /// <summary>
        /// Used to store compile-time, constant values for fields, parameters, and properties.
        /// </summary>
        Constant = 0x0B,

        /// <summary>
        /// Stores data that can be used to instantiate a Custom Attribute (more precisely, an 
        /// object of the specified Custom Attribute class) at runtime.
        /// A row in the CustomAttribute table for a parent is created by the .custom attribute, which gives the value of 
        /// the Type column and optionally that of the Value column.
        /// </summary>
        CustomAttribute = 0x0C,

        /// <summary>
        /// The FieldMarshal table  'links' an existing row in the Field or Param table, to information 
        /// in the Blob heap that defines how that field or parameter (which, as usual, covers the method return, as 
        /// parameter number 0) shall be marshalled when calling to or from unmanaged code via PInvoke dispatch.
        /// A row in the FieldMarshal table is created if the .field directive for the parent field has specified a marshal attribute.
        /// </summary>
        FieldMarshal = 0x0D,

        /// <summary>
        /// The rows of the DeclSecurity table are filled by attaching a .permission or .permissionset directive 
        /// that specifies the Action and PermissionSet on a parent assembly or parent type or method.
        /// </summary>
        DeclSecurity = 0x0E,

        /// <summary>
        /// Used to define how the fields of a class or value type shall be laid out by the CLI.
        /// (Normally, the CLI is free to reorder and/or insert gaps between the fields defined for a class or value type.)
        /// </summary>
        ClassLayout = 0x0F,

        /// <summary>
        /// Records the interfaces a type implements explicitly.  Conceptually, each row in the 
        /// InterfaceImpl table indicates that Class implements Interface.
        /// </summary>
        InterfaceImpl = 0x09,

        /// <summary>
        /// A row in the FieldLayout table is created if the .field directive for the parent field has specified a field offset.
        /// </summary>
        FieldLayout = 0x10,

        /// <summary>
        /// Signatures are stored in the metadata Blob heap.  In most cases, they are indexed by a column in some table —
        /// Field.Signature, Method.Signature, MemberRef.Signature, etc.  However, there are two cases that require a 
        /// metadata token for a signature that is not indexed by any metadata table.  The StandAloneSig table fulfils this 
        /// need.  It has just one column, which points to a Signature in the Blob heap.
        /// </summary>
        StandAloneSig = 0x11,

        /// <summary>
        /// The EventMap and Event tables result from putting the .event directive on a class.
        /// </summary>
        EventMap = 0x12,

        /// <summary>
        /// The EventMap and Event tables result from putting the .event directive on a class.
        /// </summary>
        Event = 0x14,

        /// <summary>
        /// The PropertyMap and Property tables result from putting the .property directive on a class.
        /// </summary>
        PropertyMap = 0x15,

        /// <summary>
        /// Does a little more than group together existing rows from other tables.
        /// </summary>
        Property = 0x17,

        /// <summary>
        /// The rows of the MethodSemantics table are filled by .property and .event directives.
        /// </summary>
        MethodSemantics = 0x18,

        /// <summary>
        /// s let a compiler override the default inheritance rules provided by the CLI. Their original use 
        /// was to allow a class C, that inherited method M from both interfaces I and J, to provide implementations for 
        /// both methods (rather than have only one slot for M in its vtable). However, MethodImpls can be used for other 
        /// reasons too, limited only by the compiler writer‘s ingenuity within the constraints defined in the Validation rules.
        /// ILAsm uses the .override directive to specify the rows of the MethodImpl table.
        /// </summary>
        MethodImpl = 0x19,

        /// <summary>
        /// The rows in the ModuleRef table result from .module extern directives in the Assembly.
        /// </summary>
        ModuleRef = 0x1A,

        /// <summary>
        ///  Contains just one column, which indexes the specification of a Type, stored in the Blob heap.  
        ///  This provides a metadata token for that Type (rather than simply an index into the Blob heap). This is required, 
        ///  typically, for array operations, such as creating, or calling methods on the array class.
        ///  Note that TypeSpec tokens can be used with any of the CIL instructions that take a TypeDef or TypeRef token; 
        ///  specifically, castclass, cpobj, initobj, isinst, ldelema, ldobj, mkrefany, newarr, refanyval, sizeof, stobj, 
        ///  box, and unbox.
        /// </summary>
        TypeSpec = 0x1B,

        /// <summary>
        /// Holds information about unmanaged methods that can be reached from managed code, 
        /// using PInvoke dispatch. 
        /// A row is entered in the ImplMap table for each parent Method (§15.5) that is defined with a .pinvokeimpl
        /// interoperation attribute specifying the MappingFlags, ImportName, and ImportScope.
        /// </summary>
        ImplMap = 0x1C,

        /// <summary>
        /// Conceptually, each row in the FieldRVA table is an extension to exactly one row in the Field table, and records 
        /// the RVA (Relative Virtual Address) within the image file at which this field‘s initial value is stored.
        /// A row in the FieldRVA table is created for each static parent field that has specified the optional data
        /// label.  The RVA column is the relative virtual address of the data in the PE file.
        /// </summary>
        FieldRVA = 0x1D,

        /// <summary>
        /// The table is defined by the .assembly extern directive (§6.3).  Its columns are filled using directives 
        /// similar to those of the Assembly table except for the PublicKeyOrToken column, which is defined using the 
        /// .publickeytoken directive.
        /// </summary>
        AssemblyRef = 0x23,

        /// <summary>
        /// The rows of the File table result from .file directives in an Assembly.
        /// </summary>
        File = 0x26,

        /// <summary>
        /// Holds a row for each type:
        /// a. Defined within other modules of this Assembly; that is exported out of this Assembly.  In essence, it 
        /// stores TypeDef row numbers of all types that are marked public in other modules that this Assembly 
        /// comprises.  
        /// The actual target row in a TypeDef table is given by the combination of TypeDefId (in effect, row 
        /// number) and Implementation (in effect, the module that holds the target TypeDef table).  Note that this 
        /// is the only occurrence in metadata of foreign tokens; that is, token values that have a meaning in 
        /// another module.  (A regular token value is an index into a table in the current module); OR
        /// b. Originally defined in this Assembly but now moved to another Assembly. Flags must have 
        /// IsTypeForwarder set and Implementation is an AssemblyRef indicating the Assembly the type may 
        /// now be found in.
        /// </summary>
        ExportedType = 0x27,

        /// <summary>
        ///  The rows in the table result from .mresource directives on the Assembly.
        /// </summary>
        ManifestResource = 0x28,

        /// <summary>
        /// NestedClass is defined as lexically 'inside' the text of its enclosing Type.
        /// </summary>
        NestedClass = 0x29,

        /// <summary>
        /// Stores the generic parameters used in generic type definitions and generic method 
        /// definitions.  These generic parameters can be constrained (i.e., generic arguments shall extend some class 
        /// and/or implement certain interfaces) or unconstrained.  (Such constraints are stored in the 
        /// GenericParamConstraint table.)
        /// Conceptually, each row in the GenericParam table is owned by one, and only one, row in either the TypeDef or 
        /// MethodDef tables.
        /// </summary>
        GenericParam = 0x2A,

        /// <summary>
        /// Records the signature of an instantiated generic method.
        /// Each unique instantiation of a generic method (i.e., a combination of Method and Instantiation) shall be 
        /// represented by a single row in the table.
        /// </summary>
        MethodSpec = 0x2B,

        /// <summary>
        /// Records the constraints for each generic parameter.  Each generic parameter
        /// can be constrained to derive from zero or one class.  Each generic parameter can be constrained to implement 
        /// zero or more interfaces.
        /// Conceptually, each row in the GenericParamConstraint table is ‗owned‘ by a row in the GenericParam table.
        /// </summary>
        GenericParamConstraint = 0x2C,
    }
}