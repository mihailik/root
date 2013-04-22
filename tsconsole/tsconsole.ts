/// <reference path='SplitController.ts' />

class VirtualFileChange {
    time: Date;

	constructor(public lineNumber: number, public lineOffset: number, public oldLength: number, public newText: string, utcDate: Date) {
		this.time = utcDate || VirtualFileChange.getUtcDate;
	}

	static getUtcDate() {
		var localDate = new Date();
		var utcDate = new Date(
			localDate.getUTCFullYear(),
			localDate.getUTCMonth(),
			localDate.getUTCDate(),
			localDate.getUTCHours(),
			localDate.getUTCMinutes(),
			localDate.getUTCSeconds());
		return utcDate;
	}

	toString() {
		return '[' + this.lineNumber + '] @' + this.lineOffset + ':' + this.oldLength + '="' + this.newText + '"';
	}
}

class VirtualFileLine {
    currentText: string;
    lineEnding = '\n';

    constructor (public originalText: string) {
        this.currentText = this.originalText;
        this.lineEnding = '\n';
    }

    applyChange(lineOffset: number, oldLength: number, newText: string) {
        this.currentText =
			this.currentText.substring(0, lineOffset) +
			newText +
			this.currentText.substring(lineOffset + oldLength);
    }
}

class VirtualFile {
    lines: VirtualFileLine[] = [];
    changes: VirtualFileChange[] = [];
    getUtcDate: () => Date;

    constructor () {
    }

    applyChange(lineNumber: VirtualFileChange);
    applyChange(lineNumber: number, lineOffset: number, oldLength: number, newText: string);
    applyChange(lineNumber: any, lineOffset?: number, oldLength?: number, newText?: string) {
        var change;
        if (lineNumber instanceof VirtualFileChange) {
            change = lineNumber;
        }
        else {
            change = new VirtualFileChange(lineNumber, lineOffset, oldLength, newText, this.getUtcDate ? this.getUtcDate() : null /* getUtcDate override */);
        }

        var line = this.lines[change.lineNumber];
        if (!line)
            line = new VirtualFileLine(newText);
        else
            line.applyChange(change.lineOffset, change.oldLength, change.newText);

        this.changes.push(change);
    }
}

class VirtualFileSystem {
    files = {};
    onfilechanged = null;

    constructor () {
    }

    getAllFiles() {
        var result = [];
        for (var f in this.files) if (this.files.hasOwnProperty(f)) {
            result.push({ name: f, file: this.files[f] });
        }
        result.sort(function (f1, f2) {
            return f1.name > f2.name ? 1 : f2.name > f1.name ? -1 : 0;
        });

        return result;
    }

    getOrCreateFile(filename: string) {
        var file = this.files[filename];
        if (!file) {
            this.files[filename] = file = new VirtualFile();

            if (this.onfilechanged)
                this.onfilechanged(filename, file);
        }

        return file;
    }
}

var FileListController = (function() {
	function FileListController(_vfs, _host, _global) {
		if (typeof _vfs === 'undefined')
			_vfs = new VirtualFileSystem();
		
		if (typeof _global === 'undefined')
			_global = window;
		
		if (typeof _host === 'undefined')
			_host = _global.document.body;

		this._vfs = _vfs;
		this._host = _host;
		this._global = _global;

		this._selectedFileName = null;
		
		this._scrollHost = this._global.document.createElement('div');
		this._scrollHost.className = 'scroll-host';
		this._applyScrollHostStyle(this._scrollHost.style);
		this._host.appendChild(this._scrollHost);
		
		this._updateList();

		var _this = this;		
		this._vfs.onfilechanged = function() {
			_this._updateList();
		}
	}

	FileListController.prototype.getSelectedFileName = function() {
		return this._selectedFileName;
	}

	FileListController.prototype.setSelectedFileName = function(value) {
		this._selectedFileName = value;
		this._updateList();
	}
	
	FileListController.prototype._applyScrollHostStyle = function(s) {
		s.width = '100%';
		s.height = '100%';
		s.overflow = 'auto';
	}
	
	FileListController.prototype._updateList = function() {
		var files = this._vfs.getAllFiles();
		
		for (var i = 0; i < files.length; i++) {
			var f = files[i];
			var childDiv;
			if (i < this._scrollHost.children.length) {
				childDiv = this._scrollHost.children[i];
			}
			else {
				var childDiv = this._global.document.createElement('div');
				var _this = this;
				var _i = i;
				childDiv.onclick = function(e) { return _this._childDivClick(e, childDiv, _i); };
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

	FileListController.prototype._childDivClick = function(e, childDiv, i) {
		var files = this._vfs.getAllFiles();
		var f = files[i];
		if (!f)
			return;
		this.setSelectedFileName(f.name);
	}
	
	return FileListController;
})();

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

		var _this = this;
		this._editor.on('change', function(editor, change) {
			_this._editorChange(change);
		});

		this._fileSystem = new VirtualFileSystem();
		this._fileList = new FileListController(this._fileSystem, this._splitController.left, this._global);
		
		var _this;
		var keyDownClosure = function(e) {
			if (!e) e = _this._global.event;
			
			_this._keyDown(e);
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
		
		var _this = this;

		function removeBubbleHost() {
			_this._splitController.left.removeChild(_this._bubbleHost);
			_this._bubbleHost = null;
		}
		
		filenameInput.onkeydown = function(e) {
			e.cancelBubble = true;

			switch (e.keyCode) {
				case 13:
					if (filenameInput.value) {
						_this._fileSystem.getOrCreateFile(filenameInput.value);
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