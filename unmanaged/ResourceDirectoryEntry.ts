/// <reference path="../pe.ts" />
/// <reference path="ResourceDirectory.ts" />

module pe.unmanaged {
    export class ResourceDirectoryEntry {
        name: string;
        integerId: number;

        directory: ResourceDirectory;
    }
}