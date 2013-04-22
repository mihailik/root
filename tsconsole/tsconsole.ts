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