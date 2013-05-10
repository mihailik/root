module Controls {

    class AccordionPageInfo {
        length: number = 1;
        lengthAbsolute: boolean = false;
        collapsed: boolean = false;
        content: any = null;
        header: any = null;

        constructor() {
        }
    }

    export class Accordion {
        private _tab: HTMLTableElement = <any>document.createElement('table');
        private _pages: AccordionPageInfo[] = [];
        private _vertical: boolean = false;
        private _layoutInvalidated = null;

        headerClassName = 'header';
        contentClassName = 'content';
        splitterClassName = 'splitter';

        constructor(private _host: HTMLElement) {
            this._tab.setAttribute('cellPadding', '0');
            this._tab.setAttribute('cellSpacing', '0');
            this._tab.setAttribute('width', '100%');
            this._tab.setAttribute('height', '100%');

            var pageNodes = [];
            for (var i = 0; i < this._host.childNodes.length; i++){
                var element = this._host.childNodes.item(i);
                if (isElement(element))
                    pageNodes.push(element);
            }
            
            for (var i =0; i < pageNodes.length; i++) {
                var pageElement = pageNodes[i];
                var nextPage = new AccordionPageInfo();
                nextPage.content = pageElement;
                this._pages.push(nextPage);
            }

            this._host.appendChild(this._tab);
            
            this._recreateTableContent();
        }

        getVertical() {
            return this._vertical;
        }
        
        setVertical(vertical = true) {
            vertical = vertical ? true : false;
            if (vertical === this._vertical)
                return;

            this._vertical = vertical;
            
            this._recreateTableContent();
        }
        
        insertPage(newPage: any, index?: number) {
            var pageInfo = new AccordionPageInfo();
            pageInfo.content = newPage;

            if (!(index>=0 && index < this._pages.length))
                index = this._pages.length;

            if (this._vertical) {
                var newRowIndex = index * 2;

                var headerRow = <HTMLTableRowElement>this._tab.insertRow(newRowIndex)
                var headerCell = headerRow.insertCell();
                var headerHost = appendDiv(headerHost, this.headerClassName);

                var contentRow = <HTMLTableRowElement>this._tab.insertRow(newRowIndex+1);
                var contentCell = contentRow.insertCell();
                contentCell.className = this.contentClassName;
                contentCell.setAttribute('valign', 'top');
                setContent(contentCell, newPage);
            }
            else {
                if (this._pages.length===0) {
                    var headerCell = (<HTMLTableRowElement>this._tab.rows[0]).insertCell();
                    var headerHost = appendDiv(headerCell, this.headerClassName);
                    var contentCell = (<HTMLTableRowElement>this._tab.rows[1]).insertCell();
                    contentCell.className = this.contentClassName;
                    contentCell.setAttribute('valign', 'top');
                    setContent(contentCell, newPage);
                }
                else {
                    var last = index===this._pages.length;
                    
                    var splitterCell = <HTMLTableCellElement>(last ?
                        (<HTMLTableRowElement>this._tab.rows[0]).insertCell() :
                        (<HTMLTableRowElement>this._tab.rows[0]).insertCell(index*2));
                    splitterCell.rowSpan = 2;
                    var splitterElement = appendDiv(splitterCell, this.splitterClassName);
                    splitterElement.style.width = '6px';
                    splitterElement.textContent = '-';

                    var headerCell = last ?
                        (<HTMLTableRowElement>this._tab.rows[0]).insertCell() :
                        (<HTMLTableRowElement>this._tab.rows[0]).insertCell(index*2);
                    var headerHost = appendDiv(headerCell, this.headerClassName);

                    var contentCell = last ?
                        (<HTMLTableRowElement>this._tab.rows[1]).insertCell() :
                        (<HTMLTableRowElement>this._tab.rows[1]).insertCell(index);
                    contentCell.className = this.contentClassName;
                    contentCell.setAttribute('valign', 'top');
                    setContent(contentCell, newPage);
                }
            }

            this._pages.push(pageInfo);
        }
        
        removePage(index: number) {
            if (index < 0 || index >= this._pages.length)
                throw new Error('Remove index out of bounds: '+index+'.');
   
            if (this._vertical) {
                this._tab.deleteRow(index*2+1);
                this._tab.deleteRow(index*2);
            }
            else {
                if (index===0) {
                    (<HTMLTableRowElement>this._tab.rows[0]).deleteCell(0);
                    (<HTMLTableRowElement>this._tab.rows[1]).deleteCell(0);
                }
                else {
                    (<HTMLTableRowElement>this._tab.rows[0]).deleteCell(index*2-1);
                    (<HTMLTableRowElement>this._tab.rows[0]).deleteCell(index*2-1);
                    (<HTMLTableRowElement>this._tab.rows[1]).deleteCell(index);
                }
            }
            this._pages = this._pages.slice(0, index).concat(this._pages.slice(index+1, this._pages.length));
        }

        getLength(index: number): string {
            var pageInfo = this._pages[index];
            return pageInfo.length + (pageInfo.lengthAbsolute ? 'px' : '%');
        }

        setLength(index: number, length: string) {
            var lengthValue: number;
            var lengthAbsolute: boolean;
            
            if (!length || !(length = String(length))) {
                lengthValue = 1;
                lengthAbsolute = false;var pageInfo = this._pages[index];
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

            var pageInfo = this._pages[index];
            pageInfo.length = lengthValue;
            pageInfo.lengthAbsolute = lengthAbsolute;

            var lengthString;
            if (lengthAbsolute) {
                var totalProportionalLength = 0;
                for (var i = 0; i < this._pages.length; i++) {
                    var p = this._pages[i];
                    if (!p.lengthAbsolute)
                        totalProportionalLength += p.length;
                }
                lengthString = (lengthValue * 100 / totalProportionalLength) + '%';
            }
            else {
                lengthString = String(lengthAbsolute);
            }

            if (this._vertical) {
                var contentRow = <HTMLTableRowElement>this._tab.rows[index*2+1];
                contentRow.setAttribute('height', lengthString);
            }
            else {
                var headerCell = <HTMLTableCellElement>(<HTMLTableRowElement>this._tab.rows[0]).cells[index*2];
                headerCell.setAttribute('width', lengthString);
            }
        }

        getCollapsed(index: number): boolean {
            var pageInfo = this._pages[index];
            return pageInfo.collapsed;
        }

        setCollapsed(index: number, collapsed: boolean) {
            var pageInfo = this._pages[index];
            pageInfo.collapsed = collapsed ? true : false; // coercing to boolean

            // TODO: update collapsed
        }

        getContent(index: number): any {
            var pageInfo = this._pages[index];
            return pageInfo.content;
        }

        setContent(index: number, content: any) {
            var pageInfo = this._pages[index];
            pageInfo.content = content;
            var contentCell = this._vertical ?
                (<HTMLTabeRowElement>this._tab.rows[index*2+1]).cells[0] :
                (<HTMLTableRowElement>this._tab.rows[1]).cells[index];
            setContent(contentCell, content);
        }

        getHeader(index: number): any {
            var pageInfo = this._pages[index];
            return pageInfo.header;
        }

        setHeader(index: number, header: any) {
            var pageInfo = this._pages[index];
            pageInfo.header = header;
            var headerCell = this._vertical ?
                <HTMLTableCell>(<HTMLTableRowElement>this._tab.rows[index*2]).cells[0] :
                <HTMLTableCell>(<HTMLTableRowElement>this._tab.rows[0]).cells[index*2];
            var headerHost = headerCell.getElementsByTagName('div')[0];
            setContent(headerHost, header);
        }
        
        private _recreateTableContent() {
            var totalProportionalLength = 0;
            for (var i = 0; i < this._pages.length; i++) {
                var p = this._pages[i];
                if (!p.lengthAbsolute)
                    totalProportionalLength += p.length;
            }
            
            var percentRatio = 100 / totalProportionalLength;

            this._tab.innerHTML = '';
            if (this._vertical) {
                for (var i = 0; i < this._pages.length; i++) {
                    var p = this._pages[i];
                    
                    var headerRow = <HTMLTableRowElement>this._tab.insertRow(-1);
                    headerRow.setAttribute('height', '1');
                    var headerCell = headerRow.insertCell();
                    var headerHost = appendDiv(headerCell, this.headerClassName);
                    setContent(headerHost, p.header);
    
                    var contentRow = <HTMLTableRowElement>this._tab.insertRow(-1);
                    var contentCell = contentRow.insertCell();
                    contentCell.className = this.contentClassName;
                    contentCell.setAttribute('valign', 'top');
                    setContent(contentCell, p.content);
                    
                    contentRow.setAttribute(
                        'height',
                        p.lengthAbsolute ?
                            <any>p.length :
                            Math.floor(p.length * percentRatio) + '%');
                }
            }
            else {
                var headerRow = <HTMLTableRowElement>this._tab.insertRow(-1);
                headerRow.setAttribute('height', '1');
                
                this._tab.insertRow(-1);

                for (var i = 0; i < this._pages.length; i++) {
                    var p = this._pages[i];
                    
                    if (i>0) {
                        var splitterCell = <HTMLTableCellElement>(<HTMLTableRowElement>this._tab.rows[0]).insertCell(-1);
                        splitterCell.rowSpan = 2;
                        var splitterElement = appendDiv(splitterCell, this.splitterClassName);
                    }
                    
                    var headerCell = (<HTMLTableRowElement>this._tab.rows[0]).insertCell(-1);
                    var headerHost = appendDiv(headerCell, this.headerClassName);
                    setContent(headerHost, p.header);

                    var contentCell = (<HTMLTableRowElement>this._tab.rows[1]).insertCell(-1);
                    contentCell.className = this.contentClassName;
                    contentCell.setAttribute('valign', 'top');
                    setContent(contentCell, p.content);
                    
                    contentCell.setAttribute(
                        'width',
                        p.lengthAbsolute ?
                            <any>p.length :
                            Math.floor(p.length * percentRatio) + '%');
                }
            }
        }
    }
    
    function appendDiv(host: HTMLElement, className?: string): HTMLDivElement {
        var div = document.createElement('div');
        if (className)
            div.className = className;
        host.appendChild(div);
        return div;
    }

    function isElement(content: any) {
        return content && content.tagName && 'textContent' in content;
    }
    
    function setContent(host: HTMLElement, content: any) {
        if (isElement(content)) {
            host.appendChild(content);
        }
        else {
            host.textContent = content;
        }
    }
}