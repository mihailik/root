/// <reference path="TableTypeDefinitions.ts" />

/// <reference path="../ReadStreams.ts" />
/// <reference path="../../IO/BinaryReader.ts" />

/// <reference path="../../ModuleDefinition.ts" />
/// <reference path="../../TypeReference.ts" />
/// <reference path="../../TypeDefinition.ts" />

/// <reference path="TypeDef.ts" />
/// <reference path="FieldDef.ts" />
/// <reference path="MethodDef.ts" />

module Mi.PE.Cli.Tables {
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
}