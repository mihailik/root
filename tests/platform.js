var platform;
(function (platform) {
    platform.name;
    platform.version;
    function logToConsole(text) {
        getPlatform().logToConsole(text);
    }
    platform.logToConsole = logToConsole;
    function exec(commandLine, timeout, finished) {
        getPlatform().exec(commandLine, timeout, finished);
    }
    platform.exec = exec;
    function readLines(fileName, completed) {
        getPlatform().readLines(fileName, completed);
    }
    platform.readLines = readLines;
    function readBytes(fileName, completed) {
        getPlatform().readBytes(fileName, completed);
    }
    platform.readBytes = readBytes;
    var cachedDetectedPlatform;
    function getPlatform() {
        if(!cachedDetectedPlatform) {
            if(process) {
                cachedDetectedPlatform = new NodePlatform();
            } else {
                throw new Error();
            }
        }
        return cachedDetectedPlatform;
    }
    var NodePlatform = (function () {
        function NodePlatform() {
            this.name = "node";
            var versionText = (process).version;
            var firstDotPos = versionText.indexOf(".");
            if(firstDotPos < 0) {
                this.version = parseFloat(versionText);
            } else {
                this.version = parseFloat(versionText.substring(0, firstDotPos) + "." + versionText.substring(firstDotPos + 1).replace(/\./g, ""));
            }
        }
        NodePlatform.child_process = undefined;
        NodePlatform.fs = undefined;
        NodePlatform.prototype.logToConsole = function (text) {
            console.log(text);
        };
        NodePlatform.prototype.exec = function (commandLine, timeout, finished) {
            if(!NodePlatform.child_process) {
                NodePlatform.child_process = require("child_process");
            }
            NodePlatform.child_process.exec(commandLine, function (error, stdout, stderr) {
                if(error) {
                    finished([]);
                    return;
                }
                var stdoutString = stdout.toString();
                var stderrString = stderr.toString();
                var output;
                if(stdoutString.length > 0 && stderrString.length > 0) {
                    output = stdoutString + "\n" + stderrString;
                } else {
                    output = stdoutString + stderrString;
                }
                return splitLines(output);
            });
        };
        NodePlatform.prototype.readLines = function (fileName, completed) {
            this.getFS().readFile(fileName, "utf8", function (error, data) {
                if(error) {
                    completed(error, null);
                } else {
                    completed(null, splitLines(data));
                }
            });
        };
        NodePlatform.prototype.readBytes = function (fileName, completed) {
            this.getFS().readFile(fileName, function (error, data) {
                if(error) {
                    completed(error, null);
                } else {
                    completed(null, data);
                }
            });
        };
        NodePlatform.prototype.getFS = function () {
            if(!NodePlatform.fs) {
                NodePlatform.fs = require("fs");
            }
            return NodePlatform.fs;
        };
        return NodePlatform;
    })();    
    function splitLines(output) {
        return output.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
    }
})(platform || (platform = {}));
