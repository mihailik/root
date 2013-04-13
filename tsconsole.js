var Controller = (function () {
    function Controller(_host, _global) {
        if (typeof _global === "undefined") { _global = window; }
        this._host = _host;
        this._global = _global;
        var _this = this;
        if (!this._host) {
            this._host = _global.document.body;

        }
        this._editor = CodeMirror(this._host, {
            mode: "text/typescript",
            matchBrackets: true,
            autoCloseBrackets: true,
            lineNumbers: true,
            extraKeys: {
                'Ctrl-Space': 'autocomplete'
            }
        });
        CodeMirror.commands.autocomplete = function () {
            return _this.autocomplete();
        };
    }
    Controller.prototype.autocomplete = function () {
        alert('ok');
    };
    return Controller;
})();
var TSHost = (function () {
    function TSHost() {
    }
    return TSHost;
})();
//@ sourceMappingURL=tsconsole.js.map
