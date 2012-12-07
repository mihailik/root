module pe.managed.tables {
    export class TableStreamReader {
        constructor(
            private baseReader: io.BinaryReader,
            private streams: metadata.MetadataStreams) {
        }

        readInt(): number { return this.baseReader.readInt(); }
        readShort(): number { return this.baseReader.readShort(); }
        
        readString(): string { return this.streams.readString(this.baseReader); }
        readGuid(): string { return this.streams.readGuid(this.baseReader); }
        readBlob(): any { throw new Error("Not implemented."); }

        readResolutionScope(): any { throw new Error("Not implemented."); }
        readTypeDefOrRef(): any { throw new Error("Not implemented."); }
        
        readTableRowIndex(tableIndex: number): number { throw new Error("Not implemented."); }
    }
}