/// <reference path="BinaryReader.ts" />
/// <reference path="DataViewBinaryReader.ts" />

module Mi.PE.IO {
    export function getFileBinaryReader(
        file: File,
        onsuccess: (BinaryReader) => void,
        onfailure: (Error) => void ) {
        
        var reader = new FileReader();
        
        reader.onerror = onfailure;
        reader.onloadend = () => {
            if (reader.readyState != 2) {
                onfailure(reader.error);
                return;
            }

            var result: DataViewBinaryReader;

            try {
                var resultArrayBuffer: ArrayBuffer;
                resultArrayBuffer = reader.result;

                var resultDataView = new DataView(resultArrayBuffer);

                result = new DataViewBinaryReader(resultDataView);
            }
            catch (error) {
                onfailure(error);
            }

            onsuccess(result);
        };

        reader.readAsArrayBuffer(file);
    }

    export function getUrlBinaryReader(
        url: string,
        onsuccess: (BinaryReader) => void,
        onfailure: (Error) => void ) {

        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        request.onerror = onfailure;
        request.onloadend = () => {
            var result: DataViewBinaryReader;

            try {
                var response: ArrayBuffer = request.response;
                var resultDataView = new DataView(response);
                result = new DataViewBinaryReader(resultDataView);
            }
            catch (error) {
                onfailure(error);
                return;
            }

            onsuccess(result);
        };

        request.send();
    }

    export function readZeroFilledString(reader: Mi.PE.IO.BinaryReader, maxLength: number) {
        var chars = "";

        for (var i = 0; i < maxLength; i++) {
            var charCode = reader.readByte();

            if (i>chars.length
                || charCode == 0)
                continue;

            chars += String.fromCharCode(charCode);
        }
            
        return chars;
    }
}