module pe.managed.tables {
    export class TableStreamReader {
        private stringHeapCache: string[] = [];
        
        constructor(
            private baseReader: io.BinaryReader,
            private streams: metadata.MetadataStreams) {
        }

        readInt(): number { return this.baseReader.readInt(); }
        readShort(): number { return this.baseReader.readShort(); }
        
        readString(): string {
            var pos: number;
            if(this.streams.strings.size<65535)
                pos = this.baseReader.readShort();
            else
                pos = this.baseReader.readInt();

            var result: string;
            if(pos == 0 )
            {
                result = null;
            }
            else
            {
                result = this.stringHeapCache[pos];

                if (!result) {
                    if (pos > this.streams.strings.size)
                        throw new Error("String heap position overflow.");

                    var utf8Reader = this.baseReader.readAtOffset(this.streams.strings.address + pos);
                    result = utf8Reader.readUtf8z(1024*1024*1024); // strings longer than 1GB? Not supported for security reasons.

                    this.stringHeapCache[pos] = result;
                }
            }

            return result;
        }

        readGuid(): string {
            var index: number;

            if (this.streams.guids.length <= 65535)
                index = this.baseReader.readShort();
            else
                index = this.baseReader.readInt();

            if (index == 0)
                return null;

            return this.streams.guids[(index-1)/16];
        }
        
        readBlob(): any { throw new Error("Not implemented."); }

        readResolutionScope(): any { throw new Error("Not implemented."); }
        readTypeDefOrRef(): any { throw new Error("Not implemented."); }
        
        readTableRowIndex(tableIndex: number): number { throw new Error("Not implemented."); }
    }
}