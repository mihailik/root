/// <reference path="TableTypeDefinitions.ts" />

/// <reference path="../ReadStreams.ts" />
/// <reference path="../../IO/BinaryReader.ts" />

/// <reference path="../../ModuleDefinition.ts" />
/// <reference path="../../TypeReference.ts" />
/// <reference path="../../TypeDefinition.ts" />

module Mi.PE.Cli.TableDetails {
    export function readModuleDefinition(_module: ModuleDefinition, reader: Mi.PE.IO.BinaryReader, cliReader: CliReader) {
        _module.generation = reader.readShort();
        _module.name = cliReader.readString();
        _module.mvid = cliReader.readGuid();
        _module.encId = cliReader.readGuid();
        _module.encBaseId = cliReader.readGuid();
    }

    export function readTypeReference(typeReference: TypeReference, reader: Mi.PE.IO.BinaryReader, cliReader: CliReader) {
        typeReference.resolutionScope = cliReader.readResolutionScope();
        typeReference.name = cliReader.readString();
        typeReference.namespace = cliReader.readString();
    }

    export function readTypeDefinition(typeDefinition: TypeDefinition, reader: Mi.PE.IO.BinaryReader, cliReader: CliReader) {
            typeDefinition.attributes = reader.readInt();
            typeDefinition.name = cliReader.readString();
            typeDefinition.namespace = cliReader.readString();
            typeDefinition.extendsType = cliReader.readTypeDefOrRef();
            var fieldList = cliReader.readTableRowIndex(TableTypes.Field.index);
            var methodList = cliReader.readTableRowIndex(TableTypes.MethodDef.index);
    }
}