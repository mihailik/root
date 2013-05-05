var SplitController = (function () {
    function SplitController(_host, _global) {
        if (typeof _global === "undefined") { _global = window; }
        var _this = this;
        this._host = _host;
        this._global = _global;
        this._splitterPosition = 0.3;
        if (typeof this._host === 'undefined')
            this._host = this._global.document.body;

        this.left = _global.document.createElement('div');
        this.right = _global.document.createElement('div');
        this._outerSplitter = _global.document.createElement('div');
        this._innerSplitter = _global.document.createElement('div');
        this._splitterHandle = _global.document.createElement('div');

        this._applyLeftStyle(this.left.style);
        this._applyRightStyle(this.right.style);
        this._applyOuterSplitterStyle(this._outerSplitter.style);
        this._applyInnerSplitterStyle(this._innerSplitter.style);
        this._applySplitterHandleStyle(this._splitterHandle.style);

        this._innerSplitter.appendChild(this._splitterHandle);
        this._outerSplitter.appendChild(this._innerSplitter);

        this._host.appendChild(this.left);
        this._host.appendChild(this.right);
        this._host.appendChild(this._outerSplitter);

        this._isMouseDown = false;
        this._lastMouseX = -1;
        this._outerSplitter.onmousedown = function (e) {
            return _this._mouseDown(e || _global.event);
        };
        this._outerSplitter.ontouchstart = function (e) {
            return _this._mouseDown(e || _global.event);
        };
        this._mouseMoveClosure = function (e) {
            return _this._mouseMove(e || _global.event);
        };

        this._outerSplitter.onmouseup = function (e) {
            return _this._mouseUp(e || _global.event);
        };
        this._outerSplitter.ontouchend = function (e) {
            return _this._mouseUp(e || _global.event);
        };
    }
    SplitController.prototype.getSplitterPosition = function () {
        return this._splitterPosition;
    };

    SplitController.prototype.setSplitterPosition = function (value) {
        this._splitterPosition = Number(value);
        this.left.style.width = (this._splitterPosition * 100) + '%';
        this.right.style.width = ((1 - this._splitterPosition) * 100) + '%';
        this._outerSplitter.style.left = (this._splitterPosition * 100) + '%';
    };

    SplitController.prototype._applyLeftStyle = function (s) {
        s.position = 'absolute';
        s.left = s.top = s.bottom = '0px';
        s.width = '30%';
    };

    SplitController.prototype._applyRightStyle = function (s) {
        s.position = 'absolute';
        s.right = s.top = s.bottom = '0px';
        s.width = '70%';

        s.background = 'white';
    };

    SplitController.prototype._applyOuterSplitterStyle = function (s) {
        s.position = 'absolute';
        s.top = s.bottom = '0px';
        s.left = '30%';
        s.width = '0px';
        s.zIndex = '20000';
    };

    SplitController.prototype._applyInnerSplitterStyle = function (s) {
        s.position = 'absolute';
        s.top = s.bottom = '0px';
        s.left = '-5px';
        s.width = '10px';
        s.cursor = 'e-resize';

        s.background = 'transparent';
    };

    SplitController.prototype._applyHighlightedSplitterStyle = function (s) {
        s.background = 'rgba(0,0,0,0.1)';
    };

    SplitController.prototype._applySplitterHandleStyle = function (s) {
        s.position = 'absolute';
        s.left = s.right = '4.5px';
        s.top = s.bottom = '0px';

        s.background = 'silver';
    };

    SplitController.prototype._mouseDown = function (e) {
        this._isMouseDown = true;
        this._lastMouseX = e.x;
        e.cancelBubble = true;
        this._applyHighlightedSplitterStyle(this._innerSplitter.style);

        if (this._global.addEventListener) {
            this._global.addEventListener('mousemove', this._mouseMoveClosure, false);
            this._global.addEventListener('touchmove', this._mouseMoveClosure, false);
        } else if (this._global.attachEvent) {
            this._global.attachEvent('onmousemove', this._mouseMoveClosure);
            this._global.attachEvent('ontouchmove', this._mouseMoveClosure);
        }

        return false;
    };

    SplitController.prototype._mouseMove = function (e) {
        if (!this._isMouseDown)
            return;
        e.cancelBubble = true;

        var hostWidth = this._host['offsetWidth'] || this._host['pixelWidth'] || this._host['scrollWidth'] || this._host['offsetWidth'];

        var newSplitterPosition = e.x / hostWidth;

        this.setSplitterPosition(newSplitterPosition);
        return false;
    };

    SplitController.prototype._mouseUp = function (e) {
        this._isMouseDown = false;
        e.cancelBubble = true;
        this._applyInnerSplitterStyle(this._innerSplitter.style);

        if (this._global.removeEventListener)
            this._global.removeEventListener('mousemove', this._mouseMoveClosure, false); else if (this._global.detachEvent)
            this._global.detachEvent('onmousemove', this._mouseMoveClosure);

        return false;
    };
    return SplitController;
})();
var VirtualFileChange = (function () {
    function VirtualFileChange(lineNumber, lineOffset, oldLength, newText, utcDate) {
        this.lineNumber = lineNumber;
        this.lineOffset = lineOffset;
        this.oldLength = oldLength;
        this.newText = newText;
        this.time = utcDate || VirtualFileChange.getUtcDate;
    }
    VirtualFileChange.getUtcDate = function () {
        var localDate = new Date();
        var utcDate = new Date(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate(), localDate.getUTCHours(), localDate.getUTCMinutes(), localDate.getUTCSeconds());
        return utcDate;
    };

    VirtualFileChange.prototype.toString = function () {
        return '[' + this.lineNumber + '] @' + this.lineOffset + ':' + this.oldLength + '="' + this.newText + '"';
    };
    return VirtualFileChange;
})();

