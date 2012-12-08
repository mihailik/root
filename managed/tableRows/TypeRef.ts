/// <reference path="../metadata/TableStream.ts" />
/// <reference path="../MemberDefinitions.ts" />

module pe.managed.metadata {
    export class TypeRef {
        resolutionScope: any;
        name: string;
        namespace: string;

        read(reader: TableStreamReader) {
            this.resolutionScope = reader.readResolutionScope();
            this.name = reader.readString();
            this.namespace = reader.readString();
        }
    }
}