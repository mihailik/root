var Paginator = (function () {
    function Paginator(_host) {
        this._host = _host;
        this._pages = [];
        for (var i = 0; i < this._host.childNodes.length; i++) {
            var pageElement = this._host.childNodes.item(i);
            if ('textContent' in pageElement || 'innerHTML' in pageElement) {
                this._pages.push(pageElement);
                this._applyPageStyle(pageElement);
            }
        }
    }
    Paginator.prototype._applyPageStyle = function (s) {
        s.background = 'white';
    };
    return Paginator;
})();
//@ sourceMappingURL=main.js.map
