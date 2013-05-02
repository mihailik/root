var fs = require('fs');
var child_process = require('child_process');
var exec = child_process.exec;

console.log('Building an resyncing the site.');
ifNewer(['../typescript'], ['import/typings/typescriptServices.d.ts'],
    function newTypescriptDetected(typescriptTime, buildTime, inputAge, compileAge) {
        console.log('  TypeScript: new sources ('+inputAge+' hours old, '+(compileAge-inputAge)+' hours after the last compilation).');
        console.log('  Need to rebuild typescriptServices.d.ts.');
        
        cleanTempDirectory();
        // TODO exec tsc
    },
    function (x,y) { console.log('  TypeScript: up-to-date.'); });
    
function cleanTempDirectory() {
    // TODO check if directory exists, create or wipe out
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

function listFilesRecursively(inputFilesOrDirectories, foreachFileCallback) {
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