using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.CodedIndices
{
    using Mi.PE.Cli.Tables;

    /// <summary>
    /// <see cref="HasCustomAttributes"/> only has values for tables that are ―externally visible;
    /// that is, that correspond to items in a user source program.
    /// For example, an attribute can be attached to a <see cref="Mi.PE.Cli.Tables.TableKind.TypeDef"/> table
    /// and a <see cref="Mi.PE.Cli.Tables.TableKind.Field"/> table,
    /// but not a <see cref="Mi.PE.Cli.Tables.TableKind.ClassLayout"/> table.
    /// As a result, some table types are missing from <see cref="HasCustomAttribute.TableKind"/> enum.
    /// </summary>
    public struct HasCustomAttribute : ICodedIndexDefinition
    {
        public TableKind[] Tables { get { return tables; } }

        static readonly TableKind[] tables = new[]
            {
                TableKind.MethodDef,
                TableKind.Field,
                TableKind.TypeRef,
                TableKind.TypeDef,
                TableKind.Param,
                TableKind.InterfaceImpl,
                TableKind.MemberRef,
                TableKind.Module,
                (TableKind)ushort.MaxValue, //TableKind.Permission,
                TableKind.Property,
                TableKind.Event,
                TableKind.StandAloneSig,
                TableKind.ModuleRef,
                TableKind.TypeSpec,
                TableKind.Assembly,
                TableKind.AssemblyRef,
                TableKind.File,
                TableKind.ExportedType,
                TableKind.ManifestResource,
                TableKind.GenericParam,
                TableKind.GenericParamConstraint,
                TableKind.MethodSpec
            };
    }
}