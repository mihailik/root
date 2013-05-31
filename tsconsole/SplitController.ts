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
    private _touchMoveClosure: (e: any) => void;

    constructor (private _host?: HTMLElement, private _global = window) {
        if (typeof this._host === 'undefined')
            this._host = this._global.document.body;

        this.left = _global.document.createElement('div');
        this.right = _global.document.createElement('div');
        this._outerSplitter = _global.document.createElement('div');
        this._innerSplitter = _global.document.createElement('div');
        this._splitterHandle = _global.document.createElement('div');

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
        (<any>this._outerSplitter).ontouchstart = (e) => this._touchStart(e || _global.event);
        
        this._mouseMoveClosure = (e) => this._mouseMove(e || _global.event);
        this._touchMoveClosure = (e) => this._touchMove(e || _global.event);

        this._outerSplitter.onmouseup = (e) => this._mouseUp(e || _global.event);
        (<any>this._outerSplitter).ontouchend = (e) => this._touchEnd (e || _global.event);
    }

    getSplitterPosition() {
        return this._splitterPosition;
    }

    setSplitterPosition(value: number) {
        var newPosition = Number(value);
        if (newPosition < 0)
            newPosition = 0;
        else if (newPosition > 1)
            newPosition = 1;

        this._splitterPosition = newPosition;
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
        s.left = '-3px';
        s.width = '10px';
        s.cursor = 'e-resize';

        s.background = 'transparent';
    }

    private _applyHighlightedSplitterStyle(s: MSStyleCSSProperties) {
        s.background = 'rgba(100,0,0,0.1)';
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
        this._applyHighlightedSplitterStyle(this._innerSplitter.style);

        if (this._global.addEventListener) {
            this._global.addEventListener('mousemove', this._mouseMoveClosure, false);
        }
        else if (this._global.attachEvent) {
            this._global.attachEvent('onmousemove', this._mouseMoveClosure);
        }

        e.cancelBubble = true;
        e.preventDefault();
        return false;
    }

    private _mouseUp(e) {
        this._isMouseDown = false;
        this._applyInnerSplitterStyle(this._innerSplitter.style);

        if (this._global.removeEventListener)
            this._global.removeEventListener('mousemove', this._mouseMoveClosure, false);
        else if (this._global.detachEvent)
            this._global.detachEvent('onmousemove', this._mouseMoveClosure);

        e.cancelBubble = true;
        e.preventDefault();
        return false;
    }

    private _mouseMove(e) {
        if (!this._isMouseDown)
            return;

        var hostWidth = this._host['offsetWidth'] || this._host['pixelWidth'] || this._host['scrollWidth'] || this._host['offsetWidth'];
        var mousePos = e['x'] || e['clientX'] || e['layerX'];
        mousePos -= this._host['offsetLeft'] || this._host['pixelLeft'] || this._host['scrollLeft'] || this._host['offsetLeft'];

        var newSplitterPosition = mousePos / hostWidth;

        this.setSplitterPosition(newSplitterPosition);

        e.cancelBubble = true;
        e.preventDefault();
        return false;
    }
    
    private _touchStart(e) {
        this._applyHighlightedSplitterStyle(this._innerSplitter.style);

        if (this._global.addEventListener) {
            this._global.addEventListener('touchmove', this._touchMoveClosure, false);
        }
        else if (this._global.attachEvent) {
            this._global.attachEvent('ontouchmove', this._touchMoveClosure);
        }

        e.cancelBubble = true;
        e.preventDefault();
        return false;
    }
    
    private _touchEnd(e) {
        this._applyInnerSplitterStyle(this._innerSplitter.style);

        if (this._global.removeEventListener)
            this._global.removeEventListener('touchmove', this._mouseMoveClosure, false);
        else if (this._global.detachEvent)
            this._global.detachEvent('ontouchmove', this._mouseMoveClosure);

        e.cancelBubble = true;
        e.preventDefault();
        return false;
    }

    private _touchMove(e) {
        var hostWidth = this._host['offsetWidth'] || this._host['pixelWidth'] || this._host['scrollWidth'] || this._host['offsetWidth'];

        var newSplitterPosition = e.touches[0].pageX / hostWidth;

        this.setSplitterPosition(newSplitterPosition);

        e.cancelBubble = true;
        e.preventDefault();
        return false;
    }
}