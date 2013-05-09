class Paginator {
    private _pages: HTMLElement[] = [];
    
    constructor(private _host: HTMLElement) {
        for (var i = 0; i < this._host.childNodes.length; i++){
            var pageElement = <HTMLElement>this._host.childNodes.item(i);
            if ('textContent' in pageElement || 'innerHTML' in pageElement) {
                this._pages.push(pageElement);
                this._applyPageStyle(pageElement);
            }
        }
    }
    
    private _applyPageStyle(s: MSCSSProperties) {
        s.background = 'white';
    }
}

