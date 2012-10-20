/// <reference path="Directory.ts" />

module Mi.PE.Internal {
    export class SectionHeader {
        constructor (
            public name: string,
            public map: Directory,
            public sizeOfRawData: number,
            public pointerToRawData: number) {
        }

        toString() { return this.name + " " + this.sizeOfRawData.toString(16) + ":" + this.pointerToRawData.toString(16) + "h=>" + this.map; }

        static mapVirtual(directory: Directory, sectionHeaders: SectionHeader[]) {
            for (var i = 0; i < sectionHeaders.length; i++) {
                var sec = sectionHeaders[i];

                if (directory.address >= sec.map.address
                    && directory.address + directory.size <= sec.map.address + sec.map.size) {

                    var sectionOffset = directory.address - sec.map.address;

                    return sec.pointerToRawData + sectionOffset;
                }
            }


            // No sections mapped, generate a pretty error.

            var sectionList = "";
            for (var i = 0 ; i < sectionHeaders.length; i++) {
                if (sectionList.length > 0)
                    sectionList += ", ";
                sectionList += sectionHeaders[i];
            }

            if (sectionList.length > 0)
                sectionList = " (" + sectionList + ")";

            throw new Error("Cannot map " + directory + " within any section" + sectionList + ".");
        }
    }
}