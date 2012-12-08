using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    using Mi.PE.Cli.CodedIndices;

    /// <summary>
    /// The <see cref="TableKind.GenericParamConstraint"/> table records the constraints for each generic parameter.
    /// Each generic parameter can be constrained to derive from zero or one class.
    /// Each generic parameter can be constrained to implement zero or more interfaces.
    /// Conceptually, each row in the <see cref="TableKind.GenericParamConstraint"/> table is 'owned' by a row in the <see cref="TableKind.GenericParam"/> table.
    /// All rows in the <see cref="TableKind.GenericParamConstraint"/> table for a given <see cref="Owner"/> shall refer to distinct constraints.
    /// Note that if <see cref="Constraint"/> is a <see cref="TableKind.TypeRef"/> to <see cref="System.ValueType"/>,
    /// then it means the constraint type shall be <see cref="System.ValueType"/>, or one of its sub types. 
    /// However, since <see cref="System.ValueType"/> itself is a reference type,
    /// this particular mechanism does not guarantee that the type is a non-reference type.
    /// [ECMA-335 §22.21]
    /// </summary>
    public struct GenericParamConstraintEntry
    {
        /// <summary>
        /// An index into the <see cref="TableKind.GenericParam"/> table, specifying to which generic parameter this row refers.
        /// </summary>
        public uint Owner;

        /// <summary>
        /// An index into the <see cref="TableKind.TypeDef"/>, <see cref="TableKind.TypeRef"/>, or <see cref="TableKind.TypeSpec"/> tables,
        /// specifying from which class this generic parameter is constrained to derive;
        /// or which interface this generic parameter is constrained to implement;
        /// more precisely, a <see cref="TypeDefOrRef"/> (ECMA-335 §24.2.6) coded index.
        /// </summary>
        public CodedIndex<TypeDefOrRef> Constraint;

        public void Read(ClrModuleReader reader)
        {
            this.Owner = reader.ReadTableIndex(TableKind.GenericParam);
            this.Constraint = reader.ReadCodedIndex<TypeDefOrRef>();
        }
    }
}