var test;
(function (test) {
    function start(testName) {
        var environment = new CachingEnvironment(testName, function (success) {
            test.testResults.push({
                testName: testName,
                success: success,
                log: environment.log
            });
        });
        return environment;
    }
    test.start = start;
    test.testResults = [];
    var CachingEnvironment = (function () {
        function CachingEnvironment(testName, completed) {
            this.testName = testName;
            this.completed = completed;
            this.logLines = [];
        }
        CachingEnvironment.prototype.log = function (text) {
            var textString = String(text);
            this.logLines.push(textString);
            platform.logToConsole(this.testName + ": " + textString);
        };
        CachingEnvironment.prototype.complete = function () {
            if(this.completed) {
                this.completed(true);
            }
        };
        CachingEnvironment.prototype.fail = function () {
            if(this.completed) {
                this.completed(false);
            }
        };
        return CachingEnvironment;
    })();    
})(test || (test = {}));
