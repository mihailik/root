/// <reference path="TableTypes.ts" />

/// <reference path="../ReadStreams.ts" />
/// <reference path="../../IO/BinaryReader.ts" />

/// <reference path="../../ModuleDefinition.ts" />

module Mi.PE.Cli.TableDetails {
    export function readModuleDefinition(_module: ModuleDefinition, reader: Mi.PE.IO.BinaryReader, cliReader: CliReader) {
        _module.generation = reader.readShort();
        _module.name = cliReader.readString();
        _module.mvid = cliReader.readGuid();
        _module.encId = cliReader.readGuid();
        _module.encBaseId = cliReader.readGuid();
    }
}