var fs = require('fs');
var child_process = require('child_process');
var nodeExec = child_process.exec;
var tmpDir = '.tmp';

console.log('Building an resyncing the site.');

rebuildTypescriptServicesIfNeeded(function() {
    copyTypescriptServicesIfNewer(function() {
        copyCodeMirrorIfNewer();
    });
});

function compileTSConsole() {
    buildScript('tsconsole/tsconsole.ts', 'tsconsole/tsconsole.js');
}

function copyCodeMirrorIfNewer(completed) {
    if (!completed) {
        completed = function(copyError) {
            if (copyError)
                console.log(copyError);
            else
                console.log(' -copied successfully.');
        }
    }

    ifNewer(['../CodeMirror/lib/codemirror.css','../CodeMirror/lib/codemirror.js'], ['import/codemirror'],
        function(sourceTime, copyTime, inputAge, copyAge) {
            console.log('  CodeMirror: new files ('+inputAge+' hours old, '+(copyAge-inputAge)+' hours after the last copy).');
            copyFile('../CodeMirror/lib/codemirror.css', 'import/codemirror/codemirror.css');
            copyFile('../CodeMirror/lib/codemirror.js', 'import/codemirror/codemirror.js');
            copyFile('../CodeMirror/addon/hint/show-hint.css', 'import/codemirror/show-hint.css');
            copyFile('../CodeMirror/addon/hint/show-hint.js', 'import/codemirror/show-hint.js');
            console.log(' -copied.');
            
            completed();
        },
        function() {
            console.log(' -CodeMirror: up-to-date.');
            
            completed();
        })
}


function copyTypescriptServicesIfNewer(completed) {
    if (!completed) {
        completed = function(compileError) {
            if (compileError)
                console.log(compileError);
            else
                console.log(' -compiled successfully.');
        }
    }

    ifNewer(['../typescript/bin/typescriptServices.js'], ['import/typescript/typescriptServices.js'],
        function(typescriptTime, copyTime, inputAge, copyAge) {
            console.log('  TypeScript: new typescriptServices.js ('+inputAge+' hours old, '+(copyAge-inputAge)+' hours after the last copy).');
            copyFile('../typescript/bin/typescriptServices.js', 'import/typescript/typescriptServices.js');
            console.log(' -copied.');
            
            completed();
        },
        function() {
            console.log(' -TypeScript services JS: up-to-date.');
            
            completed();
        })
}

function rebuildTypescriptServicesIfNeeded(completed) {
    if (!completed) {
        completed = function(compileError) {
            if (compileError)
                console.log(compileError);
            else
                console.log(' -compiled successfully.');
        }
    }
    
    ifNewer(['../typescript'], ['import/typings/typescriptServices.d.ts'],
        function newTypescriptDetected(typescriptTime, buildTime, inputAge, compileAge) {
            console.log('  TypeScript: new sources ('+inputAge+' hours old, '+(compileAge-inputAge)+' hours after the last compilation).');
            console.log('  Need to rebuild typescriptServices.d.ts.');
            
            cleanTempDirectory();
            console.log('  tsc typescriptServices.ts --declaration');
            exec(
                'nodejs ../typescript/bin/tsc.js'+
                ' ../typescript/src/services/typescriptServices.ts'+
                ' --out '+tmpDir+'/typescriptServices.js'+
                ' --declaration',
                function(error, stdout, stderr) {
                    var successfullyCompiled = false;
                    if (fs.existsSync(tmpDir+'/typescriptServices.d.ts')) {
                        copyFile(tmpDir+'/typescriptServices.d.ts', 'import/typings/typescriptServices.d.ts');
                        
                        successfullyCompiled = true;
                    }
                    
                    if (stderr.length) {
                        console.log((stdout+stderr).trim());
                    }

                    if (!successfullyCompiled)
                        completed(stdout+stderr);
                    else
                        completed();
                });
        },
        function (x,y) {
            console.log(' -TypeScript declaration: up-to-date.');
            completed();
        });
}

function copyFile(from, to) {
    fs.writeFileSync(to, fs.readFileSync(from));
}
    
function cleanTempDirectory() {
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir);
    }
    else {
        var removeLater = [];
        listFilesRecursively(tmpDir, true, function(f, stat) {
            if (stat.isFile()) {
                fs.unlinkSync(f);
            }
            else {
                removeLater.push(f);
            }
        });
        
        for (var i = removeLater.length-1; i>=0; i--) {
            var d = removeLater[i];
            fs.rmdirSync(d);
        }
    }
}

