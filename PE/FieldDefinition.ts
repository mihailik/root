module Mi.PE {
    export class FieldDefinition {
        attributes: number;
        name: string;
        signature;

        toString() {
            return this.name;
        }
    }
}