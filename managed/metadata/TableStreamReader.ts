/// <reference path="rowEnums.ts" />
/// <reference path="MetadataStreams.ts" />
/// <reference path="../../io/BinaryReader.ts" />
module pe.managed.metadata {
    export class TableStreamReader {
        private stringHeapCache: string[] = [];

        constructor(
            private baseReader: io.BinaryReader,
            private streams: metadata.MetadataStreams,
            private tables: any[][]) {

            this.readResolutionScope = this.createCodedIndexReader(
                TableKind.Module,
                TableKind.ModuleRef,
                TableKind.AssemblyRef,
                TableKind.TypeRef);

            this.readTypeDefOrRef = this.createCodedIndexReader(
                TableKind.TypeDef,
                TableKind.TypeRef,
                TableKind.TypeSpec);

            this.readHasConstant = this.createCodedIndexReader(
                TableKind.Field,
                TableKind.Param,
                TableKind.Property);

            this.readHasCustomAttribute = this.createCodedIndexReader(
                TableKind.MethodDef,
                TableKind.Field,
                TableKind.TypeRef,
                TableKind.TypeDef,
                TableKind.Param,
                TableKind.InterfaceImpl,
                TableKind.MemberRef,
                TableKind.Module,
                <TableKind>0xFFFF, // TableKind.Permission,
                TableKind.Property,
                TableKind.Event,
                TableKind.StandAloneSig,
                TableKind.ModuleRef,
                TableKind.TypeSpec,
                TableKind.Assembly,
                TableKind.AssemblyRef,
                TableKind.File,
                TableKind.ExportedType,
                TableKind.ManifestResource,
                TableKind.GenericParam,
                TableKind.GenericParamConstraint,
                TableKind.MethodSpec);

            this.readCustomAttributeType = this.createCodedIndexReader(
                <TableKind>0xFFFF, //TableKind.Not_used_0,
                <TableKind>0xFFFF, //TableKind.Not_used_1,
                TableKind.MethodDef,
                TableKind.MemberRef,
                <TableKind>0xFFFF //TableKind.Not_used_4
            );

            this.readHasDeclSecurity = this.createCodedIndexReader(
                TableKind.TypeDef,
                TableKind.MethodDef,
                TableKind.Assembly);

            this.readImplementation = this.createCodedIndexReader(
                TableKind.File,
                TableKind.AssemblyRef,
                TableKind.ExportedType);

            this.readHasFieldMarshal = this.createCodedIndexReader(
                TableKind.Field,
                TableKind.Param);

            this.readTypeOrMethodDef = this.createCodedIndexReader(
                TableKind.TypeDef,
                TableKind.MethodDef);

            this.readMemberForwarded = this.createCodedIndexReader(
            	TableKind.Field,
                TableKind.MethodDef);

            this.readMemberRefParent = this.createCodedIndexReader(
                TableKind.TypeDef,
                TableKind.TypeRef,
                TableKind.ModuleRef,
                TableKind.MethodDef,
                TableKind.TypeSpec);

            this.readMethodDefOrRef = this.createCodedIndexReader(
                TableKind.MethodDef,
                TableKind.MemberRef);

            this.readHasSemantics = this.createCodedIndexReader(
                TableKind.Event,
                TableKind.Property);
        }

        readResolutionScope: () => CodedIndex;
        readTypeDefOrRef: () => CodedIndex;
        readHasConstant: () => CodedIndex;
        readHasCustomAttribute: () => CodedIndex;
        readCustomAttributeType: () => CodedIndex;
        readHasDeclSecurity: () => CodedIndex;
        readImplementation: () => CodedIndex;
        readHasFieldMarshal: () => CodedIndex;
        readTypeOrMethodDef: () => CodedIndex;
        readMemberForwarded: () => CodedIndex;
        readMemberRefParent: () => CodedIndex;
        readMethodDefOrRef: () => CodedIndex;
        readHasSemantics: () => CodedIndex;

        readByte(): number { return this.baseReader.readByte(); }
        readInt(): number { return this.baseReader.readInt(); }
        readShort(): number { return this.baseReader.readShort(); }

        readString(): string {
            var pos = this.readPos(this.streams.strings.size);

            var result: string;
            if (pos == 0) {
                result = null;
            }
            else {
                result = this.stringHeapCache[pos];

                if (!result) {
                    if (pos > this.streams.strings.size)
                        throw new Error("String heap position overflow.");

                    var utf8Reader = this.baseReader.readAtOffset(this.streams.strings.address + pos);
                    result = utf8Reader.readUtf8z(1024 * 1024 * 1024); // strings longer than 1GB? Not supported for a security excuse.

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
                return this.streams.guids[(index - 1) / 16];
        }

        readBlob(): any {
            var index = this.readPos(this.streams.blobs.size);
            return index;
        }

        readTableRowIndex(tableIndex: number): number {
            var tableRows = this.tables[tableIndex];

            return this.readPos(tableRows ? tableRows.length : 0);
        }

        private createCodedIndexReader(...tableTypes: TableKind[]): () => CodedIndex {
            var maxTableLength = 0;
            for (var i = 0; i < tableTypes.length; i++) {
                var tableType = tableTypes[i];
                if (!tableType)
                    continue;

                var tableRows = this.tables[i];

                if (!tableRows)
                    continue;

                maxTableLength = Math.max(maxTableLength, tableRows.length);
            }

            function calcRequredBitCount(maxValue) {
                var bitMask = maxValue;
                var result = 0;

                while (bitMask != 0) {
                    result++;
                    bitMask >>= 1;
                }

                return result;
            }

            var tableKindBitCount = calcRequredBitCount(tableTypes.length - 1);
            var tableIndexBitCount = calcRequredBitCount(maxTableLength);

            return () => {
                var result = tableKindBitCount + tableIndexBitCount < 16 ?
                    this.baseReader.readShort() :
                    this.baseReader.readInt();

                var resultIndex = result >> tableKindBitCount;
                var resultTableIndex = result - (resultIndex << tableKindBitCount);

                var table = tableTypes[resultTableIndex];

                if (resultIndex == 0)
                    return null;

                resultIndex--;

                var row = resultIndex === 0 ? null : this.tables[table][resultIndex];

                return {
                    table: table,
                    index: resultIndex,
                    row: row
                };
            };
        }

        private readPos(spaceSize: number): number {
            if (spaceSize < 65535)
                return this.baseReader.readShort();
            else
                return this.baseReader.readInt();
        }
    }

    export interface CodedIndex {
        table: TableKind;
        index: number;
        row: any;
    }
}