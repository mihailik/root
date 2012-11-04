/// <reference path="../ModuleDefinition.ts" />

/// <reference path="../IO/BinaryReader.ts" />

/// <reference path="ReadClrDirectory.ts" />
/// <reference path="ReadClrMetadata.ts" />
/// <reference path="ReadStreams.ts" />
/// <reference path="ReadTables.ts" />
/// <reference path="Tables/TypeDef.ts" />

module Mi.PE.Cli.ModuleReader {

    export function readModule(_module: ModuleDefinition, reader: Mi.PE.IO.BinaryReader) {
        var clrDirectory = new ReadClrDirectory(_module, reader);
        var clrMetadata = new ReadClrMetadata(_module, clrDirectory, reader);
        var streams = new ReadStreams(_module, clrDirectory.metadataDir, clrMetadata.streamCount, reader);
        var tables = new ReadTables(_module, streams, reader);

        var typeDefinitions: Tables.TypeDef[] = tables.tables[TableTypes.TypeDef.index];
        if (typeDefinitions) {
            _module.types = Array(typeDefinitions.length);

            var fieldDefinitions: Tables.FieldDef[] = tables.tables[TableTypes.Field.index];

            var lastFieldIndex = 0;
            for (var i = 0; i < typeDefinitions.length; i++) {
                _module.types[i] = typeDefinitions[i].type;

                if (fieldDefinitions) {
                    var nextFieldIndex = typeDefinitions[i].fieldList;

                    if (i > 0) {
                        var fieldDefs = fieldDefinitions.slice(lastFieldIndex, nextFieldIndex);
                        typeDefinitions[i - 1].type.fields = Array(fieldDefs.length);
                        for (var j = 0; j < fieldDefs.length; j++) {
                            typeDefinitions[i - 1].type.fields[j] = fieldDefinitions[j].field;
                        }
                    }

                    lastFieldIndex = nextFieldIndex;
                }
            }

            if (typeDefinitions.length > 0) {
                if (fieldDefinitions) {
                    var fieldDefs = fieldDefinitions.slice(lastFieldIndex, fieldDefinitions.length - 1);
                        typeDefinitions[typeDefinitions.length - 1].type.fields = Array(fieldDefs.length);
                        for (var j = 0; j < fieldDefs.length; j++) {
                            typeDefinitions[typeDefinitions.length - 1].type.fields[j] = fieldDefinitions[j].field;
                        }
                }
            }
        }
    }
}