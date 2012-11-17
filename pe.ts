/// <reference path="PEFile.ts" />
/// <reference path="io.ts" />

declare var exports;

exports = {
    PEFile: PEFile,
    io: {
        BinaryReader: io.BinaryReader,
        DataViewBinaryReader: io.DataViewBinaryReader
    }
};