/// <reference path="testPEFile.ts" />
/// <reference path="testDosHeader.ts" />
/// <reference path="testPEHeader.ts" />


/// <reference path="TestRunner.ts" />

TestRunner.runTests({
    test_PEFile: test_PEFile,
    test_DosHeader: test_DosHeader,
    test_PEHeader: test_PEHeader
});