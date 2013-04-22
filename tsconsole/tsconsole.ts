/// <reference path='SplitController.ts' />
/// <reference path='VirtualFileSystem.ts' />

/// <reference path='../import/typings/typescriptServices.d.ts' />

class FileListController {
    private _selectedFileName = null;
    private _scrollHost: HTMLDivElement;

    constructor(private _vfs = new VirtualFileSystem(), private _host?: HTMLElement, private _global = window) {
		
		if (typeof this._host === 'undefined')
			this._host = this._global.document.body;


		this._scrollHost = <HTMLDivElement>(this._global.document.createElement('div'));
		this._scrollHost.className = 'scroll-host';
		this._applyScrollHostStyle(this._scrollHost.style);
		this._host.appendChild(this._scrollHost);
		
		this._updateList();

		this._vfs.onfilechanged = () => this._updateList();
	}

	getSelectedFileName() {
		return this._selectedFileName;
	}

	setSelectedFileName(value: string) {
		this._selectedFileName = value;
		this._updateList();
	}
	
	private _applyScrollHostStyle(s) {
		s.width = '100%';
		s.height = '100%';
		s.overflow = 'auto';
	}
	
	private _updateList() {
		var files = this._vfs.getAllFiles();
		
		for (var i = 0; i < files.length; i++) {
			var f = files[i];
			var childDiv;
			if (i < this._scrollHost.children.length) {
				childDiv = this._scrollHost.children[i];
			}
			else {
				var childDiv = this._global.document.createElement('div');
				var _i = i;
				childDiv.onclick = (e) => this._childDivClick(e, childDiv, _i);
				this._scrollHost.appendChild(childDiv);
			}
			
			childDiv.textContent = f.name;
			if (f.name === this._selectedFileName)
				childDiv.className = 'file selected';
			else
				childDiv.className = 'file';
		}
		
		while (this._scrollHost.children.length > files.length) {
			this._scrollHost.removeChild(this._scrollHost.children[this._scrollHost.children.length-1]);
		}
	}

	private _childDivClick(e, childDiv: HTMLDivElement, i: number) {
		var files = this._vfs.getAllFiles();
		var f = files[i];
		if (!f)
			return;
		this.setSelectedFileName(f.name);
	}
}

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