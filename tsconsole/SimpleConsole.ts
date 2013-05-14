/// <reference path='../import/typings/typescriptServices.d.ts' />
/// <reference path='../import/typings/codemirror.d.ts' />
/// <reference path='../import/typings/codemirror.show-hint.d.ts' />

/// <reference path='SplitController.ts' />
/// <reference path='LanguageHost.ts' />

class SimpleConsole {
    private _splitController: SplitController;
    private _editor: CM.Editor;
	private _languageHost: LanguageHost;
    
    private _oldVersion = 0;
    private _oldSyntaxTree: TypeScript.SyntaxTree = null;

	typescript: Services.ILanguageService;
    
	constructor(private _host?: HTMLElement, private _global = window) {
		if (typeof this._host === 'undefined')
			this._host = this._global.document.body;
            
        this._splitController = new SplitController(this._host, this._global);
        this._splitController.setSplitterPosition(0.8);
            
		this._editor = <CM.Editor>(<any>this._global).CodeMirror(this._splitController.left, {
    		mode:  "text/typescript",
			matchBrackets: true,
			autoCloseBrackets: true,
			lineNumbers: true,
            extraKeys: {
                '.': () => this._provisionalCompletion('.'),
                Space: () => this._provisionalCompletion(' '),
                'Ctrl-Space': () => this._provisionalCompletion('Ctrl-Space')
            }
		});
        
        //this._splitController.right.style.background = 'silver';
        this._splitController.right.style.overflow = 'auto';
        this._splitController.right.style.fontSize = '80%';

		var doc = this._editor.getDoc();
		this._languageHost = new LanguageHost(doc);

		var factory = new Services.TypeScriptServicesFactory();
		this.typescript = factory.createPullLanguageService(this._languageHost);
        
        var updateTypescriptTimeout = null;
        var queueUpdate = () => {
            if (updateTypescriptTimeout)
                this._global.clearTimeout(updateTypescriptTimeout);
            updateTypescriptTimeout = this._global.setTimeout(() => {
                this._refreshCompletions();
                //this._refreshTS();
            }, 300);
        };
        
        CodeMirror.on(doc, 'change', (doc, change) => {
            //queueUpdate();
        });
        
        this._editor.on('cursorActivity', (editor) => {
            //queueUpdate();
        });
	}
    
    private _isProvisionalCompletionQueued = false;
    
    private _provisionalCompletion(char: string) {
        if (this._isProvisionalCompletionQueued)
            return;
        this._isProvisionalCompletionQueued = true;
        
        setTimeout(() => {
            this._isProvisionalCompletionQueued = false;
            
            var doc = this._editor.getDoc();
            var cursorPos = doc.getCursor();
            
            var tsCompletions = this._getTypeScriptCompletions(doc, cursorPos);
            var cmCompletions = this._getCodeMirrorCompletions(doc, cursorPos, tsCompletions);
    
            if (!cmCompletions.length)
                return;
                
            CodeMirror.showHint(
                this._editor,
                () => {
                    doc = this._editor.getDoc();
                    cursorPos = doc.getCursor();
                    
                    tsCompletions = this._getTypeScriptCompletions(doc, cursorPos);
                    cmCompletions = this._getCodeMirrorCompletions(doc, cursorPos, tsCompletions);

                    return {
                       list: cmCompletions,
                        from: cursorPos,
                        to: cursorPos
                   };
                });
        }, 10);
        
        return CodeMirror.Pass;
    }

    private _getFullCompletionList() {
        var doc = this._editor.getDoc();
        var cursorPos = doc.getCursor();
        
        var tsCompletions = this._getTypeScriptCompletions(doc, cursorPos);
        var cmCompletions = this._getCodeMirrorCompletions(doc, cursorPos, tsCompletions);
        
        return cmCompletions;
    }

    private _getTypeScriptCompletions(doc: CM.Doc, cursorPos: CM.Position) {
        var cursorOffset = doc.indexFromPos(cursorPos);
        
        var completions = this.typescript.getCompletionsAtPosition('main.ts', cursorOffset, true);
        return completions;
    }
    
    private _getCodeMirrorCompletions(doc: CM.Doc, cursorPos: CM.Position, tsCompletions: Services.CompletionInfo) {
        if (!tsCompletions || !tsCompletions.entries.length)
            return [];
            
        var cmCompletions = [];
        for (var i = 0; i < tsCompletions.entries.length; i++) {
            var tsco = tsCompletions.entries[i];
            cmCompletions.push({
                displayText: tsco.name,
                text: tsco.name,
            })
        }
        return cmCompletions;
    }
    
