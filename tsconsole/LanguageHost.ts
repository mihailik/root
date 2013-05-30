/// <reference path='../imports/typings/typescriptServices.d.ts' />
/// <reference path='../imports/typings/codemirror.d.ts' />

/// <reference path='CodeMirrorScript.ts' />

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