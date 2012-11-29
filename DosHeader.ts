/// <reference path="Long.ts" />
/// <reference path="io.ts" />

module pe {

    export class DosHeader {

        mz: MZSignature;

        // Bytes on last page of file.
        cblp: number;

        // Pages in file.
        cp: number;

        // Relocations.
        crlc: number;

        // Size of header in paragraphs.
        cparhdr: number;

        // Minimum extra paragraphs needed.
        minalloc: number;

        // Maximum extra paragraphs needed.
        maxalloc: number;

        // Initial (relative) SS value.
        ss: number;

        // Initial SP value.
        sp: number;

        // Checksum.
        csum: number;

        // Initial IP value.
        ip: number;

        // Initial (relative) CS value.
        cs: number;

        // File address of relocation table.
        lfarlc: number;

        // Overlay number.
        ovno: number;

        res1: Long;

        // OEM identifier (for e_oeminfo).
        oemid: number;

        // OEM information: number; e_oemid specific.
        oeminfo: number;

        reserved: number[]; // uint[5]

        // uint: File address of PE header.
        lfanew: number;

        toString() {
            var result =
                "[" +
                (this.mz === MZSignature.MZ ? "MZ" :
                typeof this.mz === "number" ? (<number>this.mz).toString(16) + "h" :
                typeof this.mz) + "]" +

                ".lfanew=" +
                (typeof this.lfanew === "number" ? this.lfanew.toString(16) + "h" :
                typeof this.lfanew);

            return result;
        }

        read(reader: io.BinaryReader) {
            this.mz = reader.readShort();
            if (this.mz != MZSignature.MZ)
                throw new Error("MZ signature is invalid: " + (<number>(this.mz)).toString(16).toUpperCase() + "h.");

            this.cblp = reader.readShort();
            this.cp = reader.readShort();
            this.crlc = reader.readShort();
            this.cparhdr = reader.readShort();
            this.minalloc = reader.readShort();
            this.maxalloc = reader.readShort();
            this.ss = reader.readShort();
            this.sp = reader.readShort();
            this.csum = reader.readShort();
            this.ip = reader.readShort();
            this.cs = reader.readShort();
            this.lfarlc = reader.readShort();
            this.ovno = reader.readShort();

            this.res1 = reader.readLong();

            this.oemid = reader.readShort();
            this.oeminfo = reader.readShort();

            this.reserved =
            [
                reader.readInt(),
                reader.readInt(),
                reader.readInt(),
                reader.readInt(),
                reader.readInt()
            ];

            this.lfanew = reader.readInt();
        }
    }

    export enum MZSignature {
        MZ =
            "M".charCodeAt(0) +
            ("Z".charCodeAt(0) << 8)
    }
}