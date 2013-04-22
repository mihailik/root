/// <reference path='SplitController.ts' />
/// <reference path='VirtualFileSystem.ts' />
/// <reference path='tsconsole-complex.ts' />

/// <reference path='../import/typings/typescriptServices.d.ts' />


declare var CodeMirror;
	
var EditorController = (function() {
	function EditorController(_host, _global) {
		if (typeof _global === 'undefined')
			_global = window;
		
		if (typeof _host === 'undefined')
			_host = _global.document.body;

		this._host = _host;
		this._global = _global;
		
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

	EditorController.prototype._keyDown = function(e) {
		if (e.keyCode === 78 && (e.ctrlKey|| e.altKey)) {
			this._ctrlN();
		}
	}
	
	EditorController.prototype._ctrlN = function() {
		if (this._bubbleHost)
			return;
		
		this._bubbleHost = this._global.document.createElement('div');
		this._applyBubbleHostStyle(this._bubbleHost.style);
		
		var filenameInput = this._global.document.createElement('input');
		this._applyFileNameInputStyle(filenameInput);
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
	
	EditorController.prototype._applyBubbleHostStyle = function(s) {
		s.position = 'absolute';
		s.left = s.right = s.bottom = '0px';
		s.height = '2em';
		s.background = 'cornflowerblue';
	}
	
	EditorController.prototype._applyFileNameInputStyle = function(s) {
		s.position = 'absolute';
		s.left = s.top = s.right = s.bottom = '0px';
	}
	
	EditorController.prototype._editorChange = function(change) {
		console.log('change ', change);
	}
	
	return EditorController;
})();