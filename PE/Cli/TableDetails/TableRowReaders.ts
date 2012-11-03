/// <reference path="TableTypeDefinitions.ts" />

/// <reference path="../ReadStreams.ts" />
/// <reference path="../../IO/BinaryReader.ts" />

/// <reference path="../../ModuleDefinition.ts" />
/// <reference path="../../TypeReference.ts" />
/// <reference path="../../TypeDefinition.ts" />

/// <reference path="../TypeDefinitionBuilder.ts" />

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

    export function readTypeDefinition(typeDefinitionBuilder: TypeDefinitionBuilder, reader: Mi.PE.IO.BinaryReader, cliReader: CliReader) {
        typeDefinitionBuilder.type.attributes = reader.readInt();
        typeDefinitionBuilder.type.name = cliReader.readString();
        typeDefinitionBuilder.type.namespace = cliReader.readString();
        typeDefinitionBuilder.type.extendsType = cliReader.readTypeDefOrRef();
        typeDefinitionBuilder.fieldList = cliReader.readTableRowIndex(TableTypes.Field.index);
        typeDefinitionBuilder.methodList = cliReader.readTableRowIndex(TableTypes.MethodDef.index);
    }

    export function readFieldDefinition(fieldDefinition: FieldDefinition, reader: Mi.PE.IO.BinaryReader, cliReader: CliReader) {
        fieldDefinition.attributes = reader.readShort();
        fieldDefinition.name = cliReader.readString();
        fieldDefinition.signature = cliReader.readBlob();
    }
}