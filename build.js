var fs = require('fs');
var child_process = require('child_process');
var exec = child_process.exec;
var tmpDir = '.tmp';

console.log('Building an resyncing the site.');

rebuildTypescriptServicesIfNeeded();

function rebuildTypescriptServicesIfNeeded(completed) {
    if (!completed) {
        completed = function(compileError) {
            if (compileError)
                throw compileError;
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
                    if (stderr.length) {
                        console.log(stdout+stderr);
                        completed(new Error(stderr));
                    }
                    else {
                        console.log('ok');
                        // TODO: move the results, clean the rubbish behind
                        completed();
                    }
                });
        },
        function (x,y) {
            console.log('  TypeScript: up-to-date.');
            completed();
        });
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
        && latestInputChanges.getDate() < earliestOutputChanges.getDate())) {
        if (ifNotNewer)
            ifNotNewer(latestInputChanges, earliestOutputChanges);
    }
    else {
        var now = new Date().getTime();
        var compileAge = Math.floor((now - earliestOutputChanges.getTime())/1000/60/60);
        var inputAge = Math.floor((now - latestInputChanges.getTime())/1000/60/60);
        if (ifNewer)
            ifNewer(latestInputChanges, earliestOutputChanges, inputAge, compileAge);
    }
}

function latestFileChanges(files) {
    var latestDate = null;
    listFilesRecursively(files, function(f, stats) {
        var dt = stats.atime;
        if (dt.getDate() > stats.mtime.getDate())
            dt = stats.mtime;
        if (dt.getDate() > stats.ctime.getDate())
            dt = stats.ctime;
            
        if (latestDate === null || dt.getDate() > latestDate.getDate())
            latestDate = dt;
    });
    return latestDate;
}

function earliestFileChanges(files) {
    var earliestDate = null;
    listFilesRecursively(files, function(f, stats) {
        var dt = stats.atime;
        if (dt.getDate() < stats.mtime.getDate())
            dt = stats.mtime;
        if (dt.getDate() < stats.ctime.getDate())
            dt = stats.ctime;
            
        if (earliestDate === null || dt.getDate() < earliestDate.getDate())
            earliestDate = dt;
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