/// <reference path="../DefinitelyTyped/codemirror/codemirror.d.ts" />
/// <reference path="typescriptServices.d.ts" />

class EditController {
	private _editor: CodeMirrorEditor;

	constructor(private _host?: HTMLElement, private _global = window) {
		if (!this._host)
			this._host = _global.document.body;

		this._editor = CodeMirror(this._host, {
	    	mode:  "text/typescript",
    		matchBrackets: true,
    		autoCloseBrackets: true,
    		lineNumbers: true,
    		extraKeys: { 'Ctrl-Space' : 'autocomplete' }
		});

		CodeMirror.commands.autocomplete = () => this.autocomplete();
	}

	autocomplete() {
		alert('ok');
	}
}

class TSHost {
	constructor() {
	}
}