/// <reference path="testDataDirectory.ts" />
/// <reference path="testLong.ts" />
/// <reference path="testDosHeader.ts" />
/// <reference path="testOptionalHeader.ts" />
/// <reference path="testPEFileHeaders.ts" />
/// <reference path="testPEHeader.ts" />
/// <reference path="testSectionHeader.ts" />
/// <reference path="testBinaryReader.ts" />
/// <reference path="testDataViewBinaryReader.ts" />
/// <reference path="testBufferBinaryReader.ts" />

/// <reference path="testPEFileHeaders_read_sampleExe.ts" />
/// <reference path="testPEFileHeaders_read_sample64Exe.ts" />
/// <reference path="testDosHeader_read_sampleExe.ts" />
/// <reference path="testDosHeader_read_sample64Exe.ts" />
/// <reference path="testDosHeader_read_MZ2345.ts" />
/// <reference path="testPEHeader_read_sampleExe.ts" />
/// <reference path="testPEHeader_read_sample64Exe.ts" />
/// <reference path="testPEHeader_read_PE004567.ts" />
/// <reference path="testOptionalHeader_read_sampleExe.ts" />
/// <reference path="testOptionalHeader_read_sample64Exe.ts" />
/// <reference path="testOptionalHeader_read_NT322345.ts" />

/// <reference path="testDllImport_read_sampleExe.ts" />
/// <reference path="testDllImport_read_012345.ts" />

/// <reference path="testResourceDirectory.ts" />
/// <reference path="testResourceDirectory_read_sampleExe.ts" />

/// <reference path="testClrDirectory.ts" />
/// <reference path="testClrDirectory_read_sampleExe.ts" />
/// <reference path="testClrDirectory_read_sample64Exe.ts" />

/// <reference path="testClrMetadata.ts" />
/// <reference path="testClrMetadata_read_sampleExe.ts" />
/// <reference path="testClrMetadata_read_sample64Exe.ts" />

/// <reference path="testMetadataStreams_read_sampleExe.ts" />
/// <reference path="testMetadataStreams_read_sample64Exe.ts" />

/// <reference path="testTableStream_read_sampleExe.ts" />
/// <reference path="testTableStream_read_monoCorlibDll.ts" />

/// <reference path="test_AssemblyReader_sampleExe.ts" />
/// <reference path="test_AssemblyReader_monoCorlibDll.ts" />

/// <reference path="test_FallbackDataView.ts" />
/// <reference path="test_BufferReader.ts" />
/// <reference path="test_BufferReader_arrays.ts" />

/// <reference path="TestRunner.ts" />

TestRunner.runTests({
	test_BufferReader: test_BufferReader,
	test_BufferReader_arrays: test_BufferReader_arrays,
	test_FallbackDataView: test_FallbackDataView,

    test_AssemblyReader_sampleExe: test_AssemblyReader_sampleExe,
    test_AssemblyReader_monoCorlibDll: test_AssemblyReader_monoCorlibDll,

    test_PEFileHeaders: test_PEFileHeaders,
    test_PEFileHeaders_read_sample64Exe: test_PEFileHeaders_read_sample64Exe,
    test_DosHeader: test_DosHeader,
    test_PEHeader: test_PEHeader,
    test_OptionalHeader: test_OptionalHeader,
    test_SectionHeader: test_SectionHeader,
    test_DataDirectory: test_DataDirectory,
    test_Long: test_Long,
    test_BinaryReader: test_BinaryReader,
    test_DataViewBinaryReader: test_DataViewBinaryReader,
    test_BufferBinaryReader: test_BufferBinaryReader,
    test_PEFileHeaders_read_sampleExe: test_PEFileHeaders_read_sampleExe,
    test_DosHeader_read_sampleExe: test_DosHeader_read_sampleExe,
	test_DosHeader_read2_sampleExe: test_DosHeader_read2_sampleExe,
    test_DosHeader_read_sample64Exe: test_DosHeader_read_sample64Exe,
    test_DosHeader_read_MZ2345: test_DosHeader_read_MZ2345,
    test_PEHeader_read_sampleExe: test_PEHeader_read_sampleExe,
    test_PEHeader_read_sample64Exe: test_PEHeader_read_sample64Exe,
    test_PEHeader_read_PE004567: test_PEHeader_read_PE004567,
    test_OptionalHeader_read_sampleExe: test_OptionalHeader_read_sampleExe,
    test_OptionalHeader_read_sample64Exe: test_OptionalHeader_read_sample64Exe,
    test_OptionalHeader_read_NT322345: test_OptionalHeader_read_NT322345,
    test_DllImport_read_sampleExe: test_DllImport_read_sampleExe,
    test_DllImport_read_012345: test_DllImport_read_012345,
    test_ResourceDirectory: test_ResourceDirectory,
    test_ResourceDirectory_read_sampleExe: test_ResourceDirectory_read_sampleExe,
    test_ClrDirectory: test_ClrDirectory,
    test_ClrDirectory_read_sampleExe: test_ClrDirectory_read_sampleExe,
    test_ClrDirectory_read_sample64Exe: test_ClrDirectory_read_sample64Exe,
    test_ClrMetadata: test_ClrMetadata,
    test_ClrMetadata_read_sampleExe: test_ClrMetadata_read_sampleExe,
    test_ClrMetadata_read_sample64Exe: test_ClrMetadata_read_sample64Exe,
    test_MetadataStreams_read_sampleExe: test_MetadataStreams_read_sampleExe,
    test_MetadataStreams_read_sample64Exe: test_MetadataStreams_read_sample64Exe,
    test_TableStream_read_sampleExe: test_TableStream_read_sampleExe,
    test_TableStream_read_monoCorlibDll: test_TableStream_read_monoCorlibDll
});