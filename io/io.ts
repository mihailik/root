/// <reference path="BinaryReader.ts" />
/// <reference path="DataViewBinaryReader.ts" />
/// <reference path="BufferBinaryReader.ts" />
/// <reference path="RvaBinaryReader.ts" />

module pe.io {
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

    declare var VBArray;

    export function getUrlBinaryReader(
        url: string,
        onsuccess: (BinaryReader) => void,
        onfailure: (Error) => void ) {

        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        var requestLoadCompleteCalled = false;
        function requestLoadComplete() {
            if (requestLoadCompleteCalled)
                return;

            requestLoadCompleteCalled = true;

            var result: BinaryReader;

            try {
                var response: ArrayBuffer = request.response;
                if (response) {
                    var resultDataView = new DataView(response);
                    result = new DataViewBinaryReader(resultDataView);
                }
                else {
                    var responseBody: number[] = new VBArray(request.responseBody).toArray();
                    var result = new BufferBinaryReader(responseBody);
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
}