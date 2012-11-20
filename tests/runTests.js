var require = require ? require : function (moduleName) {
    return null;
};
var http = require("http")
var url = require("url")
var title = "miPE Unit Tests";
var ActiveXObject;
if(ActiveXObject) {
    WScript.Echo("Windows Script Host: " + title + ".");
    switch(WScript.Arguments.length) {
        case 0: {
            defaultActionFromWSH();
            break;

        }
        case 1: {
            runTestsAndReportToNode(WScript.Arguments.Item(0));
            break;

        }
        default: {
            WScript.Echo("Invalid argument count.");
            break;

        }
    }
} else {
    runTestsInline();
    if(http) {
        startServer();
    }
}
function defaultActionFromWSH() {
    WScript.Echo("Seeking Node.js...");
    if(!tryRunningNodeFromWSH()) {
        WScript.Echo("Node is not found. Reverting to running tests inline.");
        runTestsInline();
    }
}
function tryRunningNodeFromWSH() {
    var wshell = new ActiveXObject("WScript.Shell");
    try  {
        var nodeProcess = wshell.Exec('node.exe "' + WScript.ScriptFullName + '"');
        while(!nodeProcess.Status) {
            if(!nodeProcess.StdOut.AtEndOfStream) {
                var line = nodeProcess.StdOut.ReadLine();
                WScript.Echo(line);
            } else {
                (WScript).Sleep(100);
            }
        }
        return true;
    } catch (error) {
        return error.message;
    }
}
function runTestsAndReportToNode(reportUrl) {
}
function startServer() {
    console.log("Node.js: " + title + ".");
    var server = http.createServer(function (req, res) {
        var reqUrl = url.parse(req.url);
        if(endsWith(reqUrl.pathname.toLowerCase(), ".js")) {
            return serveScript(reqUrl, res);
        }
    });
    server.listen(2828);
}
function serveScript(reqUrl, res) {
}
function endsWith(text, end) {
    return text.length >= end.length && text.substr(-end.length) == end;
}
function runTestsInline() {
}
