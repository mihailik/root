using System;
using System.Collections.Generic;
using System.Linq;
using Mi.PE.Internal;

namespace Mi.PE.Cli.Tables
{
    partial class TableStream
    {
		private void ReadAndInitializeRowCounts(BinaryStreamReader reader, ulong validMask)
        {
			var tables = new Array[45];

			if ((validMask & ((ulong)1 << (int)TableKind.Module)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new ModuleEntry[rowCount];
				tables[(int)TableKind.Module] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.TypeRef)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new TypeRefEntry[rowCount];
				tables[(int)TableKind.TypeRef] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.TypeDef)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new TypeDefEntry[rowCount];
				tables[(int)TableKind.TypeDef] = table;
			}

			if ((validMask & ((ulong)1 << 0x03)) != 0)
				throw new BadImageFormatException("Non-standard metadata table 0x"+validMask.ToString("X2")+".");
			if ((validMask & ((ulong)1 << (int)TableKind.Field)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new FieldEntry[rowCount];
				tables[(int)TableKind.Field] = table;
			}

			if ((validMask & ((ulong)1 << 0x05)) != 0)
				throw new BadImageFormatException("Non-standard metadata table 0x"+validMask.ToString("X2")+".");
			if ((validMask & ((ulong)1 << (int)TableKind.MethodDef)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new MethodDefEntry[rowCount];
				tables[(int)TableKind.MethodDef] = table;
			}

			if ((validMask & ((ulong)1 << 0x07)) != 0)
				throw new BadImageFormatException("Non-standard metadata table 0x"+validMask.ToString("X2")+".");
			if ((validMask & ((ulong)1 << (int)TableKind.Param)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new ParamEntry[rowCount];
				tables[(int)TableKind.Param] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.InterfaceImpl)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new InterfaceImplEntry[rowCount];
				tables[(int)TableKind.InterfaceImpl] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.MemberRef)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new MemberRefEntry[rowCount];
				tables[(int)TableKind.MemberRef] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.Constant)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new ConstantEntry[rowCount];
				tables[(int)TableKind.Constant] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.CustomAttribute)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new CustomAttributeEntry[rowCount];
				tables[(int)TableKind.CustomAttribute] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.FieldMarshal)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new FieldMarshalEntry[rowCount];
				tables[(int)TableKind.FieldMarshal] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.DeclSecurity)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new DeclSecurityEntry[rowCount];
				tables[(int)TableKind.DeclSecurity] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.ClassLayout)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new ClassLayoutEntry[rowCount];
				tables[(int)TableKind.ClassLayout] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.FieldLayout)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new FieldLayoutEntry[rowCount];
				tables[(int)TableKind.FieldLayout] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.StandAloneSig)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new StandAloneSigEntry[rowCount];
				tables[(int)TableKind.StandAloneSig] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.EventMap)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new EventMapEntry[rowCount];
				tables[(int)TableKind.EventMap] = table;
			}

			if ((validMask & ((ulong)1 << 0x13)) != 0)
				throw new BadImageFormatException("Non-standard metadata table 0x"+validMask.ToString("X2")+".");
			if ((validMask & ((ulong)1 << (int)TableKind.Event)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new EventEntry[rowCount];
				tables[(int)TableKind.Event] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.PropertyMap)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new PropertyMapEntry[rowCount];
				tables[(int)TableKind.PropertyMap] = table;
			}

			if ((validMask & ((ulong)1 << 0x16)) != 0)
				throw new BadImageFormatException("Non-standard metadata table 0x"+validMask.ToString("X2")+".");
			if ((validMask & ((ulong)1 << (int)TableKind.Property)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new PropertyEntry[rowCount];
				tables[(int)TableKind.Property] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.MethodSemantics)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new MethodSemanticsEntry[rowCount];
				tables[(int)TableKind.MethodSemantics] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.MethodImpl)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new MethodImplEntry[rowCount];
				tables[(int)TableKind.MethodImpl] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.ModuleRef)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new ModuleRefEntry[rowCount];
				tables[(int)TableKind.ModuleRef] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.TypeSpec)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new TypeSpecEntry[rowCount];
				tables[(int)TableKind.TypeSpec] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.ImplMap)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new ImplMapEntry[rowCount];
				tables[(int)TableKind.ImplMap] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.FieldRVA)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new FieldRVAEntry[rowCount];
				tables[(int)TableKind.FieldRVA] = table;
			}

			if ((validMask & ((ulong)1 << 0x1E)) != 0)
				throw new BadImageFormatException("Non-standard metadata table 0x"+validMask.ToString("X2")+".");
			if ((validMask & ((ulong)1 << 0x1F)) != 0)
				throw new BadImageFormatException("Non-standard metadata table 0x"+validMask.ToString("X2")+".");
			if ((validMask & ((ulong)1 << (int)TableKind.Assembly)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new AssemblyEntry[rowCount];
				tables[(int)TableKind.Assembly] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.AssemblyProcessor)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new AssemblyProcessorEntry[rowCount];
				tables[(int)TableKind.AssemblyProcessor] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.AssemblyOS)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new AssemblyOSEntry[rowCount];
				tables[(int)TableKind.AssemblyOS] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.AssemblyRef)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new AssemblyRefEntry[rowCount];
				tables[(int)TableKind.AssemblyRef] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.AssemblyRefProcessor)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new AssemblyRefProcessorEntry[rowCount];
				tables[(int)TableKind.AssemblyRefProcessor] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.AssemblyRefOS)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new AssemblyRefOSEntry[rowCount];
				tables[(int)TableKind.AssemblyRefOS] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.File)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new FileEntry[rowCount];
				tables[(int)TableKind.File] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.ExportedType)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new ExportedTypeEntry[rowCount];
				tables[(int)TableKind.ExportedType] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.ManifestResource)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new ManifestResourceEntry[rowCount];
				tables[(int)TableKind.ManifestResource] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.NestedClass)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new NestedClassEntry[rowCount];
				tables[(int)TableKind.NestedClass] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.GenericParam)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new GenericParamEntry[rowCount];
				tables[(int)TableKind.GenericParam] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.MethodSpec)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new MethodSpecEntry[rowCount];
				tables[(int)TableKind.MethodSpec] = table;
			}

			if ((validMask & ((ulong)1 << (int)TableKind.GenericParamConstraint)) != 0)
			{
				uint rowCount = reader.ReadUInt32();
				var table = new GenericParamConstraintEntry[rowCount];
				tables[(int)TableKind.GenericParamConstraint] = table;
			}


			ulong trailingZeroesMask = ulong.MaxValue << 45;
			if ((validMask & trailingZeroesMask) != 0)
				throw new BadImageFormatException("Non-standard metadata table bits.");

			this.Tables = tables;
		}

		private void ReadTables(ClrModuleReader reader)
        {
			var moduleTable = (ModuleEntry[])this.Tables[(int)TableKind.Module];
			if (moduleTable != null)
			{
				for(int i = 0; i < moduleTable.Length; i++)
				{
					moduleTable[i].Read(reader);
				}
			}
			var typeRefTable = (TypeRefEntry[])this.Tables[(int)TableKind.TypeRef];
			if (typeRefTable != null)
			{
				for(int i = 0; i < typeRefTable.Length; i++)
				{
					typeRefTable[i].Read(reader);
				}
			}
			var typeDefTable = (TypeDefEntry[])this.Tables[(int)TableKind.TypeDef];
			if (typeDefTable != null)
			{
				for(int i = 0; i < typeDefTable.Length; i++)
				{
					typeDefTable[i].Read(reader);
				}
			}
			var fieldTable = (FieldEntry[])this.Tables[(int)TableKind.Field];
			if (fieldTable != null)
			{
				for(int i = 0; i < fieldTable.Length; i++)
				{
					fieldTable[i].Read(reader);
				}
			}
			var methodDefTable = (MethodDefEntry[])this.Tables[(int)TableKind.MethodDef];
			if (methodDefTable != null)
			{
				for(int i = 0; i < methodDefTable.Length; i++)
				{
					methodDefTable[i].Read(reader);
				}
			}
			var paramTable = (ParamEntry[])this.Tables[(int)TableKind.Param];
			if (paramTable != null)
			{
				for(int i = 0; i < paramTable.Length; i++)
				{
					paramTable[i].Read(reader);
				}
			}
			var interfaceImplTable = (InterfaceImplEntry[])this.Tables[(int)TableKind.InterfaceImpl];
			if (interfaceImplTable != null)
			{
				for(int i = 0; i < interfaceImplTable.Length; i++)
				{
					interfaceImplTable[i].Read(reader);
				}
			}
			var memberRefTable = (MemberRefEntry[])this.Tables[(int)TableKind.MemberRef];
			if (memberRefTable != null)
			{
				for(int i = 0; i < memberRefTable.Length; i++)
				{
					memberRefTable[i].Read(reader);
				}
			}
			var constantTable = (ConstantEntry[])this.Tables[(int)TableKind.Constant];
			if (constantTable != null)
			{
				for(int i = 0; i < constantTable.Length; i++)
				{
					constantTable[i].Read(reader);
				}
			}
			var customAttributeTable = (CustomAttributeEntry[])this.Tables[(int)TableKind.CustomAttribute];
			if (customAttributeTable != null)
			{
				for(int i = 0; i < customAttributeTable.Length; i++)
				{
					customAttributeTable[i].Read(reader);
				}
			}
			var fieldMarshalTable = (FieldMarshalEntry[])this.Tables[(int)TableKind.FieldMarshal];
			if (fieldMarshalTable != null)
			{
				for(int i = 0; i < fieldMarshalTable.Length; i++)
				{
					fieldMarshalTable[i].Read(reader);
				}
			}
			var declSecurityTable = (DeclSecurityEntry[])this.Tables[(int)TableKind.DeclSecurity];
			if (declSecurityTable != null)
			{
				for(int i = 0; i < declSecurityTable.Length; i++)
				{
					declSecurityTable[i].Read(reader);
				}
			}
			var classLayoutTable = (ClassLayoutEntry[])this.Tables[(int)TableKind.ClassLayout];
			if (classLayoutTable != null)
			{
				for(int i = 0; i < classLayoutTable.Length; i++)
				{
					classLayoutTable[i].Read(reader);
				}
			}
			var fieldLayoutTable = (FieldLayoutEntry[])this.Tables[(int)TableKind.FieldLayout];
			if (fieldLayoutTable != null)
			{
				for(int i = 0; i < fieldLayoutTable.Length; i++)
				{
					fieldLayoutTable[i].Read(reader);
				}
			}
			var standAloneSigTable = (StandAloneSigEntry[])this.Tables[(int)TableKind.StandAloneSig];
			if (standAloneSigTable != null)
			{
				for(int i = 0; i < standAloneSigTable.Length; i++)
				{
					standAloneSigTable[i].Read(reader);
				}
			}
			var eventMapTable = (EventMapEntry[])this.Tables[(int)TableKind.EventMap];
			if (eventMapTable != null)
			{
				for(int i = 0; i < eventMapTable.Length; i++)
				{
					eventMapTable[i].Read(reader);
				}
			}
			var eventTable = (EventEntry[])this.Tables[(int)TableKind.Event];
			if (eventTable != null)
			{
				for(int i = 0; i < eventTable.Length; i++)
				{
					eventTable[i].Read(reader);
				}
			}
			var propertyMapTable = (PropertyMapEntry[])this.Tables[(int)TableKind.PropertyMap];
			if (propertyMapTable != null)
			{
				for(int i = 0; i < propertyMapTable.Length; i++)
				{
					propertyMapTable[i].Read(reader);
				}
			}
			var propertyTable = (PropertyEntry[])this.Tables[(int)TableKind.Property];
			if (propertyTable != null)
			{
				for(int i = 0; i < propertyTable.Length; i++)
				{
					propertyTable[i].Read(reader);
				}
			}
			var methodSemanticsTable = (MethodSemanticsEntry[])this.Tables[(int)TableKind.MethodSemantics];
			if (methodSemanticsTable != null)
			{
				for(int i = 0; i < methodSemanticsTable.Length; i++)
				{
					methodSemanticsTable[i].Read(reader);
				}
			}
			var methodImplTable = (MethodImplEntry[])this.Tables[(int)TableKind.MethodImpl];
			if (methodImplTable != null)
			{
				for(int i = 0; i < methodImplTable.Length; i++)
				{
					methodImplTable[i].Read(reader);
				}
			}
			var moduleRefTable = (ModuleRefEntry[])this.Tables[(int)TableKind.ModuleRef];
			if (moduleRefTable != null)
			{
				for(int i = 0; i < moduleRefTable.Length; i++)
				{
					moduleRefTable[i].Read(reader);
				}
			}
			var typeSpecTable = (TypeSpecEntry[])this.Tables[(int)TableKind.TypeSpec];
			if (typeSpecTable != null)
			{
				for(int i = 0; i < typeSpecTable.Length; i++)
				{
					typeSpecTable[i].Read(reader);
				}
			}
			var implMapTable = (ImplMapEntry[])this.Tables[(int)TableKind.ImplMap];
			if (implMapTable != null)
			{
				for(int i = 0; i < implMapTable.Length; i++)
				{
					implMapTable[i].Read(reader);
				}
			}
			var fieldRVATable = (FieldRVAEntry[])this.Tables[(int)TableKind.FieldRVA];
			if (fieldRVATable != null)
			{
				for(int i = 0; i < fieldRVATable.Length; i++)
				{
					fieldRVATable[i].Read(reader);
				}
			}
			var assemblyTable = (AssemblyEntry[])this.Tables[(int)TableKind.Assembly];
			if (assemblyTable != null)
			{
				for(int i = 0; i < assemblyTable.Length; i++)
				{
					assemblyTable[i].Read(reader);
				}
			}
			var assemblyProcessorTable = (AssemblyProcessorEntry[])this.Tables[(int)TableKind.AssemblyProcessor];
			if (assemblyProcessorTable != null)
			{
				for(int i = 0; i < assemblyProcessorTable.Length; i++)
				{
					assemblyProcessorTable[i].Read(reader);
				}
			}
			var assemblyOSTable = (AssemblyOSEntry[])this.Tables[(int)TableKind.AssemblyOS];
			if (assemblyOSTable != null)
			{
				for(int i = 0; i < assemblyOSTable.Length; i++)
				{
					assemblyOSTable[i].Read(reader);
				}
			}
			var assemblyRefTable = (AssemblyRefEntry[])this.Tables[(int)TableKind.AssemblyRef];
			if (assemblyRefTable != null)
			{
				for(int i = 0; i < assemblyRefTable.Length; i++)
				{
					assemblyRefTable[i].Read(reader);
				}
			}
			var assemblyRefProcessorTable = (AssemblyRefProcessorEntry[])this.Tables[(int)TableKind.AssemblyRefProcessor];
			if (assemblyRefProcessorTable != null)
			{
				for(int i = 0; i < assemblyRefProcessorTable.Length; i++)
				{
					assemblyRefProcessorTable[i].Read(reader);
				}
			}
			var assemblyRefOSTable = (AssemblyRefOSEntry[])this.Tables[(int)TableKind.AssemblyRefOS];
			if (assemblyRefOSTable != null)
			{
				for(int i = 0; i < assemblyRefOSTable.Length; i++)
				{
					assemblyRefOSTable[i].Read(reader);
				}
			}
			var fileTable = (FileEntry[])this.Tables[(int)TableKind.File];
			if (fileTable != null)
			{
				for(int i = 0; i < fileTable.Length; i++)
				{
					fileTable[i].Read(reader);
				}
			}
			var exportedTypeTable = (ExportedTypeEntry[])this.Tables[(int)TableKind.ExportedType];
			if (exportedTypeTable != null)
			{
				for(int i = 0; i < exportedTypeTable.Length; i++)
				{
					exportedTypeTable[i].Read(reader);
				}
			}
			var manifestResourceTable = (ManifestResourceEntry[])this.Tables[(int)TableKind.ManifestResource];
			if (manifestResourceTable != null)
			{
				for(int i = 0; i < manifestResourceTable.Length; i++)
				{
					manifestResourceTable[i].Read(reader);
				}
			}
			var nestedClassTable = (NestedClassEntry[])this.Tables[(int)TableKind.NestedClass];
			if (nestedClassTable != null)
			{
				for(int i = 0; i < nestedClassTable.Length; i++)
				{
					nestedClassTable[i].Read(reader);
				}
			}
			var genericParamTable = (GenericParamEntry[])this.Tables[(int)TableKind.GenericParam];
			if (genericParamTable != null)
			{
				for(int i = 0; i < genericParamTable.Length; i++)
				{
					genericParamTable[i].Read(reader);
				}
			}
			var methodSpecTable = (MethodSpecEntry[])this.Tables[(int)TableKind.MethodSpec];
			if (methodSpecTable != null)
			{
				for(int i = 0; i < methodSpecTable.Length; i++)
				{
					methodSpecTable[i].Read(reader);
				}
			}
			var genericParamConstraintTable = (GenericParamConstraintEntry[])this.Tables[(int)TableKind.GenericParamConstraint];
			if (genericParamConstraintTable != null)
			{
				for(int i = 0; i < genericParamConstraintTable.Length; i++)
				{
					genericParamConstraintTable[i].Read(reader);
				}
			}
		}
	}
}