var VirtualFileLine = (function () {
    function VirtualFileLine(originalText) {
        this.originalText = originalText;
        this.lineEnding = '\n';
        this.currentText = this.originalText;
        this.lineEnding = '\n';
    }
    VirtualFileLine.prototype.applyChange = function (lineOffset, oldLength, newText) {
        this.currentText = this.currentText.substring(0, lineOffset) + newText + this.currentText.substring(lineOffset + oldLength);
    };
    return VirtualFileLine;
})();

var VirtualFile = (function () {
    function VirtualFile() {
        this.lines = [];
        this.changes = [];
    }
    VirtualFile.prototype.applyChange = function (lineNumber, lineOffset, oldLength, newText) {
        var change;
        if (lineNumber instanceof VirtualFileChange) {
            change = lineNumber;
        } else {
            change = new VirtualFileChange(lineNumber, lineOffset, oldLength, newText, this.getUtcDate ? this.getUtcDate() : null);
        }

        var line = this.lines[change.lineNumber];
        if (!line)
            line = new VirtualFileLine(newText); else
            line.applyChange(change.lineOffset, change.oldLength, change.newText);

        this.changes.push(change);
    };
    return VirtualFile;
})();

var VirtualFileSystem = (function () {
    function VirtualFileSystem() {
        this.files = {};
        this.onfilechanged = null;
    }
    VirtualFileSystem.prototype.getAllFiles = function () {
        var result = [];
        for (var f in this.files)
            if (this.files.hasOwnProperty(f)) {
                result.push({ name: f, file: this.files[f] });
            }
        result.sort(function (f1, f2) {
            return f1.name > f2.name ? 1 : f2.name > f1.name ? -1 : 0;
        });

        return result;
    };

    VirtualFileSystem.prototype.getOrCreateFile = function (filename) {
        var file = this.files[filename];
        if (!file) {
            this.files[filename] = file = new VirtualFile();

            if (this.onfilechanged)
                this.onfilechanged(filename, file);
        }

        return file;
    };
    return VirtualFileSystem;
})();
/// <reference path='SplitController.ts' />
/// <reference path='VirtualFileSystem.ts' />
/// <reference path='../import/typings/typescriptServices.d.ts' />
var FileListController = (function () {
    function FileListController(_vfs, _host, _global) {
        if (typeof _vfs === "undefined") { _vfs = new VirtualFileSystem(); }
        if (typeof _global === "undefined") { _global = window; }
        var _this = this;
        this._vfs = _vfs;
        this._host = _host;
        this._global = _global;
        this._selectedFileName = null;
        if (typeof this._host === 'undefined')
            this._host = this._global.document.body;

        this._scrollHost = (this._global.document.createElement('div'));
        this._scrollHost.className = 'scroll-host';
        this._applyScrollHostStyle(this._scrollHost.style);
        this._host.appendChild(this._scrollHost);

        this._updateList();

        this._vfs.onfilechanged = function () {
            return _this._updateList();
        };
    }
    FileListController.prototype.getSelectedFileName = function () {
        return this._selectedFileName;
    };

    FileListController.prototype.setSelectedFileName = function (value) {
        this._selectedFileName = value;
        this._updateList();
    };

    FileListController.prototype._applyScrollHostStyle = function (s) {
        s.width = '100%';
        s.height = '100%';
        s.overflow = 'auto';
    };

    FileListController.prototype._updateList = function () {
        var _this = this;
        var files = this._vfs.getAllFiles();

        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            var childDiv;
            if (i < this._scrollHost.children.length) {
                childDiv = this._scrollHost.children[i];
            } else {
                var childDiv = this._global.document.createElement('div');
                var _i = i;
                childDiv.onclick = function (e) {
                    return _this._childDivClick(e, childDiv, _i);
                };
                this._scrollHost.appendChild(childDiv);
            }

            childDiv.textContent = f.name;
            if (f.name === this._selectedFileName)
                childDiv.className = 'file selected'; else
                childDiv.className = 'file';
        }

        while (this._scrollHost.children.length > files.length) {
            this._scrollHost.removeChild(this._scrollHost.children[this._scrollHost.children.length - 1]);
        }
    };

    FileListController.prototype._childDivClick = function (e, childDiv, i) {
        var files = this._vfs.getAllFiles();
        var f = files[i];
        if (!f)
            return;
        this.setSelectedFileName(f.name);
    };
    return FileListController;
})();

