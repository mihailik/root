module pe.managed.tables {
    export interface TableStreamReader {
        readInt(): number;
        readShort(): number;
        
        readString(): string;
        readGuid(): string;
        readBlob(): any;

        readResolutionScope(): any;
        readTypeDefOrRef(): any;
        
        readTableRowIndex(tableIndex: number): number;
    }
}