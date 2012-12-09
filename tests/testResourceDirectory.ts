/// <reference path="../pe.ts" />

module test_ResourceDirectory {

    export function constructor_succeeds() {
        var dr = new pe.unmanaged.ResourceDirectory();
    }

    export function characterstics_default_0() {
        var dr = new pe.unmanaged.ResourceDirectory();

        if (dr.characteristics !== 0)
            throw dr.characteristics;
    }

    export function timestamp_default_null() {
        var dr = new pe.unmanaged.ResourceDirectory();

        if (dr.timestamp !== null)
            throw dr.characteristics;
    }

    export function version_default_emptyString() {
        var dr = new pe.unmanaged.ResourceDirectory();

        if (dr.version !== "")
            throw dr.version;
    }

    export function subdirectories_default_length_0() {
        var dr = new pe.unmanaged.ResourceDirectory();

        if (dr.subdirectories.length !== 0)
            throw dr.subdirectories.length;
    }

    export function dataEntries_default_length_0() {
        var dr = new pe.unmanaged.ResourceDirectory();

        if (dr.dataEntries.length !== 0)
            throw dr.dataEntries.length;
    }
}