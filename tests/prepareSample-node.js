var fs = require("fs");
var sampleBuf = fs.readFileSync("sample.exe");

var lineArray = [];
for (var i = 0; i < sampleBuf.length; i++) {
	if (sampleBuf[i])
		lineArray[i] = sampleBuf[i];
}

console.log("var sampleBuf =");
console.log("["+lineArray.join(",")+"];");
if (sampleBuf[sampleBuf.length-1]===0)
	console.log("sampleBuf["+(sampleBuf.length-1)+"] = " + sampleBuf[sampleBuf.length-1]+"; // "+ sampleBuf.length+" bytes");