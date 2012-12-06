/// <reference path="../pe.ts" />
/// <reference path="ResourceDirectoryEntry.ts" />
/// <reference path="ResourceDataEntry.ts" />

module pe.unmanaged {
    export class ResourceDirectory {
        // Resource flags. This field is reserved for future use. It is currently set to zero.
        characteristics: number = 0;

        // The time that the resource data was created by the resource compiler
        timestamp: Date = null;

        // The version number, set by the user.
        version: string = "";

        subdirectories: ResourceDirectoryEntry[] = [];
        dataEntries: ResourceDataEntry[] = [];

        read(reader: io.BinaryReader) {
            this.readCore(reader, reader.clone());
        }

        private readCore(reader: io.BinaryReader, baseReader: io.BinaryReader) {
            this.characteristics = reader.readInt();
            var timestampNum = reader.readInt();
            
            // TODO: read timestamp
            //this.Timestamp = PEFile.TimestampEpochUTC.AddSeconds(timestampNum);
            this.version = reader.readShort() + "." + reader.readShort();

            var nameEntryCount = reader.readShort();
            var idEntryCount = reader.readShort();

            var dataEntryCount = 0;
            var directoryEntryCount = 0;

            for (var i = 0; i < nameEntryCount + idEntryCount; i++) {
                var idOrNameRva = reader.readInt();
                var contentRva = reader.readInt();

                var name: string;
                var id: number;

                var highBit = 1 << 31;

                if ((idOrNameRva & highBit)==0)
                {
                    id = idOrNameRva;
                    name = null;
                }
                else
                {
                    id = 0;
                    var nameReader = baseReader.clone();
                    nameReader.skipBytes(idOrNameRva - highBit);
                    name = this.readName(nameReader);
                }

                if ((contentRva & highBit) == 0) // high bit is not set
                {
                    var dataEntry = this.dataEntries[dataEntryCount];
                    if (!dataEntry)
                        this.dataEntries[dataEntryCount] = dataEntry = new ResourceDataEntry();

                    dataEntry.name = name;
                    dataEntry.integerId = id;

                    var dataEntryReader = baseReader.clone();
                    dataEntryReader.skipBytes(contentRva);
                    
                    dataEntry.dataRva = dataEntryReader.readInt();
                    dataEntry.size = dataEntryReader.readInt();
                    dataEntry.codepage = dataEntryReader.readInt();
                    dataEntry.reserved = dataEntryReader.readInt();

                    dataEntryCount++;
                }
                else
                {
                    contentRva = contentRva - highBit; // clear hight bit

                    var dataEntryReader = baseReader.clone();
                    dataEntryReader.skipBytes(contentRva);

                    var directoryEntry = this.subdirectories[directoryEntryCount];
                    if (!directoryEntry)
                        this.subdirectories[directoryEntryCount] = directoryEntry = new ResourceDirectoryEntry();

                    directoryEntry.name = name;
                    directoryEntry.integerId = id;

                    directoryEntry.directory = new ResourceDirectory();
                    directoryEntry.directory.readCore(reader, baseReader);

                    directoryEntryCount++;
                }
            }

            this.dataEntries.length = dataEntryCount;
            this.subdirectories.length = directoryEntryCount;
        }

        readName(reader: io.BinaryReader): string {
            var length = reader.readShort();
            var result = "";
            for (var i = 0; i < length; i++) {
                result += String.fromCharCode(reader.readShort());
            }
            return result;
        }
    }
}