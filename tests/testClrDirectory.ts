/// <reference path="../pe.ts" />

module test_ClrDirectory {

    export function constructor_succeeds() {
        var cdi = new pe.managed.metadata.ClrDirectory();
    }

    export function cb_default_0() {
        var cdi = new pe.managed.metadata.ClrDirectory();
        if (cdi.cb !== 0)
            throw cdi.cb;
    }

    export function runtimeVersion_default_emptyString() {
        var cdi = new pe.managed.metadata.ClrDirectory();
        if (cdi.runtimeVersion !== "")
            throw cdi.runtimeVersion;
    }

    export function imageFlags_default_0() {
        var cdi = new pe.managed.metadata.ClrDirectory();
        if (cdi.imageFlags !== 0)
            throw cdi.imageFlags;
    }

    export function metadataDir_default_null() {
        var cdi = new pe.managed.metadata.ClrDirectory();
        if (cdi.metadataDir !== null)
            throw cdi.metadataDir;
    }

    export function entryPointToken_default_0() {
        var cdi = new pe.managed.metadata.ClrDirectory();
        if (cdi.entryPointToken !== 0)
            throw cdi.entryPointToken;
    }

    export function resourcesDir_default_null() {
        var cdi = new pe.managed.metadata.ClrDirectory();
        if (cdi.resourcesDir !== null)
            throw cdi.resourcesDir;
    }
}