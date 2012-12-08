/// <reference path="../MemberDefinitions.ts" />

module pe.managed {
    export function readModuleDefinition(_module: ModuleDefinition, reader: TableStreamReader) {
        _module.generation = reader.readShort();
        _module.name = reader.readString();
        _module.mvid = reader.readGuid();
        _module.encId = reader.readGuid();
        _module.encBaseId = reader.readGuid();
    }

    export function readTypeReference(typeReference: TypeReference, reader: TableStreamReader) {
        typeReference.resolutionScope = reader.readResolutionScope();
        typeReference.name = reader.readString();
        typeReference.namespace = reader.readString();
    }
}