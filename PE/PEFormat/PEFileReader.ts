// <reference path="PEFile.ts" />
// <reference path="DosHeader.ts" />

// <reference path="../BinaryReader.ts" />

module Mi.PE.PEFormat {
    export class PEFileReader {
        private static dosHeaderSize: number = 64;

        static read(peFile: PEFile, reader: Mi.PE.BinaryReader) {
            if (!peFile.dosHeader)
                peFile.dosHeader = new DosHeader();

            readDosHeader(peFile.dosHeader, reader);

            if (peFile.dosHeader.lfanew > PEFileReader.dosHeaderSize)
                peFile.dosStub = reader.readBytes(peFile.dosHeader.lfanew - PEFileReader.dosHeaderSize);

            readPEHeader(peFile.optionalHeader, reader);
        }

        static readDosHeader(dosHeader: DosHeader, reader: BinaryReader) {
            dosHeader.mz = reader.readShort();

            if (dosHeader.mz != Mi.PE.PEFormat.MZSignature.MZ)
                throw new Error("MZ signature is invalid: " + (<number>(dosHeader.mz)).toString(16) + "h.");

            dosHeader.cblp = reader.readShort();
            dosHeader.cp = reader.readShort();
            dosHeader.crlc = reader.readShort();
            dosHeader.cparhdr = reader.readShort();
            dosHeader.minalloc = reader.readShort();
            dosHeader.maxalloc = reader.readShort();
            dosHeader.ss = reader.readShort();
            dosHeader.sp = reader.readShort();
            dosHeader.csum = reader.readShort();
            dosHeader.ip = reader.readShort();
            dosHeader.cs = reader.readShort();
            dosHeader.lfarlc = reader.readShort();
            dosHeader.ovno = reader.readShort();

            dosHeader.res1 =
                reader.readInt() +
                ((reader.readInt() << 14) * 4); // JavaScript can handle large integers, but cannot do '<<' around them.

            dosHeader.oemid = reader.readShort();
            dosHeader.oeminfo = reader.readShort();

            dosHeader.reserved =
            [
                reader.readInt(),
                reader.readInt(),
                reader.readInt(),
                reader.readInt(),
                reader.readInt()
            ];

            dosHeader.lfanew = reader.readInt();
        }

        static readPEHeader(peHeader: PEHeader, reader: BinaryReader) {
            peHeader.pe = reader.readInt();
            if (peHeader.pe != <number>PESignature.PE)
                throw new Error("PE signature is invalid: " + (<number>(peHeader.pe)).toString(16) + "h.");

            peHeader.machine = reader.readShort();
            peHeader.numberOfSections = reader.readShort();
            var timestampNum = reader.readInt();
            var timestamp = new Date(timestampNum* 1000);
            var timestamp = new Date(
                Date.UTC(
                    timestamp.getFullYear(),
                    timestamp.getMonth(),
                    timestamp.getDate(),
                    timestamp.getHours(),
                    timestamp.getMinutes(),
                    timestamp.getSeconds(),
                    timestamp.getMilliseconds()));

            peHeader.timestamp = timestamp;

            peHeader.pointerToSymbolTable = reader.readInt();
            peHeader.numberOfSymbols = reader.readInt();
            peHeader.sizeOfOptionalHeader = reader.readShort();
            //peHeader.characteristics = (ImageCharacteristics)reader.readShort();
        }
    }
}