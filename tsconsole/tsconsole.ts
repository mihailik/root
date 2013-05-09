/// <reference path='SplitController.ts' />
/// <reference path='FileSystem.ts' />
/// <reference path='Accordion.ts' />

/// <reference path='../import/typings/typescriptServices.d.ts' />
/// <reference path='../import/typings/codemirror.d.ts' />

class SimpleConsole {
    private _splitController: SplitController;
	private _editor: CM.Editor;
	private _languageHost: LanguageHost;
    
    private _oldVersion = 0;
    private _oldSyntaxTree: TypeScript.SyntaxTree = null;

	typescript: Services.ILanguageService;
    
	constructor(private _host?: HTMLElement, private _global = window) {
		if (typeof this._host === 'undefined')
			this._host = this._global.document.body;
            
        this._splitController = new SplitController(this._host, this._global);
        this._splitController.setSplitterPosition(0.8);
            
		this._editor = <CM.Editor>(<any>this._global).CodeMirror(this._splitController.left, {
    		mode:  "text/typescript",
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
        var queueUpdate = () => {
            if (updateTypescriptTimeout)
                this._global.clearTimeout(updateTypescriptTimeout);
            updateTypescriptTimeout = this._global.setTimeout(() => {
                this._refreshCompletions();
                //this._refreshTS();
            }, 300);
        };
        
        CodeMirror.on(doc, 'change', (doc, change) => {
            queueUpdate();
        });
        
        this._editor.on('cursorActivity', (editor) => {
            queueUpdate();
        });
	}
    
    private _refreshCompletions() {
        var doc = this._editor.getDoc();
        var cursorPos = doc.getCursor();
        var cursorOffset = doc.indexFromPos(cursorPos);
        
        try {
            var completions = this.typescript.getCompletionsAtPosition('main.ts', cursorOffset, true);
            console.log(completions);
            if (completions)
                this._splitController.right.innerHTML = completions.entries.map(k => (k.fullSymbolName||k.name)+':'+k.kind+' '+k.kindModifiers+(k.docComment ? '/**'+k.docComment+'*/':'')).join('<br> ')+'';
        }
        catch (error) {
            this._splitController.right.textContent = error.stack;
        }
    }
    
    private _fetchSyntaxTree() {
        var newSnapshot = this._languageHost.getScriptSnapshot('main.ts');
        var simpleText = TypeScript.SimpleText.fromScriptSnapshot(newSnapshot);
        
        if (!this._oldSyntaxTree) {
            this._oldSyntaxTree = TypeScript.Parser.parse(
                'main.ts',
                simpleText,
                false,
                TypeScript.LanguageVersion.EcmaScript3 /*, options?: ParseOptions*/);
        }
        else {
            var changes = newSnapshot.getTextChangeRangeSinceVersion(this._oldVersion);
            this._oldSyntaxTree = TypeScript.Parser.incrementalParse(
                this._oldSyntaxTree,
                changes,
                simpleText);
        }
        this._oldVersion = this._languageHost.getScriptVersion('main.ts');

        return this._oldSyntaxTree;
    }
    
    private _refreshTS() {
        this._splitController.right.textContent = '';
        
        try {
            var structure = this._fetchSyntaxTree();
            if (!structure) return;
            this._render(this._splitController.right, structure.sourceUnit());
        }
        catch (syntaxError) {
            this._splitController.right.textContent = syntaxError.stack;
        }
    }
    
    private _syntaxKindMap: any = null;
    
    private _render(host: HTMLElement, sourceUnit: TypeScript.ISyntaxElement) {
        try {
            var title = this._global.document.createElement('div');
            if (sourceUnit) {
                var kind = sourceUnit.kind();
                if (!this._syntaxKindMap) {
                    this._syntaxKindMap = {};
                    for (var k in TypeScript.SyntaxKind) if (TypeScript.SyntaxKind.hasOwnProperty(k)) {
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
                    
                    text = this._syntaxKindMap[kind] + '['+count+']';
                }
                else {
                    var txt =
                        'valueText' in sourceUnit ? (<any>sourceUnit).valueText() :
                        'fullText' in sourceUnit ? (<any>sourceUnit).fullText() :
                        'text' in sourceUnit ? (<any>sourceUnit).text() :
                        null;
                        
                    if (txt.indexOf('\n')<0 && txt.length < 10)
                        text = '"'+txt+'" ' + this._syntaxKindMap[kind];
                }
                title.textContent = text;
                title.title = (<any>sourceUnit).constructor.name;
            }
            else {
                title.textContent = '-null-';
            }

                
            host.appendChild(title);
            
            if (childHost)
                host.appendChild(childHost);
        }
        catch (titleError) {
            title.textContent = titleError.message;
            return;
        }
    }
}

/** Handles and tracks changes in CodeMirror.Doc,
* providing a way to retrieve historical snapshots from that business. */
class CodeMirrorScript {
    version = 1;
    contentLength = 0;
    
    private _editRanges: { length: number; textChangeRange: TypeScript.TextChangeRange; }[] = [];
    private _earlyChange: { from: number; to: number; } = null;
    
    constructor(private _doc: CM.Doc) {
        this._doc = _doc;
        
        CodeMirror.on(this._doc, 'beforeChange', (doc, change) => this._docBeforeChanged(change));
        CodeMirror.on(this._doc, 'change', (doc, change) => this._docChanged(change));
    }
    
    createSnapshot() {
        return new CodeMirrorScriptSnapshot(this._doc, this, this.version);
    }

    getTextChangeRangeBetweenVersions(startVersion:number, endVersion: number) {
        if (startVersion === endVersion)
            return TypeScript.TextChangeRange.unchanged;

        var initialEditRangeIndex = this._editRanges.length - (this.version - startVersion);
        var lastEditRangeIndex = this._editRanges.length - (this.version - endVersion);

        var entries = this._editRanges.slice(initialEditRangeIndex, lastEditRangeIndex);
        return TypeScript.TextChangeRange.collapseChangesAcrossMultipleVersions(entries.map(e => e.textChangeRange));
    }

    private _docBeforeChanged(change: CM.EditorChange) {
        var from = this._doc.indexFromPos(change.from);
        var to = this._doc.indexFromPos(change.to);
        
        this._earlyChange = { from: from, to: to };
    }

    private _docChanged(change) {
        if (!this._earlyChange)
            return;

        var newFromPosition = change.from;
        var newToPosition = !change.text || change.text.length === 0 ? change.from : {
            line: change.from.line + change.text.length,
            ch: (change.to.line == change.from.line ? change.from.ch : 0) + change.text[change.text.length - 1].length
        };

        var newLength = this._doc.indexFromPos(newToPosition) - this._doc.indexFromPos(newFromPosition);

        console.log(
            '_editContent('+
                this._earlyChange.from+', '+
                this._earlyChange.to+', '+
                (newLength - (this._earlyChange.to - this._earlyChange.from))+
            ') /*'+change.text+'*/');
            
        this._editContent(this._earlyChange.from, this._earlyChange.to, newLength);

        this._earlyChange = null;
    }

    private _editContent(start: number, end: number, newLength: number) {
        this.contentLength += end - start + newLength;
        
        var newSpan = TypeScript.TextSpan.fromBounds(start, end);
        
        // Store edit range + new length of script
        var textChangeRange = new TypeScript.TextChangeRange(
            newSpan,
            newLength);

        this._editRanges.push({
            length: this.contentLength,
            textChangeRange: textChangeRange
        });

        // Update version #
        this.version++;
    }
}

class CodeMirrorScriptSnapshot implements TypeScript.IScriptSnapshot {
    constructor(private _doc: CM.Doc, private _script: CodeMirrorScript, private _version: number) {
    }
    
    getText(start: number, end: number): string {
        var startPos = this._doc.posFromIndex(start);
        var endPos = this._doc.posFromIndex(end);
        var text = this._doc.getRange(startPos, endPos);
		return text;
	}

	getLength(): number {
		return this._doc.getValue().length;
	}

	getLineStartPositions(): number[]{
		var result: number[] = [];
		var pos: CM.Position = {
			line: 0,
			ch: 0
		};

		this._doc.eachLine((line) => {
			pos.line = result.length;
			var lineStartPosition = this._doc.indexFromPos(pos);
			result.push(lineStartPosition);
		} );
		return result;
	}

	getTextChangeRangeSinceVersion(scriptVersion: number): TypeScript.TextChangeRange {
		var range = this._script.getTextChangeRangeBetweenVersions(scriptVersion, this._version);
		return range;
	}
}

class LanguageHost implements Services.ILanguageServiceHost {
	private _compilationSettings = new TypeScript.CompilationSettings();
    private _mainScript: CodeMirrorScript;

	implicitFiles: any = {};
	mainFileName: string = 'main.ts';
    
	loggerSwitches = {
		information: true,
		debug: true,
		warning: true,
		error: true,
		fatal: true
	};

	logLines: string[] = [];
	
	constructor(private _doc: CM.Doc) {
        this._mainScript = new CodeMirrorScript(_doc);
	}
    
	getCompilationSettings(): TypeScript.CompilationSettings {
		return this._compilationSettings;
	}
    
	getScriptFileNames(): string[] {
		var result = Object.keys(this.implicitFiles);
		result.push(this.mainFileName);
		return result;
	}
    
	getScriptVersion(fileName: string): number {
		if (fileName === this.mainFileName)
			return this._mainScript.version;
		else if (this.implicitFiles[fileName])
			return 0;
		else
			return -1;
	}
    
	getScriptIsOpen(fileName: string): boolean {
		return false;
	}
    
	getScriptSnapshot(fileName: string): TypeScript.IScriptSnapshot {
		if (fileName === this.mainFileName)
			//return this._mainSnapshot;
            return this._mainScript.createSnapshot();		

		var implicitFileContent = this.implicitFiles[fileName];
		if (implicitFileContent)
			return TypeScript.ScriptSnapshot.fromString(implicitFileContent);

		return null;
	}
    
	getDiagnosticsObject(): Services.ILanguageServicesDiagnostics {
		return {
			log: (txt: string) => this.log('lang: ' + txt)
		};
	}
    
	information(): boolean {
		return this.loggerSwitches.information;
	}
    
	debug(): boolean {
		return this.loggerSwitches.debug;
	}
    
	warning(): boolean {
		return this.loggerSwitches.warning;
	}
    
	error(): boolean {
		return this.loggerSwitches.error;
	}
    
	fatal(): boolean {
		return this.loggerSwitches.fatal;
	}
    
	log(s: string): void {
		this.logLines.push(s);
        
        if (s.substring(0, ('Updating files').length)==='Updating files')
            s.toString();
        
		// TODO: switch it off or reroute via _global abstraction
		console.log('    host:' + s);
	}
}
