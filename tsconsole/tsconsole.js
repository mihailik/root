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
        (this._outerSplitter).ontouchstart = function (e) {
            return _this._touchStart(e || _global.event);
        };

        this._mouseMoveClosure = function (e) {
            return _this._mouseMove(e || _global.event);
        };
        this._touchMoveClosure = function (e) {
            return _this._touchMove(e || _global.event);
        };

        this._outerSplitter.onmouseup = function (e) {
            return _this._mouseUp(e || _global.event);
        };
        (this._outerSplitter).ontouchend = function (e) {
            return _this._touchEnd(e || _global.event);
        };
    }
    SplitController.prototype.getSplitterPosition = function () {
        return this._splitterPosition;
    };

    SplitController.prototype.setSplitterPosition = function (value) {
        var newPosition = Number(value);
        if (newPosition < 0)
            newPosition = 0; else if (newPosition > 1)
            newPosition = 1;

        this._splitterPosition = newPosition;
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
        s.left = '-3px';
        s.width = '10px';
        s.cursor = 'e-resize';

        s.background = 'transparent';
    };

    SplitController.prototype._applyHighlightedSplitterStyle = function (s) {
        s.background = 'rgba(100,0,0,0.1)';
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
        this._applyHighlightedSplitterStyle(this._innerSplitter.style);

        if (this._global.addEventListener) {
            this._global.addEventListener('mousemove', this._mouseMoveClosure, false);
        } else if (this._global.attachEvent) {
            this._global.attachEvent('onmousemove', this._mouseMoveClosure);
        }

        e.cancelBubble = true;
        e.preventDefault();
        return false;
    };

    SplitController.prototype._mouseUp = function (e) {
        this._isMouseDown = false;
        this._applyInnerSplitterStyle(this._innerSplitter.style);

        if (this._global.removeEventListener)
            this._global.removeEventListener('mousemove', this._mouseMoveClosure, false); else if (this._global.detachEvent)
            this._global.detachEvent('onmousemove', this._mouseMoveClosure);

        e.cancelBubble = true;
        e.preventDefault();
        return false;
    };

    SplitController.prototype._mouseMove = function (e) {
        if (!this._isMouseDown)
            return;

        var hostWidth = this._host['offsetWidth'] || this._host['pixelWidth'] || this._host['scrollWidth'] || this._host['offsetWidth'];

        var newSplitterPosition = e.x / hostWidth;

        this.setSplitterPosition(newSplitterPosition);

        e.cancelBubble = true;
        e.preventDefault();
        return false;
    };

    SplitController.prototype._touchStart = function (e) {
        this._applyHighlightedSplitterStyle(this._innerSplitter.style);

        if (this._global.addEventListener) {
            this._global.addEventListener('touchmove', this._touchMoveClosure, false);
        } else if (this._global.attachEvent) {
            this._global.attachEvent('ontouchmove', this._touchMoveClosure);
        }

        e.cancelBubble = true;
        e.preventDefault();
        return false;
    };

    SplitController.prototype._touchEnd = function (e) {
        this._applyInnerSplitterStyle(this._innerSplitter.style);

        if (this._global.removeEventListener)
            this._global.removeEventListener('touchmove', this._mouseMoveClosure, false); else if (this._global.detachEvent)
            this._global.detachEvent('ontouchmove', this._mouseMoveClosure);

        e.cancelBubble = true;
        e.preventDefault();
        return false;
    };

    SplitController.prototype._touchMove = function (e) {
        var hostWidth = this._host['offsetWidth'] || this._host['pixelWidth'] || this._host['scrollWidth'] || this._host['offsetWidth'];

        var newSplitterPosition = e.touches[0].pageX / hostWidth;

        this.setSplitterPosition(newSplitterPosition);

        e.cancelBubble = true;
        e.preventDefault();
        return false;
    };
    return SplitController;
})();
var FileSystems;
(function (FileSystems) {
    var TemporaryFileSystem = (function () {
        function TemporaryFileSystem(_files) {
            this._files = _files;
            this._callbacks = [];
        }
        TemporaryFileSystem.prototype.files = function (callback) {
            var result = [];
            for (var fname in this._files)
                if (this._files.hasOwnProperty(fname)) {
                    result.push(fname);
                }
            if (typeof callback === 'function')
                callback(result);
        };

        TemporaryFileSystem.prototype.read = function (filename, callback) {
            if (!(filename in this._files))
                return;

            var text = this._files[filename];
            if (typeof text !== 'string')
                text = text + '';

            if (typeof callback === 'function')
                callback(text);
        };

        TemporaryFileSystem.prototype.write = function (filename, text) {
            var coercedFilename = filename;
            if (coercedFilename !== 'string')
                coercedFilename = filename;

            var coercedText = text;
            if (typeof coercedText !== 'string')
                coercedText = text + '';

            this._files[coercedFilename] = coercedText;

            var changes = [coercedFilename];
            for (var i = 0; i < this._callbacks.length; i++) {
                var callback = this._callbacks[i];
                if (typeof callback === 'function')
                    callback(changes);
            }
        };

        TemporaryFileSystem.prototype.listen = function (onchange) {
            var _this = this;
            this._callbacks.push(onchange);

            return function () {
                for (var i = 0; i < _this._callbacks.length; i++) {
                    if (_this._callbacks[i] === onchange) {
                        delete _this._callbacks[i];
                        break;
                    }
                }
            };
        };
        return TemporaryFileSystem;
    })();
    FileSystems.TemporaryFileSystem = TemporaryFileSystem;
})(FileSystems || (FileSystems = {}));
var Controls;
(function (Controls) {
    var AccordionPageInfo = (function () {
        function AccordionPageInfo(classes) {
            this.length = 1;
            this.lengthAbsolute = false;
            this.collapsed = false;
            this._content = null;
            this._header = null;
            this.pageHost = document.createElement('div');
            this.pageHost.className = classes.pageClassName;
            this.headerHost = document.createElement('div');
            this.headerHost.className = classes.headerClassName;
            this.pageContentHost = document.createElement('div');
            this.pageContentHost.className = classes.contentClassName;

            var phs = this.pageHost.style;
            phs.position = 'absolute';

            var hs = this.headerHost.style;
            hs.position = 'relative';
            hs.left = hs.top = hs.right = '0px';
            hs.minHeight = '1.5em';

            var pcs = this.pageContentHost.style;
            pcs.position = 'relative';
            pcs.left = pcs.top = pcs.right = pcs.bottom = '0px';

            //pcs.top = '1.5em';
            this.pageHost.appendChild(this.headerHost);
            this.pageHost.appendChild(this.pageContentHost);
        }
        AccordionPageInfo.prototype.getContent = function () {
            return this._content;
        };

        AccordionPageInfo.prototype.setContent = function (content) {
            this._content = content;
            this.pageContentHost.textContent = '';
            if (typeof content === 'object') {
                try  {
                    this.pageContentHost.appendChild(content);
                    return;
                } catch (notElementError) {
                }
            }

            this.pageContentHost.textContent = content;
        };

        AccordionPageInfo.prototype.getHeader = function () {
            return this._header;
        };

        AccordionPageInfo.prototype.setHeader = function (header) {
            this._header = header;
            this.headerHost.textContent = '';
            if (typeof header === 'object') {
                try  {
                    this.headerHost.appendChild(header);
                    return;
                } catch (notElementError) {
                }
            }

            this.headerHost.textContent = header;
        };
        return AccordionPageInfo;
    })();

    var Accordion = (function () {
        function Accordion(_host) {
            var _this = this;
            this._host = _host;
            this._pages = [];
            this._vertical = false;
            this._layoutInvalidated = null;
            this.pageClassName = 'page';
            this.headerClassName = 'header';
            this.contentClassName = 'content';
            this.collapsedClassName = 'collapsed';
            _host.style.overflow = 'hidden';

            var pageNodes = [];
            for (var i = 0; i < this._host.childNodes.length; i++) {
                pageNodes.push(this._host.childNodes.item(i));
            }

            for (var i = 0; i < pageNodes.length; i++) {
                var pageElement = pageNodes[i];
                if (pageElement.tagName) {
                    this.insertPageBefore(pageElement);
                }
            }

            if (this._host.addEventListener) {
                this._host.addEventListener('resize', function () {
                    return _this._invalidateLayout();
                }, false);
            } else if (this._host.attachEvent) {
                this._host.attachEvent('onresize', function () {
                    return _this._invalidateLayout();
                });
            } else {
                this._host.onresize = function () {
                    _this._invalidateLayout();
                };
                console.log(this._host.onresize);
            }

            this._invalidateLayout();
        }
        Accordion.prototype.getVertical = function () {
            return this._vertical;
        };

        Accordion.prototype.setVertical = function (vertical) {
            if (typeof vertical === "undefined") { vertical = true; }
            vertical = vertical ? true : false;
            if (vertical === this._vertical)
                return;

            this._vertical = vertical;

            this._invalidateLayout();
        };

        Accordion.prototype.insertPageBefore = function (newPage, oldPage) {
            var pageInfo = new AccordionPageInfo(this);
            pageInfo.setContent(newPage);

            var oldPageInfo = this._getPageInfo(oldPage);
            this._host.insertBefore(pageInfo.pageHost, oldPageInfo ? oldPageInfo.pageHost : null);

            this._pages.push(pageInfo);
        };

        Accordion.prototype.removePage = function (page) {
            throw new Error('Not implemented.');
        };

        Accordion.prototype.getLength = function (page) {
            var pageInfo = this._getPageInfo(page);
            return pageInfo.length + (pageInfo.lengthAbsolute ? 'px' : '%');
        };

        Accordion.prototype.setLength = function (page, length) {
            var lengthValue;
            var lengthAbsolute;

            if (!length || !(length = String(length))) {
                lengthValue = 1;
                lengthAbsolute = false;
            } else {
                if (length.substring(length.length - 1) == '%') {
                    lengthValue = Number(length.substring(0, length.length - 1));
                    lengthAbsolute = false;
                } else if (length.substring(length.length - 2) == 'px') {
                    lengthValue = Number(length.substring(0, length.length - 2));
                    lengthAbsolute = true;
                } else {
                    lengthValue = Number(length);
                    lengthAbsolute = true;
                }
            }

            var pageInfo = this._getPageInfo(page);
            pageInfo.length = lengthValue;
            pageInfo.lengthAbsolute = lengthAbsolute;

            this._invalidateLayout();
        };

        Accordion.prototype.getCollapsed = function (page) {
            var pageInfo = this._getPageInfo(page);
            return pageInfo.collapsed;
        };

        Accordion.prototype.setCollapsed = function (page, collapsed) {
            var pageInfo = this._getPageInfo(page);
            pageInfo.collapsed = collapsed ? true : false;
            this._invalidateLayout();
        };

        Accordion.prototype.getContent = function (page) {
            var pageInfo = this._getPageInfo(page);
            return pageInfo.getContent();
        };

        Accordion.prototype.setContent = function (page, content) {
            var pageInfo = this._getPageInfo(page);
            pageInfo.setContent(content);
        };

        Accordion.prototype.getHeader = function (page) {
            var pageInfo = this._getPageInfo(page);
            return pageInfo.getHeader();
        };

        Accordion.prototype.setHeader = function (page, header) {
            var pageInfo = this._getPageInfo(page);
            pageInfo.setHeader(header);
        };

        Accordion.prototype._getPageInfo = function (pageContent) {
            for (var i = 0; i < this._pages.length; i++) {
                if (this._pages[i].getContent() === pageContent) {
                    return this._pages[i];
                }
            }
            return null;
        };

        Accordion.prototype._invalidateLayout = function () {
            var _this = this;
            if (this._layoutInvalidated)
                return;

            // TODO: use that 'next redraw frame' timer if possible
            this._layoutInvalidated = setTimeout(function () {
                _this._layoutInvalidated = null;
                _this._updateLayoutNow();
            }, 1);
        };

        Accordion.prototype._updateLayoutNow = function () {
            var totalAvailableLength = this._vertical ? this._host.offsetHeight : this._host.offsetWidth;
            var totalAbsoluteLength = 0;
            var totalProportionalLength = 0;
            var collapsedCount = 0;

            for (var i = 0; i < this._pages.length; i++) {
                var p = this._pages[i];
                if (p.collapsed) {
                    collapsedCount++;
                } else if (p.lengthAbsolute) {
                    totalAbsoluteLength += p.length;
                } else {
                    totalProportionalLength += p.length;
                }
            }

            var proportionalRatio = totalAvailableLength / totalProportionalLength;

            var offset = this._vertical ? this._host.offsetTop : this._host.offsetLeft;
            for (var i = 0; i < this._pages.length; i++) {
                var p = this._pages[i];
                if (p.collapsed) {
                    p.pageContentHost.style.display = 'none';
                    p.pageHost.style.display = 'none';
                    continue;
                }

                p.pageContentHost.style.display = 'block';
                p.pageHost.style.display = 'block';

                var calculatedLength = p.lengthAbsolute ? p.length : p.length * proportionalRatio;

                var phs = p.pageHost.style;
                if (this._vertical) {
                    phs.left = phs.right = '0px';
                    phs.top = offset + 'px';
                    phs.height = calculatedLength + 'px';
                } else {
                    phs.top = phs.bottom = '0px';
                    phs.left = offset + 'px';
                    phs.width = calculatedLength + 'px';
                }
                offset += calculatedLength;

                var pcs = p.pageContentHost.style;
                pcs.height = (p.pageHost.offsetHeight - p.headerHost.offsetHeight) + 'px';
            }
        };
        return Accordion;
    })();
    Controls.Accordion = Accordion;
})(Controls || (Controls = {}));
/// <reference path='SplitController.ts' />
/// <reference path='FileSystem.ts' />
/// <reference path='Accordion.ts' />
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
