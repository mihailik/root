/// <reference path="MemberDefinitions.ts" />
/// <reference path="../headers/PEFileHeaders.ts" />

module pe.managed {
	export class AssemblyReader {
		
		read(reader: io.BufferReader, assembly: AssemblyDefinition) {
			if (!assembly.headers) {
				assembly.headers = new headers.PEFileHeaders();
				assembly.headers.read(reader);
			}

			reader.sections = assembly.headers.sectionHeaders;

			// read main managed headers
			reader.setVirtualOffset(assembly.headers.optionalHeader.dataDirectories[headers.DataDirectoryKind.Clr].address);

			var cdi = new ClrDirectory();
			cdi.read2(reader);

			var saveOffset = reader.offset;
			reader.setVirtualOffset(cdi.metadataDir.address);

			var cme = new ClrMetadata();
			cme.read2(reader);

			var mes = new MetadataStreams();
			mes.read(cdi.metadataDir.address, cme.streamCount, reader);

			// populate assembly with what's known already
			// (flags, CLR versions etc.)

			if (!assembly.modules)
				assembly.modules = [];

			if (!assembly.modules[0])
				assembly.modules[0] = new ModuleDefinition();

			var mainModule = assembly.modules[0];
			mainModule.runtimeVersion = cdi.runtimeVersion;
			mainModule.imageFlags = cdi.imageFlags;

			mainModule.specificRuntimeVersion = cme.runtimeVersion;


			// reading tables

			reader.setVirtualOffset(mes.tables.address);
			var tas = new TableStream();
			tas.module = mainModule;
			tas.assembly = assembly;
			tas.read(reader, mes);


			this.populateTypes(mainModule, tas.tables);

			if (tas.tables[TableKind.ExternalType]) {
				mainModule.debugExternalTypeReferences = tas.tables[TableKind.ExternalType];
			}
			
			this.populateMembers(
				tas.tables[TableKind.TypeDefinition],
				(parent: TypeDefinition) => parent.internalFieldList,
				(parent: TypeDefinition) => parent.fields,
				tas.tables[TableKind.FieldDefinition],
				(child: FieldDefinition) => child);

			this.populateMembers(
				tas.tables[TableKind.TypeDefinition],
				(parent: TypeDefinition) => parent.internalMethodList,
				(parent: TypeDefinition) => parent.methods,
				tas.tables[TableKind.MethodDefinition],
				(child: MethodDefinition) => child);

			this.populateMembers(
				tas.tables[TableKind.MethodDefinition],
				(parent: MethodDefinition) => parent.internalParamList,
				(parent: MethodDefinition) => parent.parameters,
				tas.tables[TableKind.ParameterDefinition],
				(child: ParameterDefinition) => child);

			reader.offset = saveOffset;
		}

		private populateTypes(mainModule: ModuleDefinition, tables: any[]) {
			mainModule.types = tables[TableKind.TypeDefinition];

			if (!mainModule.types)
				mainModule.types = [];

		}

		private populateMembers(
			parentTable: any[],
			getChildIndex: (parent: any) => number,
			getChildren: (parent: any) => any[],
			childTable: any[],
			getChildEntity: (child: any) => any) {
			if (!parentTable)
				return;

			var childIndex = 0;
			for (var iParent = 0; iParent < parentTable.length; iParent++) {
				var childCount =
					!childTable ? 0 :
					iParent + 1 < parentTable.length ?
						getChildIndex(parentTable[iParent + 1]) - 1 - childIndex :
						childTable.length - childIndex;

				var parent = parentTable[iParent];

				var children = getChildren(parent);

				children.length = childCount;

				for (var iChild = 0; iChild < childCount; iChild++) {
					var entity = getChildEntity(childTable[childIndex + iChild]);
					children[iChild] = entity;
				}

				childIndex += childCount;
			}
		}
	}
}