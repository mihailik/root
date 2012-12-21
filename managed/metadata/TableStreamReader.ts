/// <reference path="rowEnums.ts" />
/// <reference path="MetadataStreams.ts" />
/// <reference path="../MemberDefinitions.ts" />

module pe.managed.metadata {
	export class TableStreamReader {
		private stringHeapCache: string[] = [];

		constructor(
			private baseReader: io.BufferReader,
			private streams: metadata.MetadataStreams,
			private tables: any[][]) {

			this.readResolutionScope = this.createCodedIndexReader(
				TableKind.Module,
				TableKind.ModuleRef,
				TableKind.AssemblyRef,
				TableKind.ExternalType);

			this.readTypeDefOrRef = this.createCodedIndexReader(
				TableKind.TypeDef,
				TableKind.ExternalType,
				TableKind.TypeSpec);

			this.readHasConstant = this.createCodedIndexReader(
				TableKind.Field,
				TableKind.ParameterDefinition,
				TableKind.Property);

			this.readHasCustomAttribute = this.createCodedIndexReader(
				TableKind.MethodDef,
				TableKind.Field,
				TableKind.ExternalType,
				TableKind.TypeDef,
				TableKind.ParameterDefinition,
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
				TableKind.ParameterDefinition);

			this.readTypeOrMethodDef = this.createCodedIndexReader(
				TableKind.TypeDef,
				TableKind.MethodDef);

			this.readMemberForwarded = this.createCodedIndexReader(
				TableKind.Field,
				TableKind.MethodDef);

			this.readMemberRefParent = this.createCodedIndexReader(
				TableKind.TypeDef,
				TableKind.ExternalType,
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

					var saveOffset = this.baseReader.offset;
					this.baseReader.setVirtualOffset(this.streams.strings.address + pos);
					result = this.baseReader.readUtf8Z(1024 * 1024 * 1024); // strings longer than 1GB? Not supported for a security excuse.
					this.baseReader.offset = saveOffset;

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

		readBlobHex(): string {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			var result = "";
			for (var i = 0; i < length; i++) {
				var hex = this.baseReader.readByte().toString(16);
				if (hex.length==1)
					result += "0";
				result += hex;
			}

			this.baseReader.offset = saveOffset;

			return result;
		}

		readBlob(): Uint8Array {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			var result = this.baseReader.readBytes(length);

			this.baseReader.offset = saveOffset;

			return result;
		}

		private readBlobIndex(): number {
			return this.readPos(this.streams.blobs.size);
		}

		private readBlobSize(): number {
			var b0 = this.baseReader.readByte();
			if (b0 < 0x80) {
				length = b0;
			}
			else {
				var b1 = this.baseReader.readByte();

				if ((b0 & 0xC0) == 0x80) {
					length = ((b0 & 0x3F) << 8) + b1;
				}
				else {
					var b2 = this.baseReader.readByte();
					var b3 = this.baseReader.readByte();
					length = ((b0 & 0x3F) << 24) + (b1 << 16) + (b2 << 8) + b3;
				}
			}

			return length;
		}

		readTableRowIndex(tableIndex: number): number {
			var tableRows = this.tables[tableIndex];

			return this.readPos(tableRows ? tableRows.length : 0);
		}

		private createCodedIndexReader(...tableTypes: TableKind[]): () => CodedIndex {
			var tableDebug = [];
			var maxTableLength = 0;
			for (var i = 0; i < tableTypes.length; i++) {

				var table = this.tables[tableTypes[i]];
				if (!table) {
					tableDebug.push(null);
					continue;
				}

				tableDebug.push(table.length);
				maxTableLength = Math.max(maxTableLength, table.length);
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
			var debug = { maxTableLength: maxTableLength, calcRequredBitCount: calcRequredBitCount, tableLengths: tableDebug };

			return () => {
				var result = tableKindBitCount + tableIndexBitCount <= 16 ?
					this.baseReader.readShort() : // it fits within short
					this.baseReader.readInt(); // it does not fit within short

				debug.toString();

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

		readFieldSignature(definition: FieldDefinition): void {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			// TODO: populate field.


			this.baseReader.offset = saveOffset;
		}

		readMethodSignature(definition: MethodSignature): void {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			// TODO: populate signature.


			this.baseReader.offset = saveOffset;
		}

		// ECMA-335 para23.2.1, 23.2.2, 23.2.3
		private readSigMethodDefOrRefOrStandalone(sig: MethodSignature): void {
			var b = this.baseReader.readByte();

			sig.callingConvention = b;

			var genParameterCount = b & CallingConventions.Generic ?
				this.readCompressedInt() :
				0;

			var paramCount = this.readCompressedInt();

			var returnTypeCustomMod = this.readSigCustomModifierOrNull();
			var returnType = this.readSigTypeReference();

			sig.parameters = [];

			sig.extraParameters =
				(sig.callingConvention & CallingConventions.VarArg)
				|| (sig.callingConvention & CallingConventions.C) ?
					[] :
					null;

			for (var i = 0; i < paramCount; i++) {
				var p = this.readSigParam();

				if (sig.extraParameters && sig.extraParameters.length > 0) {
					sig.extraParameters.push(p);
				}
				else {
					if (sig.extraParameters && this.baseReader.peekByte()===CallingConventions.Sentinel) {
						this.baseReader.offset++;
						sig.extraParameters.push(p);
					}
					else {
						sig.parameters.push(p);
					}
				}
			}
		}

		// ECMA-335 para23.2.4
		private readSigField(sig: FieldDefinition): any {
			return null;
		}

		// ECMA-335 para23.2.7
		private readSigCustomModifierOrNull(): any {
			return null;
		}

		// ECMA-335 para23.2.10
		private readSigParam(): any {
			return null;
		}

		// ECMA-335 para23.2.12
		private readSigTypeReference(): TypeReference {
			return null;
		}

		private readCompressedInt(): number {
			var b0 = this.baseReader.readByte();
			if (b0 < 0x80) {
				length = b0;
			}
			else {
				var b1 = this.baseReader.readByte();

				if ((b0 & 0xC0) == 0x80) {
					length = ((b0 & 0x3F) << 8) + b1;
				}
				else {
					var b2 = this.baseReader.readByte();
					var b3 = this.baseReader.readByte();
					length = ((b0 & 0x3F) << 24) + (b1 << 16) + (b2 << 8) + b3;
				}
			}

			return length;
		}
	}

	export interface CodedIndex {
		table: TableKind;
		index: number;
		row: any;
	}
}