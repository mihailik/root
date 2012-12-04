/// <reference path="testDataDirectory.ts" />
/// <reference path="testLong.ts" />
/// <reference path="testDosHeader.ts" />
/// <reference path="testOptionalHeader.ts" />
/// <reference path="testPEFile.ts" />
/// <reference path="testPEHeader.ts" />
/// <reference path="testSectionHeader.ts" />
/// <reference path="testBinaryReader.ts" />
/// <reference path="testDataViewBinaryReader.ts" />
/// <reference path="testBufferBinaryReader.ts" />

/// <reference path="testPEFile_read.ts" />
/// <reference path="testDosHeader_read_sampleExe.ts" />
/// <reference path="testDosHeader_read_MZ2345.ts" />
/// <reference path="testPEHeader_read_sampleExe.ts" />
/// <reference path="testPEHeader_read_PE004567.ts" />
/// <reference path="testOptionalHeader_read_sampleExe.ts" />
/// <reference path="testOptionalHeader_read_NT322345.ts" />

/// <reference path="testDllImport_read_sampleExe.ts" />

/// <reference path="TestRunner.ts" />

TestRunner.runTests({
    test_PEFile: test_PEFile,
    test_DosHeader: test_DosHeader,
    test_PEHeader: test_PEHeader,
    test_OptionalHeader: test_OptionalHeader,
    test_SectionHeader: test_SectionHeader,
    test_DataDirectory: test_DataDirectory,
    test_Long: test_Long,
    test_BinaryReader: test_BinaryReader,
    test_DataViewBinaryReader: test_DataViewBinaryReader,
    test_BufferBinaryReader: test_BufferBinaryReader,
    test_PEFile_read: test_PEFile_read,
    test_DosHeader_read_sampleExe: test_DosHeader_read_sampleExe,
    test_DosHeader_read_012345: test_DosHeader_read_MZ2345,
    test_PEHeader_read_sampleExe: test_PEHeader_read_sampleExe,
    test_PEHeader_read_PE004567: test_PEHeader_read_PE004567,
    test_OptionalHeader_read_sampleExe: test_OptionalHeader_read_sampleExe,
    test_OptionalHeader_read_NT322345: test_OptionalHeader_read_NT322345,
    test_DllImport_read: test_DllImport_read
});