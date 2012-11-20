/// <reference path="platform.ts" />

module tests {

    export interface Environment {
        log(text: any): void;
        complete(): void;
        fail(): void;
    }

    export function start(testName: string): Environment {
        var environment = new CachingEnvironment(testName, (success: bool) => {
            testResults.push({
                testName: testName,
                success: success,
                log: environment.log
            });
        });

        return environment;
    }

    export interface TestResult {
        testName: string;
        success: bool;
        log: string[];
    }

    export var testResults: TestResult[] = [];

    class CachingEnvironment implements Environment {
        logLines: string[] = [];

        constructor (public testName: string, private completed: (bool) => void) {
        }

        log(text: any): void {
            var textString = String(text);
            this.logLines.push(textString);
            platform.logToConsole(this.testName + ": " + textString);
        }

        complete(): void {
            if (this.completed)
                this.completed(true);
        }

        fail(): void {
            if (this.completed)
                this.completed(false);
        }
    }
}