    private _refreshCompletions() {
        var doc = this._editor.getDoc();
        var cursorPos = doc.getCursor();
        var cursorOffset = doc.indexFromPos(cursorPos);
        
//        try {
//            var completions = this.typescript.getCompletionsAtPosition('main.ts', cursorOffset, true);
//            //console.log(completions);
//            if (completions)
//                this._splitController.right.innerHTML = completions.entries.map(k => (k.fullSymbolName||k.name)+':'+k.kind+' '+k.kindModifiers+(k.docComment ? '/**'+k.docComment+'*/':'')).join('<br> ')+'';
//        }
//        catch (error) {
//            this._splitController.right.textContent = error.stack;
//        }
        
        var struct = this.typescript.getScriptLexicalStructure('main.ts');
        //console.log(struct);
        
        this._splitController.right.innerHTML = '';
        if (!struct)
            return;
        
        var totalHeight = doc.lineCount();
        var lastLine = 0;
        
        for (var i = 0; i < struct.length; i++) {
            ((item: Services.NavigateToItem) => {
                var startPos = doc.posFromIndex(item.minChar);
                var endPos = doc.posFromIndex(item.limChar);
                
                if (startPos.line>lastLine+1) {
    //                var filler = document.createElement('div');
    //                filler.style.height = ((pos.line - lastLine) * 60 / totalHeight) + '%';
    //                filler.style.background = 'tomato';
    //                this._splitController.right.appendChild(filler);
                }
                lastLine = startPos.line;
                
                var element = document.createElement('div');

                var text = doc.getLine(startPos.line);
                var itemStart = 0;
                if (text.substring(0, startPos.ch).trim().length>0)
                    itemStart = startPos.ch;
                    
                var itemEnd = text.length;
                if (endPos.line === startPos.line)
                    itemEnd = endPos.ch;
                    
                text = text.substring(itemStart, itemEnd);
                if (endPos.line > startPos.line)
                    text += '...';
                    
                element.textContent = text;// item.kind + ' ' + item.name;

                //navigateElement.title = pos.line+': '+itemText;
        
                this._splitController.right.appendChild(element);
            })(struct[i]);
        }
    }
    
    private _fetchSyntaxTree() {
        var newSnapshot = this._languageHost.getScriptSnapshot('main.ts');
        var simpleText = TypeScript.SimpleText.fromScriptSnapshot(newSnapshot);
        
        if (!this._oldSyntaxTree) {
            this._oldSyntaxTree = TypeScript.Parser.parse(
                'main.ts',
                simpleText,
                false,
                TypeScript.LanguageVersion.EcmaScript3,
                new TypeScript.ParseOptions(true, true));
        }
        else {
            var changes = newSnapshot.getTextChangeRangeSinceVersion(this._oldVersion);
            this._oldSyntaxTree = TypeScript.Parser.incrementalParse(
                this._oldSyntaxTree,
                changes,
                simpleText);
        }
        this._oldVersion = this._languageHost.getScriptVersion('main.ts');

        return this._oldSyntaxTree;
    }
    
    private _refreshTS() {
        this._splitController.right.textContent = '';
        
        try {
            var structure = this._fetchSyntaxTree();
            if (!structure) return;
            this._render(this._splitController.right, structure.sourceUnit());
        }
        catch (syntaxError) {
            this._splitController.right.textContent = syntaxError.stack;
        }
    }
    
    private _syntaxKindMap: any = null;
    
    private _render(host: HTMLElement, sourceUnit: TypeScript.ISyntaxElement) {
        try {
            var title = this._global.document.createElement('div');
            if (sourceUnit) {
                var kind = sourceUnit.kind();
                if (!this._syntaxKindMap) {
                    this._syntaxKindMap = {};
                    for (var k in TypeScript.SyntaxKind) if (TypeScript.SyntaxKind.hasOwnProperty(k)) {
                        this._syntaxKindMap[TypeScript.SyntaxKind[k]] = k;
                    }
                }
                var count = sourceUnit.childCount();
                var text = null;
                var childHost = null;
                
                if (count > 0) {
                    childHost = this._global.document.createElement('div');
                    childHost.style.marginLeft = '0.5em';
                    
                    for (var i = 0; i < count; i++) {
                        var child = sourceUnit.childAt(i);
                        this._render(childHost, child);
                    }
                    
                    text = this._syntaxKindMap[kind] + '['+count+']';
                }
                else {
                    var txt =
                        'valueText' in sourceUnit ? (<any>sourceUnit).valueText() :
                        'fullText' in sourceUnit ? (<any>sourceUnit).fullText() :
                        'text' in sourceUnit ? (<any>sourceUnit).text() :
                        null;
                        
                    if (txt.indexOf('\n')<0 && txt.length < 10)
                        text = '"'+txt+'" ' + this._syntaxKindMap[kind];
                }
                title.textContent = text;
                title.title = (<any>sourceUnit).constructor.name;
            }
            else {
                title.textContent = '-null-';
            }

                
            host.appendChild(title);
            
            if (childHost)
                host.appendChild(childHost);
        }
        catch (titleError) {
            title.textContent = titleError.message;
            return;
        }
    }
}