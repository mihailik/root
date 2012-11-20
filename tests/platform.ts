module platform {
    declare var require;
    declare var process;

    export var name: string;
    export var version: number;

    export function logToConsole(text: any): void {
        getPlatform().logToConsole(text);
    }

    export function exec(commandLine: string, timeout: number, finished: (output: string[]) => void ): void {
        getPlatform().exec(commandLine, timeout, finished);
    }

    export function readLines(fileName: string, completed: (error: Error, lines: string[]) => void ): void {
        getPlatform().readLines(fileName, completed);
    }

    export function readBytes(fileName: string, completed: (error: Error, bytes: Uint8Array) => void ): void {
        getPlatform().readBytes(fileName, completed);
    }

    var cachedDetectedPlatform: Platform;

    function getPlatform(): Platform {
        if (!cachedDetectedPlatform) {
            if (process)
                cachedDetectedPlatform = new NodePlatform();
            else
                throw new Error();
        }
        return cachedDetectedPlatform;
    }

    interface Platform {
        logToConsole(text: any): void;
        exec(commandLine: string, timeout: number, finished: (output: string[]) => void): void;
        readLines(fileName: string, completed: (error: Error, lines: string[]) => void): void;
        readBytes(fileName: string, completed: (error: Error, bytes: Uint8Array) => void): void;
    }

    class NodePlatform implements Platform {
        static child_process;
        static fs;
        
        name: string;
        version: number;

        constructor () {
            this.name = "node";
            var versionText = (<any>process).version;
            var firstDotPos = versionText.indexOf(".");
            if (firstDotPos<0)
                this.version = parseFloat(versionText);
            else
                this.version = parseFloat(versionText.substring(0, firstDotPos) + "." + versionText.substring(firstDotPos + 1).replace(/\./g, ""));
        }

        logToConsole(text: any) {
            console.log(text);
        }

        exec(commandLine: string, timeout: number, finished: (output: string[]) => void): void {
            if (!NodePlatform.child_process)
                NodePlatform.child_process = require("child_process");

            NodePlatform.child_process.exec(commandLine, (error: Error, stdout, stderr) => {
                if (error) {
                    finished([]);
                    return;
                }

                var stdoutString = stdout.toString();
                var stderrString = stderr.toString();
                var output;
                if (stdoutString.length>0 && stderrString.length > 0)
                    output = stdoutString + "\n" + stderrString;
                else
                    output = stdoutString + stderrString;

                return splitLines(output);
            });
        }

        readLines(fileName: string, completed: (error: Error, lines: string[]) => void ): void {
            this.getFS().readFile(fileName, "utf8", (error: Error, data: string) => {
                if (error) {
                    completed(error, null);
                }
                else {
                    completed(null, splitLines(data));
                }
            });
        }

        readBytes(fileName: string, completed: (error: Error, bytes: Uint8Array) => void ): void {
            this.getFS().readFile(fileName, (error: Error, data) => {
                if (error) {
                    completed(error, null);
                }
                else {
                    completed(null, data);
                }
            });
        }

        private getFS() {
            if (!NodePlatform.fs)
                NodePlatform.fs = require("fs");
            return NodePlatform.fs;
        }
    }

    function splitLines(output: string): string[] {
        return output.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
    }
}