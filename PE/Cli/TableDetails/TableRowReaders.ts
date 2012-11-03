/// <reference path="../ReadStreams.ts" />
/// <reference path="../../IO/BinaryReader.ts" />

/// <reference path="../../ModuleDefinition.ts" />

module Mi.PE.Cli.TableDetails {
    export function readModuleDefinition(_module: ModuleDefinition, streams: ReadStreams, reader: Mi.PE.IO.BinaryReader) {
        _module.generation = reader.readShort();
        _module.name = streams.readString(reader);
        _module.mvid = streams.readGuid(reader);
        _module.encId = streams.readGuid(reader);
        _module.encBaseId = streams.readGuid(reader);
    }
}