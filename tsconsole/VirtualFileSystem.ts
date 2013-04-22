class VirtualFileChange {
    time: Date;

	constructor(public lineNumber: number, public lineOffset: number, public oldLength: number, public newText: string, utcDate: Date) {
		this.time = utcDate || VirtualFileChange.getUtcDate;
	}

	static getUtcDate() {
		var localDate = new Date();
		var utcDate = new Date(
			localDate.getUTCFullYear(),
			localDate.getUTCMonth(),
			localDate.getUTCDate(),
			localDate.getUTCHours(),
			localDate.getUTCMinutes(),
			localDate.getUTCSeconds());
		return utcDate;
	}

	toString() {
		return '[' + this.lineNumber + '] @' + this.lineOffset + ':' + this.oldLength + '="' + this.newText + '"';
	}
}

class VirtualFileLine {
    currentText: string;
    lineEnding = '\n';

    constructor (public originalText: string) {
        this.currentText = this.originalText;
        this.lineEnding = '\n';
    }

    applyChange(lineOffset: number, oldLength: number, newText: string) {
        this.currentText =
			this.currentText.substring(0, lineOffset) +
			newText +
			this.currentText.substring(lineOffset + oldLength);
    }
}

class VirtualFile {
    lines: VirtualFileLine[] = [];
    changes: VirtualFileChange[] = [];
    getUtcDate: () => Date;

    constructor () {
    }

    applyChange(lineNumber: VirtualFileChange);
    applyChange(lineNumber: number, lineOffset: number, oldLength: number, newText: string);
    applyChange(lineNumber: any, lineOffset?: number, oldLength?: number, newText?: string) {
        var change;
        if (lineNumber instanceof VirtualFileChange) {
            change = lineNumber;
        }
        else {
            change = new VirtualFileChange(lineNumber, lineOffset, oldLength, newText, this.getUtcDate ? this.getUtcDate() : null /* getUtcDate override */);
        }

        var line = this.lines[change.lineNumber];
        if (!line)
            line = new VirtualFileLine(newText);
        else
            line.applyChange(change.lineOffset, change.oldLength, change.newText);

        this.changes.push(change);
    }
}

class VirtualFileSystem {
    files = {};
    onfilechanged = null;

    constructor () {
    }

    getAllFiles() {
        var result = [];
        for (var f in this.files) if (this.files.hasOwnProperty(f)) {
            result.push({ name: f, file: this.files[f] });
        }
        result.sort(function (f1, f2) {
            return f1.name > f2.name ? 1 : f2.name > f1.name ? -1 : 0;
        });

        return result;
    }

    getOrCreateFile(filename: string) {
        var file = this.files[filename];
        if (!file) {
            this.files[filename] = file = new VirtualFile();

            if (this.onfilechanged)
                this.onfilechanged(filename, file);
        }

        return file;
    }
}