var EditorController = (function () {
    function EditorController(_host, _global) {
        if (typeof _global === "undefined") { _global = window; }
        var _this = this;
        this._host = _host;
        this._global = _global;
        if (typeof this._host === 'undefined')
            this._host = this._global.document.body;

        this._splitController = new SplitController(_host, _global);
        this._splitController.setSplitterPosition(0.15);

        this._editor = ((this._global)).CodeMirror(this._splitController.right, {
            mode: "text/typescript",
            matchBrackets: true,
            autoCloseBrackets: true,
            lineNumbers: true,
            extraKeys: { 'Ctrl-Space': 'autocomplete' }
        });

        this._editor.on('change', function (editor, change) {
            _this._editorChange(change);
        });

        this._fileSystem = new VirtualFileSystem();
        this._fileList = new FileListController(this._fileSystem, this._splitController.left, this._global);

        var keyDownClosure = function (e) {
            if (!e)
                e = _this._global.event;
            _this._keyDown(e);
        };

        this._bubbleHost = null;

        if (this._global.addEventListener)
            this._global.addEventListener('keydown', keyDownClosure, false); else if (this._global.attachEvent)
            this._global.attachEvent('onkeydown', keyDownClosure);
    }
    EditorController.prototype._keyDown = function (e) {
        if (e.keyCode === 78 && (e.ctrlKey || e.altKey)) {
            this._ctrlN();
        }
    };

    EditorController.prototype._ctrlN = function () {
        var _this = this;
        if (this._bubbleHost)
            return;

        this._bubbleHost = (this._global.document.createElement('div'));
        this._applyBubbleHostStyle(this._bubbleHost.style);

        var filenameInput = (this._global.document.createElement('input'));
        this._applyFileNameInputStyle(filenameInput.style);
        this._bubbleHost.appendChild(filenameInput);

        this._splitController.left.appendChild(this._bubbleHost);

        var removeBubbleHost = function () {
            _this._splitController.left.removeChild(_this._bubbleHost);
            _this._bubbleHost = null;
        };

        filenameInput.onkeydown = function (e) {
            e.cancelBubble = true;

            switch (e.keyCode) {
                case 13:
                    if (filenameInput.value) {
                        _this._fileSystem.getOrCreateFile(filenameInput.value);
                    }

                    removeBubbleHost();
                    if (e.preventDefault)
                        e.preventDefault();
                    return true;

                case 27:
                    removeBubbleHost();
                    if (e.preventDefault)
                        e.preventDefault();
                    return true;
            }
        };

        filenameInput.focus();
    };

    EditorController.prototype._applyBubbleHostStyle = function (s) {
        s.position = 'absolute';
        s.left = s.right = s.bottom = '0px';
        s.height = '2em';
        s.background = 'cornflowerblue';
    };

    EditorController.prototype._applyFileNameInputStyle = function (s) {
        s.position = 'absolute';
        s.left = s.top = s.right = s.bottom = '0px';
    };

    EditorController.prototype._editorChange = function (change) {
        console.log('change ', change);
    };
    return EditorController;
})();
/// <reference path='SplitController.ts' />
/// <reference path='VirtualFileSystem.ts' />
/// <reference path='tsconsole-complex.ts' />
/// <reference path='../import/typings/typescriptServices.d.ts' />
/// <reference path='../import/typings/codemirror.d.ts' />
var SimpleConsole = (function () {
    function SimpleConsole(_host, _global) {
        if (typeof _global === "undefined") { _global = window; }
        var _this = this;
        this._host = _host;
        this._global = _global;
        this._oldVersion = 0;
        this._oldSyntaxTree = null;
        this._syntaxKindMap = null;
        if (typeof this._host === 'undefined')
            this._host = this._global.document.body;

        this._splitController = new SplitController(this._host, this._global);
        this._splitController.setSplitterPosition(0.8);

        this._editor = (this._global).CodeMirror(this._splitController.left, {
            mode: "text/typescript",
            matchBrackets: true,
            autoCloseBrackets: true,
            lineNumbers: true
        });

        //this._splitController.right.style.background = 'silver';
        this._splitController.right.style.overflow = 'auto';
        this._splitController.right.style.fontSize = '80%';

        var doc = this._editor.getDoc();
        this._languageHost = new LanguageHost(doc);

        var factory = new Services.TypeScriptServicesFactory();
        this.typescript = factory.createPullLanguageService(this._languageHost);

        var updateTypescriptTimeout = null;
        var queueUpdate = function () {
            if (updateTypescriptTimeout)
                _this._global.clearTimeout(updateTypescriptTimeout);
            updateTypescriptTimeout = _this._global.setTimeout(function () {
                _this._refreshCompletions();
            }, 300);
        };

        CodeMirror.on(doc, 'change', function (doc, change) {
            queueUpdate();
        });

        this._editor.on('cursorActivity', function (editor) {
            queueUpdate();
        });
    }
    SimpleConsole.prototype._refreshCompletions = function () {
        var doc = this._editor.getDoc();
        var cursorPos = doc.getCursor();
        var cursorOffset = doc.indexFromPos(cursorPos);

        try  {
            var completions = this.typescript.getCompletionsAtPosition('main.ts', cursorOffset, true);
            console.log(completions);
            if (completions)
                this._splitController.right.innerHTML = completions.entries.map(function (k) {
                    return (k.fullSymbolName || k.name) + ':' + k.kind + ' ' + k.kindModifiers + (k.docComment ? '/**' + k.docComment + '*/' : '');
                }).join('<br> ') + '';
        } catch (error) {
            this._splitController.right.textContent = error.stack;
        }
    };

    SimpleConsole.prototype._fetchSyntaxTree = function () {
        var newSnapshot = this._languageHost.getScriptSnapshot('main.ts');
        var simpleText = TypeScript.SimpleText.fromScriptSnapshot(newSnapshot);

        if (!this._oldSyntaxTree) {
            this._oldSyntaxTree = TypeScript.Parser.parse('main.ts', simpleText, false, TypeScript.LanguageVersion.EcmaScript3);
        } else {
            var changes = newSnapshot.getTextChangeRangeSinceVersion(this._oldVersion);
            this._oldSyntaxTree = TypeScript.Parser.incrementalParse(this._oldSyntaxTree, changes, simpleText);
        }
        this._oldVersion = this._languageHost.getScriptVersion('main.ts');

        return this._oldSyntaxTree;
    };

    SimpleConsole.prototype._refreshTS = function () {
        this._splitController.right.textContent = '';

        try  {
            var structure = this._fetchSyntaxTree();
            if (!structure)
                return;
            this._render(this._splitController.right, structure.sourceUnit());
        } catch (syntaxError) {
            this._splitController.right.textContent = syntaxError.stack;
        }
    };

    SimpleConsole.prototype._render = function (host, sourceUnit) {
        try  {
            var title = this._global.document.createElement('div');
            if (sourceUnit) {
                var kind = sourceUnit.kind();
                if (!this._syntaxKindMap) {
                    this._syntaxKindMap = {};
                    for (var k in TypeScript.SyntaxKind)
                        if (TypeScript.SyntaxKind.hasOwnProperty(k)) {
                            this._syntaxKindMap[TypeScript.SyntaxKind[k]] = k;
                        }
                }
                var count = sourceUnit.childCount();
                var text = null;
                var childHost = null;

                if (count > 0) {
                    childHost = this._global.document.createElement('div');
                    childHost.style.marginLeft = '0.5em';

                    for (var i = 0; i < count; i++) {
                        var child = sourceUnit.childAt(i);
                        this._render(childHost, child);
                    }

                    text = this._syntaxKindMap[kind] + '[' + count + ']';
                } else {
                    var txt = 'valueText' in sourceUnit ? (sourceUnit).valueText() : 'fullText' in sourceUnit ? (sourceUnit).fullText() : 'text' in sourceUnit ? (sourceUnit).text() : null;

                    if (txt.indexOf('\n') < 0 && txt.length < 10)
                        text = '"' + txt + '" ' + this._syntaxKindMap[kind];
                }
                title.textContent = text;
                title.title = (sourceUnit).constructor.name;
            } else {
                title.textContent = '-null-';
            }

            host.appendChild(title);

            if (childHost)
                host.appendChild(childHost);
        } catch (titleError) {
            title.textContent = titleError.message;
            return;
        }
    };
    return SimpleConsole;
})();

