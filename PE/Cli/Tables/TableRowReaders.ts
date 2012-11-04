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

    export function readTypeDef(typeDef: TypeDef, reader: Mi.PE.IO.BinaryReader, cliReader: CliReader) {
        typeDef.type.attributes = reader.readInt();
        typeDef.type.name = cliReader.readString();
        typeDef.type.namespace = cliReader.readString();
        typeDef.type.extendsType = cliReader.readTypeDefOrRef();
        typeDef.fieldList = cliReader.readTableRowIndex(TableTypes.Field.index);
        typeDef.methodList = cliReader.readTableRowIndex(TableTypes.MethodDef.index);
    }

    export function readFieldDef(fieldDef: FieldDef, reader: Mi.PE.IO.BinaryReader, cliReader: CliReader) {
        fieldDef.field.attributes = reader.readShort();
        fieldDef.field.name = cliReader.readString();
        fieldDef.signature = cliReader.readBlob();
    }

    export function readMethodDef(methodDef: MethodDef, reader: Mi.PE.IO.BinaryReader, cliReader: CliReader) {
        methodDef.rva = reader.readInt();
        methodDef.method.implAttributes = reader.readShort();
        methodDef.method.attributes = reader.readShort();
        methodDef.method.name = cliReader.readString();
        methodDef.signature = cliReader.readBlob();
        methodDef.paramList = cliReader.readTableRowIndex(TableTypes.Param.index);
    }
}