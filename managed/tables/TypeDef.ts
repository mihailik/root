/// <reference path="TableStreamReader.ts" />
/// <reference path="../MemberDefinitions.ts" />

module pe.managed {
    export class TypeDef {
        type = new TypeDefinition();
        fieldList: number;
        methodList: number;

        read(reader: TableStreamReader) {
            this.type.attributes = reader.readInt();
            this.type.name = reader.readString();
            this.type.namespace = reader.readString();
            this.type.extendsType = reader.readTypeDefOrRef();
            this.fieldList = reader.readTableRowIndex(TableTypes().Field.index);
            this.methodList = reader.readTableRowIndex(TableTypes().MethodDef.index);
        }
    }
}