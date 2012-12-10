/// <reference path="../MemberDefinitions.ts" />
/// <reference path="../../headers/PEFile.ts" />

module pe.managed.metadata {
    export class AssemblyReader {
        
        read(reader: io.BinaryReader, assembly: AssemblyDefinition) {
            if (!assembly.headers) {
                assembly.headers = new headers.PEFile();
                assembly.headers.read(reader);
            }

            // main reader over virtual address space
            var rvaReader = new pe.io.RvaBinaryReader(
                reader,
                assembly.headers.optionalHeader.dataDirectories[headers.DataDirectoryKind.Clr].address,
                assembly.headers.sectionHeaders);

            // read main managed headers

            var cdi = new ClrDirectory();
            cdi.read(rvaReader);

            var cmeReader = rvaReader.readAtOffset(cdi.metadataDir.address);
            var cme = new ClrMetadata();
            cme.read(cmeReader);

            var mes = new MetadataStreams();
            mes.read(cdi.metadataDir.address, cme.streamCount, cmeReader);

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

            var tbReader = cmeReader.readAtOffset(mes.tables.address);
            var tas = new TableStream();
            tas.read(tbReader, mes, mainModule, assembly);


            this.populateTypes(mainModule, tas.tables);
            
            this.populateMembers(
                tas.tables[TableKind.TypeDef],
                (parent: TypeDef) => parent.fieldList,
                (parent: TypeDef) => parent.typeDefinition.fields,
                tas.tables[TableKind.Field],
                (child: Field) => child.fieldDefinition);

            this.populateMembers(
                tas.tables[TableKind.TypeDef],
                (parent: TypeDef) => parent.methodList,
                (parent: TypeDef) => parent.typeDefinition.methods,
                tas.tables[TableKind.MethodDef],
                (child: MethodDef) => child.methodDefinition);

            this.populateMembers(
                tas.tables[TableKind.MethodDef],
                (parent: MethodDef) => parent.paramList,
                (parent: MethodDef) => parent.methodDefinition.parameters,
                tas.tables[TableKind.Param],
                (child: Param) => child.parameterDefinition);
        }

        private populateTypes(mainModule: ModuleDefinition, tables: any[]) {
            if (!mainModule.types)
                mainModule.types = [];

            var typeDefTable: TypeDef[] = tables[TableKind.TypeDef];
            if (typeDefTable) {
                mainModule.types.length = typeDefTable.length;
                for (var i = 0; i < mainModule.types.length; i++) {
                    mainModule.types[i] = typeDefTable[i].typeDefinition;
                }
            }
            else {
                mainModule.types.length = 0;
            }
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
                    iParent == parentTable.length - 1 ? 0 :
                    getChildIndex(parentTable[iParent + 1]) - childIndex + 1;

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