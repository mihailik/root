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