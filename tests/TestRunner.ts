/// <reference path="testPEFile.ts" />

module TestRunner {

	function collectTests(moduleObj): TestCase[] {

		var testList: TestCase[] = [];

		function collectTestsCore(namePrefix: string, moduleObj, test_prefixOnly: bool) {
			for (var testName in moduleObj) {
				if (moduleObj.hasOwnProperty && !moduleObj.hasOwnProperty(testName))
					continue;

				if (test_prefixOnly) {
					if (testName.substring(0,"test_".length)!=="test_")
						continue;
				}

				var test = moduleObj[testName];

				if (typeof(test)==="function") {
					var testName = test.name;
					if (!testName) {
						testName = test.toString();
						testName = testName.substring(0, testName.indexOf("("));
						testName = testName.replace(/function /g, "");
					}

					testList.push(new TestCase(namePrefix + testName, test));
					continue;
				}

				if (typeof(test)==="object") {
					collectTestsCore(namePrefix + testName + ".", test, false);
				}
			}
		}

		collectTestsCore("", moduleObj, false);

		return testList;
	}

	function runTest(test: TestCase, onfinish: () => void) {
		var logPrint = (s) => {
			test.logText += (test.logText.length>0 ? "\n" : "") + s;
		};

		var startTime = new Date().getTime();
		var updateTime = () => {
			var endTime = new Date().getTime();

			test.executionTimeMsec = endTime - startTime;
		};

		try {
			var ts: TestRuntime = <any>{
				ok: (message: string) => {
					if (test.success===false)
						return;

					if (message)
						logPrint(message);
					test.success = true;
					updateTime();
					onfinish();
				},
				fail: (message: string) => {
					if (message)
						logPrint(message);
					test.success = false;
					updateTime();
					onfinish();
				},
				log: (message) => {
					if (message)
						logPrint(message);
				}
			};

			test.testMethod(ts);
		}
		catch (syncError) {
			logPrint(syncError.stack ? syncError.stack : syncError.message);
			test.success = false;
			onfinish();
		}

		// detect synchronous tests: they don't take arguments
		var openBracketPos = test.testMethod.toString().indexOf("(");
		if (openBracketPos>0 && test.testMethod.toString().substring(openBracketPos + 1, openBracketPos + 2) === ")") {
			test.success = true;
			onfinish();
		}
	}


	export interface TestRuntime {
		ok(message?: string): void;
		fail(message?: string): void;
		log(message: string): void;
	}

	export class TestCase {
		success: bool = <any>null;
		logText: string = "";
		executionTimeMsec: number = <any>null;

		constructor (public name: string, public testMethod: (ts: TestRuntime) => void) {
		}
	}

	export function runTests(moduleObj, onfinished?: (tests: TestCase[]) => void) {
		var tests = collectTests(moduleObj);

		function defaultOnFinished(tests: TestCase[]) {
			var sysLog;
			if (this.WScript)
				sysLog = (msg) => this.WScript.Echo(msg);
			else if (this.htmlConsole)
				sysLog = (msg) => this.htmlConsole.log(msg);
			else
				sysLog = (msg) => this.console.log(msg);

			for (var i = 0; i < tests.length; i++) {
				sysLog(tests[i].name + ": " + (tests[i].executionTimeMsec / 1000) + "s " + (tests[i].success ? "OK" : "FAIL") + " " + tests[i].logText);
			}
		}

		var i = 0;
		function next() {
			if (i >= tests.length) {
				if (onfinished)
					onfinished(tests);
				else
					defaultOnFinished(tests);
				return;
			}

			runTest(tests[i], () => {
				i++;
				next();
			});
		}

		next();
	}
}