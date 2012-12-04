/// <reference path="../pe.ts" />

module test_DataDirectory {

    export function constructor_succeeds() {
        var dd = new pe.headers.AddressRange(0, 0);
    }

    export function constructor_assigns_address_654201() {
        var dd = new pe.headers.AddressRange(654201, 0);
        if (dd.address !== 654201)
            throw dd.address;
    }

    export function constructor_assigns_size_900114() {
        var dd = new pe.headers.AddressRange(0, 900114);
        if (dd.size !== 900114)
            throw dd.size;
    }

    export function toString_0xCEF_0x36A() {
        var dd = new pe.headers.AddressRange(0xCEF, 0x36A);
        if (dd.toString() !== "CEF:36Ah")
            throw dd.toString();
    }

    export function contains_default_0_false() {
        var dd = new pe.headers.AddressRange(0, 0);
        if (dd.contains(0) !== false)
            throw dd.contains(0);
    }

    export function contains_default_64_false() {
        var dd = new pe.headers.AddressRange(0, 0);
        if (dd.contains(64) !== false)
            throw dd.contains(64);
    }

    export function contains_default_minus64_false() {
        var dd = new pe.headers.AddressRange(0, 0);
        if (dd.contains(-64) !== false)
            throw dd.contains(-64);
    }

    export function contains_lowerEnd_below_false() {
        var dd = new pe.headers.AddressRange(10, 20);
        if (dd.contains(9) !== false)
            throw dd.contains(9);
    }

    export function contains_lowerEnd_equal_true() {
        var dd = new pe.headers.AddressRange(10, 20);
        if (dd.contains(10) !== true)
            throw dd.contains(10);
    }

    export function contains_lowerEnd_above_true() {
        var dd = new pe.headers.AddressRange(10, 20);
        if (dd.contains(11) !== true)
            throw dd.contains(11);
    }

    export function contains_lowerEndPlusSize_above_false() {
        var dd = new pe.headers.AddressRange(10, 20);
        if (dd.contains(31) !== false)
            throw dd.contains(31);
    }

    export function contains_lowerEndPlusSize_equal_false() {
        var dd = new pe.headers.AddressRange(10, 20);
        if (dd.contains(30) !== false)
            throw dd.contains(30);
    }

    export function contains_lowerEndPlusSize_below_true() {
        var dd = new pe.headers.AddressRange(10, 20);
        if (dd.contains(29) !== true)
            throw dd.contains(29);
    }
}