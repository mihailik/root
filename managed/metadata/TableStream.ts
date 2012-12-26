/// <reference path="MetadataStreams.ts" />
/// <reference path="rowEnums.ts" />
/// <reference path="TableStreamReader.ts" />

/// <reference path="tableRows/Assembly.ts" />
/// <reference path="tableRows/AssemblyOS.ts" />
/// <reference path="tableRows/AssemblyProcessor.ts" />
/// <reference path="tableRows/AssemblyRef.ts" />
/// <reference path="tableRows/AssemblyRefOS.ts" />
/// <reference path="tableRows/AssemblyRefProcessor.ts" />
/// <reference path="tableRows/ClassLayout.ts" />
/// <reference path="tableRows/Constant.ts" />
/// <reference path="tableRows/CustomAttribute.ts" />
/// <reference path="tableRows/DeclSecurity.ts" />
/// <reference path="tableRows/Event.ts" />
/// <reference path="tableRows/EventMap.ts" />
/// <reference path="tableRows/ExportedType.ts" />
/// <reference path="tableRows/FieldLayout.ts" />
/// <reference path="tableRows/FieldMarshal.ts" />
/// <reference path="tableRows/FieldRVA.ts" />
/// <reference path="tableRows/File.ts" />
/// <reference path="tableRows/GenericParam.ts" />
/// <reference path="tableRows/GenericParamConstraint.ts" />
/// <reference path="tableRows/ImplMap.ts" />
/// <reference path="tableRows/InterfaceImpl.ts" />
/// <reference path="tableRows/ManifestResource.ts" />
/// <reference path="tableRows/MemberRef.ts" />
/// <reference path="tableRows/MethodDef.ts" />
/// <reference path="tableRows/MethodImpl.ts" />
/// <reference path="tableRows/MethodSemantics.ts" />
/// <reference path="tableRows/MethodSpec.ts" />
/// <reference path="tableRows/ModuleRef.ts" />
/// <reference path="tableRows/NestedClass.ts" />
/// <reference path="tableRows/PropertyMap.ts" />
/// <reference path="tableRows/StandAloneSig.ts" />
/// <reference path="tableRows/TypeDef.ts" />
/// <reference path="tableRows/TypeSpec.ts" />

module pe.managed.metadata {
	export class TableStream {
		reserved0: number = 0;
		version: string = "";

		// byte
		heapSizes: number = 0;

		reserved1: number = 0;

		tables: any[][] = null;

		externalTypes: ExternalType[] = [];

		module: ModuleDefinition = null;
		assembly: AssemblyDefinition = null;

		read(tableReader: io.BufferReader, streams: MetadataStreams) {
			this.reserved0 = tableReader.readInt();

			// Note those are bytes, not shorts!
			this.version = tableReader.readByte() + "." + tableReader.readByte();

			this.heapSizes = tableReader.readByte();
			this.reserved1 = tableReader.readByte();

			var valid = tableReader.readLong();
			var sorted = tableReader.readLong();

			var tableCounts = this.readTableCounts(tableReader, valid);

			this.initTables(tableReader, tableCounts);
			this.readTables(tableReader, streams);
		}

		private readTableCounts(reader: io.BufferReader, valid: Long): number[] {
			var result = [];

			var bits = valid.lo;
			for (var tableIndex = 0; tableIndex < 32; tableIndex++) {
				if (bits & 1) {
					var rowCount = reader.readInt();
					result[tableIndex] = rowCount;
				}
				bits = bits >> 1;
			}

			bits = valid.hi;
			for (var i = 0; i < 32; i++) {
				var tableIndex = i + 32;
				if (bits & 1) {
					var rowCount = reader.readInt();
					result[tableIndex] = rowCount;
				}
				bits = bits >> 1;
			}

			return result;
		}

		private initTables(reader: io.BufferReader, tableCounts: number[]) {
			this.tables = [];
			var tableTypes = [];

			for (var tk in TableKind) {
				if (!TableKind.hasOwnProperty(tk))
					continue;

				var tkValue = TableKind[tk];
				if (typeof(tkValue)!=="number")
					continue;

				tableTypes[tkValue] = metadata[tk] || managed[tk];
			}

			for (var tableIndex = 0; tableIndex < tableCounts.length; tableIndex++) {
				var rowCount = tableCounts[tableIndex];
				if (!rowCount)
					continue;

				this.initTable(tableIndex, rowCount, tableTypes[tableIndex]);
			}
		}

		private initTable(tableIndex: number, rowCount: number, TableType) {
			var tableRows = this.tables[tableIndex] = Array(rowCount);

			// first module is the current module
			if (tableIndex === TableKind.ModuleDefinition && tableRows.length > 0) {
				if (!tableRows[0])
					tableRows[0] = new ModuleDefinition();
			}

			if (tableIndex === TableKind.Assembly && tableRows.length > 0) {
				if (!tableRows[0])
					tableRows[0] = new Assembly();

				tableRows[0].assemblyDefinition = this.assembly;
			}

			for (var i = 0; i < rowCount; i++) {
				if (!tableRows[i])
					tableRows[i] = new TableType();

				if (i===0 && tableRows[i].isSingleton)
					break;
			}
		}

		private readTables(reader: io.BufferReader, streams: MetadataStreams) {
			var tableStreamReader = new TableStreamReader(
				reader,
				streams,
				this.tables);

			for (var tableIndex = 0; tableIndex < 64; tableIndex++) {
				var tableRows = this.tables[tableIndex];

				if (!tableRows)
					continue;

				var singletonRow = null;

				for (var i = 0; i < tableRows.length; i++) {
					if (singletonRow) {
						singletonRow.internalReadRow(tableStreamReader);
						continue;
					}

					tableRows[i].internalReadRow(tableStreamReader);

					if (i === 0) {
						if (tableRows[i].isSingleton)
							singletonRow = tableRows[i];
					}
				}
			}
		}
	}
}