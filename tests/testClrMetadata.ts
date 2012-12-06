/// <reference path="../pe.ts" />

module test_ClrMetadata {

    export function constructor_succeeds() {
        var cdi = new pe.managed.metadata.ClrMetadata();
    }

    export function mdSignature_default_Signature() {
        var cme = new pe.managed.metadata.ClrMetadata();
        if (cme.mdSignature !== pe.managed.metadata.ClrMetadataSignature.Signature)
            throw cme.mdSignature;
    }

    export function metadataVersion_default_emptyString() {
        var cme = new pe.managed.metadata.ClrMetadata();
        if (cme.metadataVersion !== "")
            throw cme.metadataVersion;
    }

    export function metadataVersionString_default_emptyString() {
        var cme = new pe.managed.metadata.ClrMetadata();
        if (cme.metadataVersionString !== "")
            throw cme.metadataVersionString;
    }

    export function mdReserved_default_0() {
        var cme = new pe.managed.metadata.ClrMetadata();
        if (cme.mdReserved !== 0)
            throw cme.mdReserved;
    }

    export function mdFlags_default_0() {
        var cme = new pe.managed.metadata.ClrMetadata();
        if (cme.mdFlags !== 0)
            throw cme.mdFlags;
    }

    export function streamCount_default_0() {
        var cme = new pe.managed.metadata.ClrMetadata();
        if (cme.streamCount !== 0)
            throw cme.streamCount;
    }
}