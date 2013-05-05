class SplitController {
    left: HTMLDivElement;
    right: HTMLDivElement;

    private _splitterPosition = 0.3;
    private _outerSplitter: HTMLDivElement;
    private _innerSplitter: HTMLDivElement;
    private _splitterHandle: HTMLDivElement;
    private _isMouseDown/*: boolean*/;
    private _lastMouseX: number;
    private _mouseMoveClosure: (e: any) => void;

    constructor (private _host?: HTMLElement, private _global = window) {
        if (typeof this._host === 'undefined')
            this._host = this._global.document.body;

        this.left = <HTMLDivElement>_global.document.createElement('div');
        this.right = <HTMLDivElement>_global.document.createElement('div');
        this._outerSplitter = <HTMLDivElement>_global.document.createElement('div');
        this._innerSplitter = <HTMLDivElement>_global.document.createElement('div');
        this._splitterHandle = <HTMLDivElement>_global.document.createElement('div');

        this._applyLeftStyle(this.left.style);
        this._applyRightStyle(this.right.style);
        this._applyOuterSplitterStyle(this._outerSplitter.style);
        this._applyInnerSplitterStyle(this._innerSplitter.style);
        this._applySplitterHandleStyle(this._splitterHandle.style);

        this._innerSplitter.appendChild(this._splitterHandle);
        this._outerSplitter.appendChild(this._innerSplitter);

        this._host.appendChild(this.left);
        this._host.appendChild(this.right);
        this._host.appendChild(this._outerSplitter);

        this._isMouseDown = false;
        this._lastMouseX = -1;
        this._outerSplitter.onmousedown = (e) => this._mouseDown(e || _global.event);
        this._outerSplitter.ontouchstart = (e) => this._mouseDown(e || _global.event);
        this._mouseMoveClosure = (e) => this._mouseMove(e || _global.event);

        this._outerSplitter.onmouseup = (e) => this._mouseUp(e || _global.event);
        this._outerSplitter.ontouchend = (e) => this._mouseUp(e || _global.event);
    }

    getSplitterPosition() {
        return this._splitterPosition;
    }

    setSplitterPosition(value: number) {
        this._splitterPosition = Number(value);
        this.left.style.width = (this._splitterPosition * 100) + '%';
        this.right.style.width = ((1 - this._splitterPosition) * 100) + '%';
        this._outerSplitter.style.left = (this._splitterPosition * 100) + '%';
    }

    private _applyLeftStyle(s: MSStyleCSSProperties) {
        s.position = 'absolute';
        s.left = s.top = s.bottom = '0px';
        s.width = '30%';
    }

    private _applyRightStyle(s: MSStyleCSSProperties) {
        s.position = 'absolute';
        s.right = s.top = s.bottom = '0px';
        s.width = '70%';

        s.background = 'white';
    }

    private _applyOuterSplitterStyle(s: MSStyleCSSProperties) {
        s.position = 'absolute';
        s.top = s.bottom = '0px';
        s.left = '30%';
        s.width = '0px';
        s.zIndex = '20000';
    }

    private _applyInnerSplitterStyle(s: MSStyleCSSProperties) {
        s.position = 'absolute';
        s.top = s.bottom = '0px';
        s.left = '-5px';
        s.width = '10px';
        s.cursor = 'e-resize';

        s.background = 'transparent';
    }

    private _applyHighlightedSplitterStyle(s: MSStyleCSSProperties) {
        s.background = 'rgba(0,0,0,0.1)';
    }

    private _applySplitterHandleStyle(s: MSStyleCSSProperties) {
        s.position = 'absolute';
        s.left = s.right = '4.5px';
        s.top = s.bottom = '0px';

        s.background = 'silver';
    }

    private _mouseDown(e) {
        this._isMouseDown = true;
        this._lastMouseX = e.x;
        e.cancelBubble = true;
        this._applyHighlightedSplitterStyle(this._innerSplitter.style);

        if (this._global.addEventListener) {
            this._global.addEventListener('mousemove', this._mouseMoveClosure, false);
            this._global.addEventListener('touchmove', this._mouseMoveClosure, false);
        }
        else if (this._global.attachEvent) {
            this._global.attachEvent('onmousemove', this._mouseMoveClosure);
            this._global.attachEvent('ontouchmove', this._mouseMoveClosure);
        }

        return false;
    }

    private _mouseMove(e) {
        if (!this._isMouseDown)
            return;
        e.cancelBubble = true;

        var hostWidth = this._host['offsetWidth'] || this._host['pixelWidth'] || this._host['scrollWidth'] || this._host['offsetWidth'];

        var newSplitterPosition = e.x / hostWidth;

        this.setSplitterPosition(newSplitterPosition);
        return false;
    }

    private _mouseUp(e) {
        this._isMouseDown = false;
        e.cancelBubble = true;
        this._applyInnerSplitterStyle(this._innerSplitter.style);

        if (this._global.removeEventListener)
            this._global.removeEventListener('mousemove', this._mouseMoveClosure, false);
        else if (this._global.detachEvent)
            this._global.detachEvent('onmousemove', this._mouseMoveClosure);

        return false;
    }
}