/** Handles and tracks changes in CodeMirror.Doc,
* providing a way to retrieve historical snapshots from that business. */
var CodeMirrorScript = (function () {
    function CodeMirrorScript(_doc) {
        var _this = this;
        this._doc = _doc;
        this.version = 1;
        this.contentLength = 0;
        this._editRanges = [];
        this._earlyChange = null;
        this._doc = _doc;

        CodeMirror.on(this._doc, 'beforeChange', function (doc, change) {
            return _this._docBeforeChanged(change);
        });
        CodeMirror.on(this._doc, 'change', function (doc, change) {
            return _this._docChanged(change);
        });
    }
    CodeMirrorScript.prototype.createSnapshot = function () {
        return new CodeMirrorScriptSnapshot(this._doc, this, this.version);
    };

    CodeMirrorScript.prototype.getTextChangeRangeBetweenVersions = function (startVersion, endVersion) {
        if (startVersion === endVersion)
            return TypeScript.TextChangeRange.unchanged;

        var initialEditRangeIndex = this._editRanges.length - (this.version - startVersion);
        var lastEditRangeIndex = this._editRanges.length - (this.version - endVersion);

        var entries = this._editRanges.slice(initialEditRangeIndex, lastEditRangeIndex);
        return TypeScript.TextChangeRange.collapseChangesAcrossMultipleVersions(entries.map(function (e) {
            return e.textChangeRange;
        }));
    };

    CodeMirrorScript.prototype._docBeforeChanged = function (change) {
        var from = this._doc.indexFromPos(change.from);
        var to = this._doc.indexFromPos(change.to);

        this._earlyChange = { from: from, to: to };
    };

    CodeMirrorScript.prototype._docChanged = function (change) {
        if (!this._earlyChange)
            return;

        var newFromPosition = change.from;
        var newToPosition = !change.text || change.text.length === 0 ? change.from : {
            line: change.from.line + change.text.length,
            ch: (change.to.line == change.from.line ? change.from.ch : 0) + change.text[change.text.length - 1].length
        };

        var newLength = this._doc.indexFromPos(newToPosition) - this._doc.indexFromPos(newFromPosition);

        console.log('_editContent(' + this._earlyChange.from + ', ' + this._earlyChange.to + ', ' + (newLength - (this._earlyChange.to - this._earlyChange.from)) + ') /*' + change.text + '*/');

        this._editContent(this._earlyChange.from, this._earlyChange.to, newLength);

        this._earlyChange = null;
    };

    CodeMirrorScript.prototype._editContent = function (start, end, newLength) {
        this.contentLength += end - start + newLength;

        var newSpan = TypeScript.TextSpan.fromBounds(start, end);

        // Store edit range + new length of script
        var textChangeRange = new TypeScript.TextChangeRange(newSpan, newLength);

        this._editRanges.push({
            length: this.contentLength,
            textChangeRange: textChangeRange
        });

        // Update version #
        this.version++;
    };
    return CodeMirrorScript;
})();

