/// <reference path="AddressRange.ts" />
/// <reference path="BufferReader.ts" />

module pe.io {
    export function getFileBufferReader(
        file: File,
        onsuccess: (BufferReader) => void,
        onfailure: (Error) => void ) {
        
        var reader = new FileReader();
        
        reader.onerror = onfailure;
        reader.onloadend = () => {
            if (reader.readyState != 2) {
                onfailure(reader.error);
                return;
            }

            var result: BufferReader;

            try {
                var resultArrayBuffer: ArrayBuffer;
                resultArrayBuffer = reader.result;

                var resultDataView = new DataView(resultArrayBuffer);

                result = new BufferReader(resultDataView);
            }
            catch (error) {
                onfailure(error);
            }

            onsuccess(result);
        };

        reader.readAsArrayBuffer(file);
    }

    declare var VBArray;

    export function getUrlBufferReader(
        url: string,
        onsuccess: (BufferReader) => void,
        onfailure: (Error) => void ) {

        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        var requestLoadCompleteCalled = false;
        function requestLoadComplete() {
            if (requestLoadCompleteCalled)
                return;

            requestLoadCompleteCalled = true;

            var result: BufferReader;

            try {
                var response: ArrayBuffer = request.response;
                if (response) {
                    var resultDataView = new DataView(response);
                    result = new BufferReader(resultDataView);
                }
                else {
                    var responseBody: number[] = new VBArray(request.responseBody).toArray();
                    var result = new BufferReader(responseBody);
                }
            }
            catch (error) {
                onfailure(error);
                return;
            }

            onsuccess(result);
        };

        request.onerror = onfailure;
        request.onloadend = () => requestLoadComplete;
        request.onreadystatechange = () => {
            if (request.readyState == 4) {
                requestLoadComplete();
            }
        };

        request.send();
    }

    export function bytesToHex(bytes: Uint8Array): string {
        if (!bytes)
            return null;
        
        var result = "";
        for (var i = 0; i < bytes.length; i++) {
            var hex = bytes[i].toString(16).toUpperCase();
            if (hex.length==1)
                hex = "0" + hex;
            result += hex;
        }
        return result;
    }

    export function formatEnum(value, type): string {
        if (!value) {
            if (typeof value == "null")
                return "null";
            else if (typeof value == "undefined")
                return "undefined";
        }

        var textValue = null;

        if (type._map) {
            textValue = type._map[value];

            if (!type._map_fixed) {
                // fix for typescript bug
                for (var e in type) {
                    var num = type[e];
                    if (typeof num=="number")
                        type._map[num] = e;
                }
                type._map_fixed = true;

                textValue = type._map[value];
            }
        }
        
        if (textValue == null) {
            if (typeof value == "number") {
                var enumValues = [];
                var accountedEnumValueMask = 0;
                var zeroName = null;
                for (var kvValueStr in type._map) {
                    var kvValue;
                    try { kvValue = Number(kvValueStr); }
                    catch (errorConverting) { continue; }

                    if (kvValue == 0) {
                        zeroName = kvKey;
                        continue;
                    }

                    var kvKey = type._map[kvValueStr];
                    if (typeof kvValue != "number")
                        continue;

                    if ((value & kvValue) == kvValue) {
                        enumValues.push(kvKey);
                        accountedEnumValueMask = accountedEnumValueMask | kvValue;
                    }
                }

                var spill = value & accountedEnumValueMask;
                if (!spill)
                    enumValues.push("#" + spill.toString(16).toUpperCase() + "h");

                if (enumValues.length == 0) {
                    if (zeroName)
                        textValue = zeroName;
                    else
                        textValue = "0";
                }
                else {
                    textValue = enumValues.join('|');
                }
            }
            else {
                textValue = "enum:" + value;
            }
        }

        return textValue;
    }
}