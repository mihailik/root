/// <reference path="FieldDefinition.ts" />

module Mi.PE {
    export class TypeDefinition {
        attributes: number;

        name: string;
        namespace: string;

        fields: FieldDefinition[];

        extendsType: any;

        toString() {
            var result = "";
            if (this.namespace)
                result += this.namespace;
            if (this.name)
                result += (result.length > 0 ? "." + this.name : this.name);

            return result;
        }
    }
}