/// <reference path="../DataDirectory.ts" />

module test_DataDirectory {

    export function constructor_succeeds() {
        var dd = new pe.DataDirectory(0, 0);
    }

    export function constructor_assigns_address_654201() {
        var dd = new pe.DataDirectory(654201, 0);
        if (dd.address !== 654201)
            throw dd.address;
    }

    export function constructor_assigns_size_900114() {
        var dd = new pe.DataDirectory(0, 900114);
        if (dd.size !== 900114)
            throw dd.size;
    }

    export function toString_0xCEF_0x36A() {
        var dd = new pe.DataDirectory(0xCEF, 0x36A);
        if (dd.toString() !== "CEF:36Ah")
            throw dd.toString();
    }
}