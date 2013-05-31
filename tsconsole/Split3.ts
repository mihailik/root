/// <reference path='SplitController.ts' />

class Split3 {
    private _outerSplit: SplitController;
    private _innerSplit: SplitController;
    
    left: HTMLDivElement;
    right: HTMLDivElement;
    middle: HTMLDivElement;
    
    constructor (private _host?: HTMLElement, private _global = window) {
        if (typeof this._host === 'undefined')
            this._host = this._global.document.body;

        this._outerSplit = new SplitController(this._host, this._global);
        this._outerSplit.setSplitterPosition(0.2);
        this._innerSplit = new SplitController(this._outerSplit.right);
        this._innerSplit.setSplitterPosition(0.8);
        
        this.left = this._outerSplit.left;
        this.right = this._innerSplit.right;
        this.middle = this._innerSplit.left;
    }
    
    getLeftSplitterPosition() {
        return this._outerSplit.getSplitterPosition();
    }
    
    setLeftSplitterPosition(value: number) {
        this._outerSplit.setSplitterPosition(value);
    }
    
    getRightSplitterPosition() {
        return this._innerSplit.getSplitterPosition();
    }
    
    setRightSplitterPosition(value: number) {
        this._innerSplit.setSplitterPosition(value);
    }
}