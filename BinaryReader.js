var FileBinaryReader = (function () {
    function FileBinaryReader(file) {
        this.offset = 0;
        this.file = file;
        this.reader = new FileReader();
    }
    FileBinaryReader.prototype.readArrayBufer = function (byteCount, onsuccessCore, onfailureCore) {
        var _this = this;
        var doneReadyState = 2;
        this.reader.onloadend = function () {
            _this.reader.onloadend = null;
            if(_this.reader.readyState != doneReadyState) {
                onfailureCore(new Error(_this.reader.error.name));
                return;
            }
            var resultArrayBuffer;
            var msg1 = "readArrayBufer completion: " + _this.offset + "+" + byteCount + " = ";
            _this.offset += byteCount;
            resultArrayBuffer = _this.reader.result;
            onsuccessCore(resultArrayBuffer);
        };
        var slice = this.file.slice(this.offset, this.offset + byteCount);
        if(this.offset != 0 || byteCount != this.file.size) {
            this.reader.readAsArrayBuffer(slice);
        } else {
            this.reader.readAsArrayBuffer(this.file);
        }
    };
    FileBinaryReader.prototype.readUint8 = function (count, onsuccess, onfailure) {
        this.readArrayBufer(count, function (arrayBuffer) {
            var result = new Uint8Array(arrayBuffer, 0, count);
            onsuccess(result);
        }, onfailure);
    };
    FileBinaryReader.prototype.readUint16 = function (count, onsuccess, onfailure) {
        this.readArrayBufer(count * 2, function (arrayBuffer) {
            var result = new Uint16Array(arrayBuffer, 0, count);
            onsuccess(result);
        }, onfailure);
    };
    FileBinaryReader.prototype.readUint32 = function (count, onsuccess, onfailure) {
        this.readArrayBufer(count * 4, function (arrayBuffer) {
            var result = new Uint32Array(arrayBuffer, 0, count);
            onsuccess(result);
        }, onfailure);
    };
    return FileBinaryReader;
})();
