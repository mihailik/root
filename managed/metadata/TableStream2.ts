/// <reference path="MetadataStreams.ts" />
/// <reference path="../MemberDefinitions.ts" />
/// <reference path="rowEnums.ts" />

module pe.managed.metadata {
	export class TableStream2 {
		reserved0: number = 0;
		version: string = "";

		// byte
		heapSizes: number = 0;

		reserved1: number = 0;

		externalTypes: ExternalType[] = [];

		stringHeapCache: string[] = [];

		constructor(
			private reader: io.BufferReader,
			private streams: MetadataStreams,
			public module: ModuleDefinition,
			public assembly: AssemblyDefinition) {
			this.reserved0 = reader.readInt();

			// Note those are bytes, not shorts!
			this.version = reader.readByte() + "." + reader.readByte();

			this.heapSizes = reader.readByte();
			this.reserved1 = reader.readByte();

			var valid = reader.readLong();
			var sorted = reader.readLong();

			var tableRowCounts = this.readTableCounts(valid);
			this.readTableRows(tableRowCounts);
		}

		private readTableCounts(valid: Long): number[] {
			var result = [];

			var bits = valid.lo;
			for (var tableIndex = 0; tableIndex < 32; tableIndex++) {
				if (bits & 1) {
					var rowCount = this.reader.readInt();
					result[tableIndex] = rowCount;
				}
				bits = bits >> 1;
			}

			bits = valid.hi;
			for (var i = 0; i < 32; i++) {
				var tableIndex = i + 32;
				if (bits & 1) {
					var rowCount = this.reader.readInt();
					result[tableIndex] = rowCount;
				}
				bits = bits >> 1;
			}

			return result;
		}

		private readTableRows(tableCounts: number[]) {
			if (tableCounts[TableKind.Module]) {
				if (!this.module )
					this.module = new ModuleDefinition();
				this.readModule();
			}
			else {
				this.module = null;
			}

			if (tableCounts[TableKind.TypeRef]) {
				this.externalTypes.length = tableCounts[TableKind.TypeRef];

				for (var i = 0; i < this.externalTypes.length; i++) {
					var resolutionScope = this.readResolutionScope();
					var name = this.readString();
					var namespace = this.readString();

					this.externalTypes[i] = new ExternalType(resolutionScope, this.readString(), this.readString());
				}
			}
			else {
				this.externalTypes.length = 0;
			}
		}

		private readModule() {
			this.module.generation = this.reader.readShort();
			this.module.name = this.readString();
			this.module.mvid = this.readGuid();
			this.module.encId = this.readGuid();
			this.module.encBaseId = this.readGuid();
		}

		private readResolutionScope() {
			return null;
		}

		private readString(): string {
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

					var saveOffset = this.reader.offset;
					this.reader.setVirtualOffset(this.streams.strings.address + pos);
					result = this.reader.readUtf8Z(1024 * 1024 * 1024); // strings longer than 1GB? Not supported for a security excuse.
					this.reader.offset = saveOffset;

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

		private readPos(spaceSize: number): number {
			if (spaceSize < 65535)
				return this.reader.readShort();
			else
				return this.reader.readInt();
		}
	}
}