module Mi.PE.IO {
    export class Long {
        constructor (
            public lo: number,
            public hi: number) {
        }

        toString() {
            var result: string;
            if (this.hi == 0) {
                result = this.lo.toString(16);
            }
            else {
                result = this.lo.toString(16);
                result = ("0000").substring(result.length) + result;
                result = this.hi.toString(16) + result;
            }
            result = result.toUpperCase() + "h";
            return result;
        }
    }
}