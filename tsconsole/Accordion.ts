module Controls {

    class AccordionPageInfo {
        length: number = 1;
        lengthAbsolute: boolean = false;
        collapsed: boolean = false;
        
        pageHost: HTMLDivElement;
        headerHost: HTMLDivElement;
        pageContentHost: HTMLDivElement;

        private _content: any = null;
        private _header: any = null;

        constructor(
            classes: { 
                pageClassName: string;
                headerClassName: string;
                contentClassName: string;
            }) {

            this.pageHost = <HTMLDivElement>document.createElement('div');
            this.pageHost.className = classes.pageClassName;
            this.headerHost = <HTMLDivElement>document.createElement('div');
            this.headerHost.className = classes.headerClassName;
            this.pageContentHost = <HTMLDivElement>document.createElement('div');
            this.pageContentHost.className = classes.contentClassName;

            var phs = this.pageHost.style;
            phs.position = 'absolute';

            var hs = this.headerHost.style;
            hs.position = 'relative';
            hs.left = hs.top = hs.right = '0px';
            hs.minHeight = '1.5em';
            
            var pcs = this.pageContentHost.style;
            pcs.position = 'relative';
            pcs.left = pcs.top = pcs.right = pcs.bottom = '0px';
            //pcs.top = '1.5em';
            
            this.pageHost.appendChild(this.headerHost);
            this.pageHost.appendChild(this.pageContentHost);
        }
        
        getContent() {
            return this._content;
        }
        
        setContent(content: any) {
            this._content = content;
            this.pageContentHost.textContent = '';
            if (typeof content==='object') {
                try {
                    this.pageContentHost.appendChild(content);
                    return;
                }
                catch (notElementError) {
                }
            }

            this.pageContentHost.textContent = content;
        }

        getHeader() {
            return this._header;
        }
        
        setHeader(header: any) {
            this._header = header;
            this.headerHost.textContent = '';
            if (typeof header==='object') {
                try {
                    this.headerHost.appendChild(header);
                    return;
                }
                catch (notElementError) {
                }
            }

            this.headerHost.textContent = header;
        }
    }

    export class Accordion {
        private _pages: AccordionPageInfo[] = [];
        private _vertical: boolean = false;
        private _layoutInvalidated = null;

        pageClassName = 'page';
        headerClassName = 'header';
        contentClassName = 'content';
        collapsedClassName = 'collapsed';

        constructor(private _host: HTMLElement) {
            _host.style.overflow = 'hidden';
            
            var pageNodes = [];
            for (var i = 0; i < this._host.childNodes.length; i++){
                pageNodes.push(this._host.childNodes.item(i));
            }
            
            for (var i =0; i < pageNodes.length; i++) {
                var pageElement = pageNodes[i];
                if (pageElement.tagName) {
                    this.insertPageBefore(pageElement);
                }
            }

            if (this._host.addEventListener) {
                this._host.addEventListener('resize', () => this._invalidateLayout(), false);
            }
            else if (this._host.attachEvent) {
                this._host.attachEvent('onresize', () => this._invalidateLayout());
            }
            else {
                this._host.onresize = () => {
                    this._invalidateLayout();
                }
                console.log(this._host.onresize);
            }
            
            this._invalidateLayout();
        }

        getVertical() {
            return this._vertical;
        }
        
        setVertical(vertical = true) {
            vertical = vertical ? true : false;
            if (vertical === this._vertical)
                return;

            this._vertical = vertical;
            
            this._invalidateLayout();
        }
        
        insertPageBefore(newPage: any, oldPage?: any) {
            var pageInfo = new AccordionPageInfo(this);
            pageInfo.setContent(newPage);

            var oldPageInfo = this._getPageInfo(oldPage);
            this._host.insertBefore(
                pageInfo.pageHost,
                oldPageInfo ? oldPageInfo.pageHost : null);

            this._pages.push(pageInfo);
        }
        
        removePage(page: HTMLElement) {
            // TODO: remove and adjust
            throw new Error('Not implemented.');
        }

        getLength(page: HTMLElement): string {
            var pageInfo = this._getPageInfo(page);
            return pageInfo.length + (pageInfo.lengthAbsolute ? 'px' : '%');
        }

        setLength(page: HTMLElement, length: string) {
            var lengthValue: number;
            var lengthAbsolute: boolean;
            
            if (!length || !(length = String(length))) {
                lengthValue = 1;
                lengthAbsolute = false;
            }
            else {
                if (length.substring(length.length-1)=='%') {
                    lengthValue = Number(length.substring(0, length.length-1));
                    lengthAbsolute = false;
                }
                else if (length.substring(length.length-2)=='px') {
                    lengthValue = Number(length.substring(0, length.length-2));
                    lengthAbsolute = true;
                }
                else {
                    lengthValue = Number(length);
                    lengthAbsolute = true;
                }
            }

            var pageInfo = this._getPageInfo(page);
            pageInfo.length = lengthValue;
            pageInfo.lengthAbsolute = lengthAbsolute;

            this._invalidateLayout();
        }

        getCollapsed(page: HTMLElement): boolean {
            var pageInfo = this._getPageInfo(page);
            return pageInfo.collapsed;
        }

        setCollapsed(page: HTMLElement, collapsed: boolean) {
            var pageInfo = this._getPageInfo(page);
            pageInfo.collapsed = collapsed ? true : false; // coercing to boolean
            this._invalidateLayout();
        }

        getContent(page: HTMLElement): any {
            var pageInfo = this._getPageInfo(page);
            return pageInfo.getContent();
        }

        setContent(page: HTMLElement, content: any) {
            var pageInfo = this._getPageInfo(page);
            pageInfo.setContent(content);
        }

        getHeader(page: HTMLElement): any {
            var pageInfo = this._getPageInfo(page);
            return pageInfo.getHeader();
        }

        setHeader(page: HTMLElement, header: any) {
            var pageInfo = this._getPageInfo(page);
            pageInfo.setHeader(header);
        }

        private _getPageInfo(pageContent: any) {
            for (var i = 0; i < this._pages.length; i++) {
                if (this._pages[i].getContent()===pageContent) {
                    return this._pages[i];
                }
            }
            return null;
        }

        private _invalidateLayout() {
            if (this._layoutInvalidated)
                return;

            // TODO: use that 'next redraw frame' timer if possible
            this._layoutInvalidated = setTimeout(
                () => {
                    this._layoutInvalidated = null;
                    this._updateLayoutNow();
                }, 1);
        }
        
        private _updateLayoutNow() {
            var totalAvailableLength = this._vertical ? this._host.offsetHeight : this._host.offsetWidth;
            var totalAbsoluteLength = 0;
            var totalProportionalLength = 0;
            var collapsedCount = 0;

            for (var i = 0; i < this._pages.length; i++) {
                var p = this._pages[i];
                if (p.collapsed) {
                    collapsedCount++;
                }
                else if (p.lengthAbsolute) {
                    totalAbsoluteLength += p.length;
                }
                else {
                    totalProportionalLength += p.length;
                }
            }
            
            var proportionalRatio = totalAvailableLength / totalProportionalLength;
            
            var offset = this._vertical ? this._host.offsetTop : this._host.offsetLeft;
            for (var i = 0; i < this._pages.length; i++) {
                var p = this._pages[i];
                if (p.collapsed) {
                    p.pageContentHost.style.display = 'none';
                    p.pageHost.style.display = 'none';
                    continue;
                }

                p.pageContentHost.style.display = 'block';
                p.pageHost.style.display = 'block';

                var calculatedLength = p.lengthAbsolute ?
                    p.length :
                    p.length * proportionalRatio;

                var phs = p.pageHost.style;
                if (this._vertical) {
                    phs.left = phs.right = '0px';
                    phs.top = offset + 'px';
                    phs.height = calculatedLength + 'px';
                }
                else {
                    phs.top = phs.bottom = '0px';
                    phs.left = offset + 'px';
                    phs.width = calculatedLength + 'px';
                }
                offset += calculatedLength;

                var pcs = p.pageContentHost.style;
                pcs.height = (p.pageHost.offsetHeight - p.headerHost.offsetHeight) + 'px';
            }
        }
    }
}