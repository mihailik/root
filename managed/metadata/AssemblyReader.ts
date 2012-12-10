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
            this.populateFields(mainModule, tas.tables);
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

        private populateFields(mainModule: ModuleDefinition, tables: any[]) {
            var typeDefTable: TypeDef[] = tables[TableKind.TypeDef];
            var fieldTable: Field[] = tables[TableKind.Field];

            if (!typeDefTable)
                return;

            var fieldIndex = 0;
            for (var i = 0; i < mainModule.types.length; i++) {
                var fieldCount =
                    !fieldTable ? 0 :
                    i == mainModule.types.length - 1 ? 0 :
                    typeDefTable[i + 1].fieldList - fieldIndex + 1;

                var type = mainModule.types[i];

                if (type.fields)
                    type.fields.length = fieldCount;
                else
                    type.fields = Array(fieldCount);

                for (var iField = 0; iField < fieldCount; iField++) {
                    type.fields[iField] = fieldTable[fieldIndex + iField].fieldDefinition;
                }

                fieldIndex += fieldCount;
            }
        }

        private populateMembers(
            mainModule: ModuleDefinition,
            parentTable: any[], childIndexProperty: string,
            childTable: any[], childEntityProperty: string,
            getChildren: (parent: any) => any[]) {
            if (!parentTable)
                return;

            var childIndex = 0;
            for (var iParent = 0; iParent < parentTable.length; iParent++) {
                var childCount =
                    !childTable ? 0 :
                    iParent == parentTable.length - 1 ? 0 :
                    parentTable[iParent + 1][childIndexProperty] - childIndex + 1;

                var parent = parentTable[iParent];

                var children = getChildren(parent);

                children.length = childCount;

                for (var iChild = 0; iChild < childCount; iChild++) {
                    var entity = childTable[childIndex + iChild][childEntityProperty];
                    children[iChild] = entity;
                }

                childIndex += childCount;
            }
        }
    }
}