var CodeMirrorScriptSnapshot = (function () {
    function CodeMirrorScriptSnapshot(_doc, _script, _version) {
        this._doc = _doc;
        this._script = _script;
        this._version = _version;
    }
    CodeMirrorScriptSnapshot.prototype.getText = function (start, end) {
        var startPos = this._doc.posFromIndex(start);
        var endPos = this._doc.posFromIndex(end);
        var text = this._doc.getRange(startPos, endPos);
        return text;
    };

    CodeMirrorScriptSnapshot.prototype.getLength = function () {
        return this._doc.getValue().length;
    };

    CodeMirrorScriptSnapshot.prototype.getLineStartPositions = function () {
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

    CodeMirrorScriptSnapshot.prototype.getTextChangeRangeSinceVersion = function (scriptVersion) {
        var range = this._script.getTextChangeRangeBetweenVersions(scriptVersion, this._version);
        return range;
    };
    return CodeMirrorScriptSnapshot;
})();

var LanguageHost = (function () {
    function LanguageHost(_doc) {
        this._doc = _doc;
        this._compilationSettings = new TypeScript.CompilationSettings();
        this.implicitFiles = {};
        this.mainFileName = 'main.ts';
        this.loggerSwitches = {
            information: true,
            debug: true,
            warning: true,
            error: true,
            fatal: true
        };
        this.logLines = [];
        this._mainScript = new CodeMirrorScript(_doc);
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
            return this._mainScript.version; else if (this.implicitFiles[fileName])
            return 0; else
            return -1;
    };

    LanguageHost.prototype.getScriptIsOpen = function (fileName) {
        return false;
    };

    LanguageHost.prototype.getScriptSnapshot = function (fileName) {
        if (fileName === this.mainFileName)
            return this._mainScript.createSnapshot();

        var implicitFileContent = this.implicitFiles[fileName];
        if (implicitFileContent)
            return TypeScript.ScriptSnapshot.fromString(implicitFileContent);

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

        if (s.substring(0, ('Updating files').length) === 'Updating files')
            s.toString();

        // TODO: switch it off or reroute via _global abstraction
        console.log('    host:' + s);
    };
    return LanguageHost;
})();
//@ sourceMappingURL=tsconsole.js.map