function ifNewer(inputFiles, outputFiles, ifNewer, ifNotNewer) {
    var latestInputChanges = latestFileChanges(inputFiles);
    var earliestOutputChanges = earliestFileChanges(outputFiles);
    
    if (latestInputChanges===null ||
        (earliestOutputChanges!==null
        && latestInputChanges.getTime() < earliestOutputChanges.getTime())) {

//        console.log(
//            'not newer## '+
//            inputFiles.join(',')+' : '+latestInputChanges,
//            outputFiles.join(',')+' : '+earliestOutputChanges);

        if (ifNotNewer)
            ifNotNewer(latestInputChanges, earliestOutputChanges);
    }
    else {
        var now = new Date().getTime();
        var compileAge = Math.floor((now - earliestOutputChanges.getTime())/1000/60/60);
        var inputAge = Math.floor((now - latestInputChanges.getTime())/1000/60/60);
        
//        console.log(
//            'newer '+
//            inputFiles.join(',')+' : '+latestInputChanges,
//            outputFiles.join(',')+' : '+earliestOutputChanges);
        
        if (ifNewer)
            ifNewer(latestInputChanges, earliestOutputChanges, inputAge, compileAge);
    }
}

function minTime(times) {
    var result = null;
    for (var i = 0; i < times.length; i++) {
        if (!times[i]) continue;
        if (!result || times[i].getTime() < result.getTime())
            result = times[i];
    }
    return result;
}

function maxTime(times) {
    var result = null;
    for (var i = 0; i < times.length; i++) {
        if (!times[i]) continue;
        if (!result || times[i].getTime() > result.getTime())
            result = times[i];
    }
    return result;
}

function latestFileChanges(files) {
    var latestDate = null;
    listFilesRecursively(files, function(f, stats) {
        latestDate = maxTime([latestDate, /*stats.atime,*/ stats.mtime, stats.ctime]);
    });
    return latestDate;
}

function earliestFileChanges(files) {
    var earliestDate = null;
    listFilesRecursively(files, function(f, stats) {
        earliestDate = minTime([earliestDate, /*stats.atime,*/ stats.mtime, stats.ctime]);
    });
    return earliestDate;
}

function listFilesRecursively(inputFilesOrDirectories, reportDirectories, foreachFileCallback) {
    if (typeof reportDirectories==='function') {
        foreachFileCallback = reportDirectories;
        reportDirectories = false;
    }
    
    var input = inputFilesOrDirectories;
    var subdirectories = [];
    var distinct = {};
    while (input.length) {
        for (var i = 0; i < input.length; i++) {
            var f = input[i];
            if (f.substring(0,1)==='.' && f.substring(1,2)!=='.')
                continue;                
            
            var stats;
            try {
                stats = fs.statSync(f);
            }
            catch (notAFileNorDirectoryError) {
                continue;
            }

            if (stats.isFile()) {
                if (!(f in distinct)) {
                    distinct[f] = 0;
                    foreachFileCallback(input[i], stats);
                }
            }
            else if (stats.isDirectory()) {
                if (!(f in distinct)) {
                    if (reportDirectories)
                        foreachFileCallback(input[i], stats);
                    
                    distinct[f] = 0;
                    var subdirs = fs.readdirSync(f);
                    for (var j = 0; j < subdirs.length; j++) {
                        var prefix = f;
                        if (prefix[prefix.length-1]==='/'
                            || prefix[prefix.length-1]==='\\')
                            prefix = prefix.substring(0, prefix.length-1);
                            
                        subdirectories.push(prefix + '/' + subdirs[j]);
                    }
                }
            }
        }
        
        input = subdirectories;
        subdirectories = [];
    }
}

function exec(cmd, oncompleted) {
    nodeExec(cmd, function (error, stdout, stderr) {
        var result = [];
        if (stdout)
            result = result.concat(stdout);
        if (stderr)
            result = result.concat(stderr);

        if (oncompleted)
            oncompleted(error, result);
    });
}

function buildScript(input, output, oncompleted) {
    console.log('tsc ' + input);
    exec('nodejs ../imports/typescript/bin/tsc.js ' + input + ' --out ' + output + ' --sourcemap --comments', function (error, outputLines) {
        if (outputLines && outputLines.length) {
            for (var i = 0; i < outputLines.length; i++) {
                console.log(outputLines[i]);
            }
        }

        if (oncompleted)
            oncompleted(error);
    });
}