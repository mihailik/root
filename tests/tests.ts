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
/// <reference path="testDosHeader_read.ts" />


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
    test_DosHeader_read: test_DosHeader_read
});