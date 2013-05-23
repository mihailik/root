if ('WScript' in (function() { return this;})()) {
    WScript.Echo('This script is not compatible with Windows Script Host, use Node.js please.');
    WScript.Sleep(3000);
    WScript.Quit();
}

var fs = require('fs');
var child_process = require('child_process');
var exec = child_process.exec;
var tmpDir = '.tmp';

build(
    'Copy CodeMirror files',
    [
        '../CodeMirror/lib/codemirror.css',
        '../CodeMirror/lib/codemirror.js'
    ],
    [
        'import/codemirror'
    ],
    function() {
        
    });

function build(actionName, inputFiles, outputFiles, buildAction) {
    
}