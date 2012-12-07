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
            var pos = this.readPos(this.streams.strings.size);

            var result: string;
            if(pos == 0 ) {
                result = null;
            }
            else {
                result = this.stringHeapCache[pos];

                if (!result) {
                    if (pos > this.streams.strings.size)
                        throw new Error("String heap position overflow.");

                    var utf8Reader = this.baseReader.readAtOffset(this.streams.strings.address + pos);
                    result = utf8Reader.readUtf8z(1024*1024*1024); // strings longer than 1GB? Not supported for a security excuse.

                    this.stringHeapCache[pos] = result;
                }
            }

            return result;
        }

        readGuid(): string {
            var index = this.readPos(this.streams.guids.length);

            if (index == 0)
                return null;
            else
                return this.streams.guids[(index-1)/16];
        }
        
        readBlob(): any { throw new Error("Not implemented."); }

        readResolutionScope(): any { throw new Error("Not implemented."); }
        readTypeDefOrRef(): any { throw new Error("Not implemented."); }
        
        readTableRowIndex(tableIndex: number): number { throw new Error("Not implemented."); }

        private readPos(spaceSize: number): number {
            if(spaceSize<65535)
                return this.baseReader.readShort();
            else
                return this.baseReader.readInt();
        }
    }
}