/// <reference path="../io.ts" />
/// <reference path="node.d.ts" />

module platform {
    export function print(text: any): void {
        return getPlatform().print(text);
    }

    export function getReader(path: string): io.BinaryReader {
        return getPlatform().getReader(path);
    }

    export function runTest(scriptPath: string): TestResult[] {
        throw new Error("Not implemented.");
    }

    export function reportTest(name: string, success: bool): void {
        throw new Error();
    }

    export interface TestResult {
        name: string;
        success: bool;
        log: string;
    }

    var cachedDetectedPlatform: Platform;

    function getPlatform(): Platform {
        if (!cachedDetectedPlatform) {
            if (ActiveXObject) {
                // TODO: detect WSH, HTA or IE flavour
                cachedDetectedPlatform = new WshPlatform();
            }
            else if (process) {
                cachedDetectedPlatform = new NodePlatform();
            }
            else {
                throw new Error("Unknown platform, can't run tests.");
            }
        }

        return cachedDetectedPlatform;
    }

    interface Platform {
        getReader(path: string): io.BinaryReader;
        print(text: any): void;
        exec(commandLine: string): string[];
        runTest(scriptPath: string): TestResult[];
    }

    class NodePlatform extends Platform {
        getReader(path: string): io.BinaryReader {
            throw new Error();
        }

        print(text: any): void {
            console.log(text);
        }

        exec(commandLine: string): string[] {
            throw new Error("exec is not implemented on Node platform.");
        }

        runTest(scriptPath: string): TestResult[] {
            throw new Error("runTest is not implemented on Node platform.");
        }
    }

    class WshPlatform implements Platform {
        private fs: any;
        
        constructor () {
            this.fs = new ActiveXObject("Scripting.FileSystemObject");
        }

        getReader(path: string): io.BinaryReader {
            throw new Error("WSH is not implemented yet.");
        }

        print(text: any): void {
            WScript.Echo(text);
        }

        exec(commandLine: string): string[] {
            throw new Error("exec is not implemented on WSH platform.");
        }

        runTest(scriptPath: string): TestResult[] {
            throw new Error("runTest is not implemented on WSH platform.");
        }

    }
}