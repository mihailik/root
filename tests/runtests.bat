tsc readPEFile.ts -out readPEFile.js
if errorlevel 1 goto QUIT
node readPEFile.js
:QUIT