/// <reference path='SplitController.ts' />
/// <reference path='VirtualFileSystem.ts' />
/// <reference path='tsconsole-complex.ts' />

/// <reference path='../import/typings/typescriptServices.d.ts' />
/// <reference path='../import/typings/codemirror.d.ts' />

class SimpleConsole {
	private _editor: CM.Editor;
	private _languageHost: LanguageHost;

	typescript: Services.ILanguageService;
    
	constructor(private _host?: HTMLElement, private _global = window) {
		if (typeof this._host === 'undefined')
			this._host = this._global.document.body;
            
		this._editor = <CM.Editor>(<any>this._global).CodeMirror(this._host, {
    		mode:  "text/typescript",
			matchBrackets: true,
			autoCloseBrackets: true,
			lineNumbers: true
		});

		var doc = this._editor.getDoc();
		this._languageHost = new LanguageHost(doc);

		var factory = new Services.TypeScriptServicesFactory();
		this.typescript = factory.createPullLanguageService(this._languageHost);
	}
}

class CodeMirrorDocScriptSnapshot implements TypeScript.IScriptSnapshot {
	private _earlyChange: { from: number; to: number; } = null;
	private _changes: { from: number; to: number; newLength: number; }[] = [];
    
	constructor(private _doc: CM.Doc) {
		CodeMirror.on(this._doc, 'beforeChange', (doc, change) => this._docBeforeChanged(change));
		CodeMirror.off(this._doc, 'change', (doc, change) => this._docChanged(change));
	}
    
	getText(start: number, end: number): string {
		return this._doc.getValue();
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
		var textChanges: TypeScript.TextChangeRange[] = [];
		for (var i = scriptVersion; i < this._changes.length; i++) {
			var ch = this._changes[i];
			var span = new TypeScript.TextSpan(ch.from, ch.to - ch.from);
			var tc = new TypeScript.TextChangeRange(span, ch.newLength);
			textChanges.push(tc);
		}
		var result = TypeScript.TextChangeRange.collapseChangesAcrossMultipleVersions(textChanges);
		return result;
	}

	private _docBeforeChanged(change: CM.EditorChange) {
		var from = this._doc.indexFromPos(change.from);
		var to = this._doc.indexFromPos(change.to);
		this._earlyChange = { from: from, to: to };
	}

	private _docChanged(change: CM.EditorChange) {
		if (!this._earlyChange)
			return;
        
		var newFromPosition = change.from;
		var newToPosition = !change.text || change.text.length === 0 ? change.from :
			{
				line: change.from.line + change.text.length,
				ch: (change.to.line == change.from.line ? change.from.ch : 0) + change.text[change.text.length - 1].length
			};

		var newLength = this._doc.indexFromPos(newToPosition) - this._doc.indexFromPos(newFromPosition);

		this._changes.push({
			from: this._earlyChange.from,
			to: this._earlyChange.to,
			newLength: newLength
		});
	}
}

class LanguageHost implements Services.ILanguageServiceHost {
	private _compilationSettings = new TypeScript.CompilationSettings();
	private _mainSnapshot: CodeMirrorDocScriptSnapshot;

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
		this._mainSnapshot = new CodeMirrorDocScriptSnapshot(_doc);
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
			return 1;
		else if (this.implicitFiles[fileName])
			return 0;
		else
			return -1;
	}
    
	getScriptIsOpen(fileName: string): boolean {
		return true;
	}
    
	getScriptSnapshot(fileName: string): TypeScript.IScriptSnapshot {
		if (fileName === this.mainFileName)
			return this._mainSnapshot;
		

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
        
		// TODO: switch it off or reroute via _global abstraction
		console.log(s);
	}
}