declare module platform {
    var name: string;
    var version: number;
    function logToConsole(text: any): void;
    function exec(commandLine: string, timeout: number, finished: (output: string[]) => void): void;
    function readLines(fileName: string, completed: (error: Error, lines: string[]) => void): void;
    function readBytes(fileName: string, completed: (error: Error, bytes: Uint8Array) => void): void;
}
