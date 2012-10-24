/// <reference path="BinaryReader.ts" />
/// <reference path="AssemblyDefinition.ts" />

/// <reference path="PEFormat/PEFile.ts" />
/// <reference path="PEFormat/PEFileReader.ts" />

module Mi.PE {
    class AssemblyLoader {
        load(reader: BinaryReader): AssemblyDefinition {
            var assembly = new AssemblyDefinition();
            assembly.pe = new PEFormat.PEFile();

            return assembly;
        }
    }
}