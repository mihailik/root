declare module tests {
    interface Environment {
        log(text: any): void;
        complete(): void;
        fail(): void;
    }
    function start(testName: string): Environment;
    interface TestResult {
        testName: string;
        success: bool;
        log: string[];
    }
    var testResults: TestResult[];
}
