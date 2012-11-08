/// <reference path="../Version.ts" />
/// <reference path="../IO/BinaryReader.ts" />
/// <reference path="Export.ts" />

module Mi.PE.Unmanaged {
    export class ExportHeader {
        // Reserved, must be 0.
        flags: number;

        // The time and date that the export data was created.
        timestamp: Date;

        // The version number. The major and minor version numbers can be set by the user.
        version: Version;
            
        // The ASCII string that contains the name of the DLL. This address is relative to the image base.
        dllName;
            
        // The starting ordinal number for exports in this image.
        // This field specifies the starting ordinal number for the export address table.
        // It is usually set to 1.
        ordinalBase;

        exports: Export[];

        read(reader: Mi.PE.IO.BinaryReader) {
            this.flags = reader.readInt();
            this.timestamp = reader.readTimestamp();
            
            var majorVersion = reader.readShort();
            var minorVersion = reader.readShort();
            this.version = new Version(majorVersion, minorVersion);

            // need to read string from that RVA later
            var nameRva = reader.readInt();
                
            this.ordinalBase = reader.readInt();

            // The number of entries in the export address table.
            var addressTableEntries = reader.readInt();

            // The number of entries in the name pointer table. This is also the number of entries in the ordinal table.
            var numberOfNamePointers = reader.readInt();

            // The address of the export address table, relative to the image base.
            var exportAddressTableRva = reader.readInt();

            // The address of the export name pointer table, relative to the image base.
            // The table size is given by the Number of Name Pointers field.
            var namePointerRva = reader.readInt();

            // The address of the ordinal table, relative to the image base.
            var ordinalTableRva = reader.readInt();

            if (nameRva == 0)
                this.dllName = null;
            else
                this.dllName = reader.readAtOffset(nameRva).readAsciiZ();

            if (addressTableEntries == 0) {
                this.exports = null;
            }
            else {
                this.exports = Array(addressTableEntries);
                for (var i = 0; i < addressTableEntries; i++) {
                    var exportEntry = new Export();
                    exportEntry.read(reader);
                    this.exports[i] = exportEntry;
                }

                if (numberOfNamePointers != 0
                    && namePointerRva != 0
                    && ordinalTableRva != 0) {
                    
                    for (var i = 0; i < numberOfNamePointers; i++)
                    {
                        var ordinalReader = reader.readAtOffset(ordinalTableRva + 2 * i);
                        var ordinal = ordinalReader.readShort();

                        var fnRvaReader = reader.readAtOffset(namePointerRva + 4 * i);
                        var functionNameRva = fnRvaReader.readInt();

                        var functionName: string;
                        if (functionNameRva == 0)
                        {
                            functionName = null;
                        }
                        else
                        {
                            var fnReader = reader.readAtOffset(functionNameRva);
                            functionName = fnReader.readAsciiZ();
                        }

                        this.exports[ordinal].name = functionName;
                    }
                }
            }
        }
    }
}