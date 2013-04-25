var SimpleConsole = (function () {
    function SimpleConsole(_host, _global) {
        if (typeof _global === "undefined") { _global = window; }
        this._host = _host;
        this._global = _global;
        if (typeof this._host === 'undefined')
            this._host = this._global.document.body;
        this._editor = (this._global).CodeMirror(this._host, {
            mode: "text/typescript",
            matchBrackets: true,
            autoCloseBrackets: true,
            lineNumbers: true
        });
    }
    return SimpleConsole;
})();
var CodeMirrorDocScriptSnapshot = (function () {
    function CodeMirrorDocScriptSnapshot(_doc) {
        var _this = this;
        this._doc = _doc;
        this._earlyChange = null;
        this._changes = [];
        CodeMirror.on(this._doc, 'beforeChange', function (doc, change) {
            return _this._docBeforeChanged(change);
        });
        CodeMirror.off(this._doc, 'change', function (doc, change) {
            return _this._docChanged(change);
        });
    }
    CodeMirrorDocScriptSnapshot.prototype.getText = function (start, end) {
        return this._doc.getValue();
    };
    CodeMirrorDocScriptSnapshot.prototype.getLength = function () {
        return this._doc.getValue().length;
    };
    CodeMirrorDocScriptSnapshot.prototype.getLineStartPositions = function () {
        var _this = this;
        var result = [];
        var pos = {
            line: 0,
            ch: 0
        };
        this._doc.eachLine(function (line) {
            pos.line = result.length;
            var lineStartPosition = _this._doc.indexFromPos(pos);
            result.push(lineStartPosition);
        });
        return result;
    };
    CodeMirrorDocScriptSnapshot.prototype.getTextChangeRangeSinceVersion = function (scriptVersion) {
        var textChanges = [];
        for (var i = scriptVersion; i < this._changes.length; i++) {
            var ch = this._changes[i];
            var span = new TypeScript.TextSpan(ch.from, ch.to - ch.from);
            var tc = new TypeScript.TextChangeRange(span, ch.newLength);
            textChanges.push(tc);
        }
        var result = TypeScript.TextChangeRange.collapseChangesAcrossMultipleVersions(textChanges);
        return result;
    };
    CodeMirrorDocScriptSnapshot.prototype._docBeforeChanged = function (change) {
        var from = this._doc.indexFromPos(change.from);
        var to = this._doc.indexFromPos(change.to);
        this._earlyChange = { from: from, to: to };
    };
    CodeMirrorDocScriptSnapshot.prototype._docChanged = function (change) {
        if (!this._earlyChange)
            return;
        var newFromPosition = change.from;
        var newToPosition = !change.text || change.text.length === 0 ? change.from : {
            line: change.from.line + change.text.length,
            ch: (change.to.line == change.from.line ? change.from.ch : 0) + change.text[change.text.length - 1].length
        };
        var newLength = this._doc.indexFromPos(newToPosition) - this._doc.indexFromPos(newFromPosition);
        this._changes.push({
            from: this._earlyChange.from,
            to: this._earlyChange.to,
            newLength: newLength
        });
    };
    return CodeMirrorDocScriptSnapshot;
})();
var LanguageHost = (function () {
    function LanguageHost() {
        this._compilationSettings = new TypeScript.CompilationSettings();
        this.implicitFiles = {};
        this.mainFileName = 'main.ts';
        this.mainFile = {};
        this.loggerSwitches = {
            information: true,
            debug: true,
            warning: true,
            error: true,
            fatal: true
        };
        this.logLines = [];
    }
    LanguageHost.prototype.getCompilationSettings = function () {
        return this._compilationSettings;
    };
    LanguageHost.prototype.getScriptFileNames = function () {
        var result = Object.keys(this.implicitFiles);
        result.push(this.mainFileName);
        return result;
    };
    LanguageHost.prototype.getScriptVersion = function (fileName) {
        if (fileName === this.mainFileName)
            return 1; else if (this.implicitFiles[fileName])
            return 0; else
            return -1;
    };
    LanguageHost.prototype.getScriptIsOpen = function (fileName) {
        return true;
    };
    LanguageHost.prototype.getScriptSnapshot = function (fileName) {
        return null;
    };
    LanguageHost.prototype.getDiagnosticsObject = function () {
        var _this = this;
        return {
            log: function (txt) {
                return _this.log('lang: ' + txt);
            }
        };
    };
    LanguageHost.prototype.information = function () {
        return this.loggerSwitches.information;
    };
    LanguageHost.prototype.debug = function () {
        return this.loggerSwitches.debug;
    };
    LanguageHost.prototype.warning = function () {
        return this.loggerSwitches.warning;
    };
    LanguageHost.prototype.error = function () {
        return this.loggerSwitches.error;
    };
    LanguageHost.prototype.fatal = function () {
        return this.loggerSwitches.fatal;
    };
    LanguageHost.prototype.log = function (s) {
        this.logLines.push(s);
        console.log(s);
    };
    return LanguageHost;
})();
//@ sourceMappingURL=tsconsole.js.map
