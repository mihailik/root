/// <reference path='../import/typings/typescriptServices.d.ts' />
/// <reference path='../import/typings/codemirror.d.ts' />

class CodeMirrorScriptSnapshot implements TypeScript.IScriptSnapshot {
    constructor(
        private _doc: CM.Doc,
        private _script: {
            getTextChangeRangeBetweenVersions(scriptVersion: number, version: number): TypeScript.TextChangeRange;
        },
        private _version: number) {
    }
    
    getText(start: number, end: number): string {
        var startPos = this._doc.posFromIndex(start);
        var endPos = this._doc.posFromIndex(end);
        var text = this._doc.getRange(startPos, endPos);
    	return text;
	}

	getLength(): number {
		return this._doc.getValue().length;
	}

	getLineStartPositions(): number[]{
		var result: number[] = [];
		var pos: CM.Position = {
			line: 0,
			ch: 0
		};

		this._doc.eachLine((line) => {
			pos.line = result.length;
			var lineStartPosition = this._doc.indexFromPos(pos);
			result.push(lineStartPosition);
		} );
		return result;
	}

	getTextChangeRangeSinceVersion(scriptVersion: number): TypeScript.TextChangeRange {
		var range = this._script.getTextChangeRangeBetweenVersions(scriptVersion, this._version);
		return range;
	}
}