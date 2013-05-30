/// <reference path='../imports/typings/typescriptServices.d.ts' />
/// <reference path='../imports/typings/codemirror.d.ts' />

/// <reference path='CodeMirrorScriptSnapshot.ts' />

/** Handles and tracks changes in CodeMirror.Doc,
 * providing a way to retrieve historical snapshots from that business. */
class CodeMirrorScript {
    version = 1;
    contentLength = 0;
    
    private _editRanges: { length: number; textChangeRange: TypeScript.TextChangeRange; }[] = [];
    private _earlyChange: { from: number; to: number; } = null;
    
    constructor(private _doc: CM.Doc) {
        this._doc = _doc;
        
        CodeMirror.on(this._doc, 'beforeChange', (doc, change) => this._docBeforeChanged(change));
        CodeMirror.on(this._doc, 'change', (doc, change) => this._docChanged(change));
    }
    
    createSnapshot() {
        return new CodeMirrorScriptSnapshot(this._doc, this, this.version);
    }

    getTextChangeRangeBetweenVersions(startVersion:number, endVersion: number) {
        if (startVersion === endVersion)
            return TypeScript.TextChangeRange.unchanged;

        var initialEditRangeIndex = this._editRanges.length - (this.version - startVersion);
        var lastEditRangeIndex = this._editRanges.length - (this.version - endVersion);

        var entries = this._editRanges.slice(initialEditRangeIndex, lastEditRangeIndex);
        return TypeScript.TextChangeRange.collapseChangesAcrossMultipleVersions(entries.map(e => e.textChangeRange));
    }

    private _docBeforeChanged(change: CM.EditorChange) {
        var from = this._doc.indexFromPos(change.from);
        var to = this._doc.indexFromPos(change.to);
        
        this._earlyChange = { from: from, to: to };
    }

    private _docChanged(change) {
        if (!this._earlyChange)
            return;

        var newFromPosition = change.from;
        var newToPosition = !change.text || change.text.length === 0 ? change.from : {
            line: change.from.line + change.text.length,
            ch: (change.to.line == change.from.line ? change.from.ch : 0) + change.text[change.text.length - 1].length
        };

        var newLength = this._doc.indexFromPos(newToPosition) - this._doc.indexFromPos(newFromPosition);

        console.log(
            '_editContent('+
                this._earlyChange.from+', '+
                this._earlyChange.to+', '+
                (newLength - (this._earlyChange.to - this._earlyChange.from))+
            ') /*'+change.text+'*/');
            
        this._editContent(this._earlyChange.from, this._earlyChange.to, newLength);

        this._earlyChange = null;
    }

    private _editContent(start: number, end: number, newLength: number) {
        this.contentLength += end - start + newLength;
        
        var newSpan = TypeScript.TextSpan.fromBounds(start, end);
        
        // Store edit range + new length of script
        var textChangeRange = new TypeScript.TextChangeRange(
            newSpan,
            newLength);

        this._editRanges.push({
            length: this.contentLength,
            textChangeRange: textChangeRange
        });

        // Update version #
        this.version++;
    }
}