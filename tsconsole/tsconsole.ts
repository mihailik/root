/// <reference path='SplitController.ts' />
/// <reference path='VirtualFileSystem.ts' />
/// <reference path='tsconsole-complex.ts' />

/// <reference path='../import/typings/typescriptServices.d.ts' />
/// <reference path='../import/typings/codemirror.d.ts' />

class SimpleConsole {
    private _editor: CodeMirrorEditor;
    
    constructor(private _host?: HTMLElement, private _global = window) {
        if (typeof this._host === 'undefined')
            this._host = this._global.document.body;
            
        this._editor = <CodeMirrorEditor>(<any>this._global).CodeMirror(this._host, {
    		mode:  "text/typescript",
			matchBrackets: true,
			autoCloseBrackets: true,
			lineNumbers: true
		});
    }
}

class LanguageHost implements Services.ILanguageServiceHost {
    private _compilationSettings = new TypeScript.CompilationSettings();
    
    implicitFiles: any = {};
    mainFileName: string = 'main.ts';
    mainFile: any = {};
    
    loggerSwitches = {
        information: true,
        debug: true,
        warning: true,
        error: true,
        fatal: true
    };
    logLines: string[] = [];
    
    constructor() {
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
        return null;
    }
    
    getDiagnosticsObject(): Services.ILanguageServicesDiagnostics {
        return null;
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