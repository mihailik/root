/// <reference path='SplitController.ts' />
/// <reference path='VirtualFileSystem.ts' />
/// <reference path='tsconsole-complex.ts' />

/// <reference path='../import/typings/typescriptServices.d.ts' />


declare var CodeMirror;
	
class EditorController {
	private _splitController: SplitController;
    private _editor;
    private _fileSystem: VirtualFileSystem;
    private _fileList: FileListController;
    private _bubbleHost;
    
    constructor(private _host?: HTMLElement, private _global = window) {
		if (typeof this._host === 'undefined')
			this._host = this._global.document.body;

		this._splitController = new SplitController(_host, _global);
		this._splitController.setSplitterPosition(0.15);
		
		this._editor = CodeMirror(this._splitController.right, {
			mode:  "text/typescript",
			matchBrackets: true,
			autoCloseBrackets: true,
			lineNumbers: true,
			extraKeys: { 'Ctrl-Space' : 'autocomplete' }
		});

		this._editor.on('change', (editor, change) => {
			this._editorChange(change);
		});

		this._fileSystem = new VirtualFileSystem();
		this._fileList = new FileListController(this._fileSystem, this._splitController.left, this._global);
		
		var keyDownClosure = (e) => {
			if (!e) e = this._global.event;
			this._keyDown(e);
		}
		
		this._bubbleHost = null;
		
		if (this._global.addEventListener)
			this._global.addEventListener('keydown', keyDownClosure, false);
		else if (this._global.attachEvent)
			this._global.attachEvent('onkeydown', keyDownClosure);
	}

	private _keyDown(e) {
		if (e.keyCode === 78 && (e.ctrlKey|| e.altKey)) {
			this._ctrlN();
		}
	}
	
	private _ctrlN() {
		if (this._bubbleHost)
			return;
		
		this._bubbleHost = <HTMLDivElement>(this._global.document.createElement('div'));
		this._applyBubbleHostStyle(this._bubbleHost.style);
		
		var filenameInput = <any>(this._global.document.createElement('input'));
		this._applyFileNameInputStyle(filenameInput.style);
		this._bubbleHost.appendChild(filenameInput);
		
		this._splitController.left.appendChild(this._bubbleHost);
		
		var removeBubbleHost = () => {
			this._splitController.left.removeChild(this._bubbleHost);
			this._bubbleHost = null;
		}
		
		filenameInput.onkeydown = (e) => {
			e.cancelBubble = true;

			switch (e.keyCode) {
				case 13:
					if (filenameInput.value) {
						this._fileSystem.getOrCreateFile(filenameInput.value);
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
			
		}
		
		filenameInput.focus();
	}
	
	private _applyBubbleHostStyle(s: MSStyleCSSProperties) {
		s.position = 'absolute';
		s.left = s.right = s.bottom = '0px';
		s.height = '2em';
		s.background = 'cornflowerblue';
	}
	
	private _applyFileNameInputStyle(s: MSStyleCSSProperties) {
		s.position = 'absolute';
		s.left = s.top = s.right = s.bottom = '0px';
	}
	
	private _editorChange(change) {
		console.log('change ', change);
	}
}