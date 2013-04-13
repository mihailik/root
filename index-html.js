//<script>var startLoad = new Date()</script><script src="../typescript/bin/typescriptServices.js"></script><script>document.body.textContent = '';</script><link rel=stylesheet href="codemirror.css"></link><link rel=stylesheet href="show-hint.css"></link><script src="codemirror-compressed.js"></script><script src="show-hint.js"></script><script>

document.title = 'tsconsole';

window.onload = function() {


CodeMirror.commands.autocomplete = function(cm) {

	var start = new Date();

	var cursorPos = editor.getCursor();

	var svc = createService(editor.getValue());
	window.editorSvc = svc;

	var index = editor.indexFromPos(cursorPos);

	console.log(cursorPos, index);
	var complet = svc.getCompletionsAtPosition('main.ts', index);
	var end = new Date();
	console.log('----------------- completions: ' + complet.entries.length + ' in ' + (end.getTime() - start.getTime() ) + ' ----------------------');

	var line = editor.getLine(cursorPos.line);
	var completionStart = '';
	for (var i = cursorPos.ch-1; i >=0; i--) {
		var c = line.charAt(i);
		if (isLetterOrDigit(c))
			completionStart = c + completionStart;
		else
			break;
	}
	console.log('completionStart: ', completionStart);
	var completionStartUpperCase = completionStart.toUpperCase();
	console.log('completionStartUpperCase: ', completionStartUpperCase);

	function isLetterOrDigit(c) {
		if (c>='a' && c<='z') return true;
		if (c>='A' && c<='Z') return true;
		if (c>='0' && c<='9') return true;
		if (c==='_' || c==='$') return true;

		return false;
	}

	var clist = [];
	for (var i = 0; i < complet.entries.length; i++) {
		var ce = complet.entries[i];

		var startsWith = ce.name.substring(0, completionStart.length);
		console.log('startsWith: ', startsWith);
		if (startsWith.toUpperCase()!==completionStartUpperCase)
			continue;

		(function(ce) {
			clist.push({
				text: ce.name.substring(completionStart.length),
				render: function(element) {
					//ce.kind + ' ' + ce.name + ':' + ce.type

					if (ce.kind) {
						var kindElement = document.createElement('span');
						kindElement.textContent = ce.kind + ' ';
						kindElement.style.opacity = '0.7';
						element.appendChild(kindElement);
					}

					var nameElement = document.createElement('span');
					nameElement.textContent = ce.name;
					element.appendChild(nameElement);

					if (ce.type) {
						var typeElement = document.createElement('span');
						typeElement.textContent = ': ' + ce.type;
						typeElement.style.opacity = '0.7';
						element.appendChild(typeElement);
					}
				}
			});
		})(ce);
	}

	CodeMirror.showHint(
		cm,
		function () {
			return {
    			list: clist,
        		from: cursorPos,
        		to: cursorPos
        	};
        });
    };


function createService(text) {
	var text = text || editor.getValue();	

	var settings = new TypeScript.CompilationSettings();

	var host = {
		getCompilationSettings: function () { return settings; },
		getScriptFileNames: function() { return [ 'main.ts' ]; },
		getScriptVersion: function(fileName) { return 0; },
		getScriptIsOpen: function(fileName) { return true; },
		getScriptSnapshot: function(fileName) { return new TypeScript.ScriptSnapshot.fromString(text); },
		getDiagnosticsObject: function() { return { log: function(txt) { console.log(txt); } }; },

		information: function() { return true; },
        debug: function() { return true; },
        warning: function() { return true; },
        error: function() { return true; },
        fatal: function() { return true; },
        log: function(s) { console.log(s); }
    };

	var fct = new Services.TypeScriptServicesFactory();
	var svc = fct.createPullLanguageService(host);

	svc.refresh();

	return svc;
}

    
	    	var oldText = '';
	    	var oldSelection = { line: 0, ch: 0 };
	    	var txt = document.getElementById('txt');
	    	if (txt) {
	    		oldText = txt.textContent;
	    		txt.textContent = '';
	    	}
	    	else {
	    		txt = document.createElement('div');
	    		txt.id = 'txt';
	    		(function(s) {
	    			s.overflow = 'hidden';
	    			s.position = 'absolute';
	    			s.left = s.top = s.right = s.bottom = '0px';
	    		})(txt.style);
	    		document.body.appendChild(txt);

	    		oldText = localStorage.tsconsoleText || '';
	    		oldSelection.line = (localStorage.tsconsoleLine || 0) |0;
	    		oldSelection.ch = (localStorage.tsconsoleCh || 0) |0;
	    	}
		    var endLoad = new Date();
	
    		var editor = CodeMirror(txt, {
	    		mode:  "javascript",
    			matchBrackets: true,
    			autoCloseBrackets: true,
    			lineNumbers: true,
    			onKeyEvent: function(_ed, _ev) {
    				editorKeyEvent(_ed, _ev);
    			},
    			extraKeys: {"Ctrl-Space": "autocomplete"}
    		});

    		editor.setValue(oldText);
    		setTimeout(function() {
    			editor.setCursor(oldSelection);
    		}, 100);
    		editor.focus();

    		var changeTimeout = null;
    		function queueTextPersistence() {
    			if (changeTimeout) {
    				clearTimeout(changeTimeout);
    				changeTimeout = null;
    			}

    			changeTimeout = setTimeout(function() {
    				changeTimeout = null;
    				localStorage.tsconsoleText = editor.getValue();
    			}, 200);
    		}

    		editor.on('change', function() {
    			queueTextPersistence();    			
    		});

    		editor.on('cursorActivity', function() {
    		    return;
    		    // **************** switching off manual auto-complete


    			var storeSelection = editor.getCursor();
    			localStorage.tsconsoleLine = storeSelection.line;
    			localStorage.tsconsoleCh = storeSelection.ch;
    		});

    		function editorKeyEvent(_, keyEvent) {
    			if (keyEvent.type!=='keydown')
    				return;

    			window.editorKeyEvent = keyEvent;
    			if (keyEvent.ctrlKey && keyEvent.keyCode===32) {
    				return;
    				console.log('ctrl+space!');
    				keyEvent.cancelBubble = true;
    				keyEvent.stop();
    				handleCtrlSpace(editor);
    				return false;
    			}
    		}

    		window.editor = editor;




function handleCtrlSpace(editor) {
	var start = new Date();
	var svc = createService(editor.getValue());
	window.editorSvc = svc;

	var cursorPos = editor.getCursor();
	var index = editor.indexFromPos(cursorPos);

	console.log(cursorPos, index);
	var complet = svc.getCompletionsAtPosition('main.ts', index);
	var end = new Date();
	console.log('----------------- completions: ' + complet.entries.length + ' in ' + (end.getTime() - start.getTime() ) + ' ----------------------');
	for (var i = 0; i < complet.entries.length; i++) {
		var ce = complet.entries[i];
		if (ce.kind)
			console.log(ce.kind + ' ' + ce.name + ':' + ce.type + '    -', ce);
		else
			console.log('                     -' + ce);
	}
}

}


//</script>