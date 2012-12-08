/// <reference path="../metadata/TableStream.ts" />
/// <reference path="../MemberDefinitions.ts" />

module pe.managed.metadata {
    export class Module {
        // Ushort
        generation: number = 0;

        name: string = "";

        // The mvid column shall index a unique GUID in the GUID heap (ECMA-335 §24.2.5)
        // that identifies this instance of the module.
        // The mvid can be ignored on read by conforming implementations of the CLI.
        // The mvid should be newly generated for every module,
        // using the algorithm specified in ISO/IEC 11578:1996
        // (Annex A) or another compatible algorithm.

        // [Rationale: While the VES itself makes no use of the Mvid,
        // other tools (such as debuggers, which are outside the scope of this standard)
        // rely on the fact that the <see cref="Mvid"/> almost always differs from one module to another.
        // end rationale]
        mvid: string = "";

        encId: string = "";
        encBaseId: string = "";

        read(reader: TableStreamReader) {
            this.generation = reader.readShort();
            this.name = reader.readString();
            this.mvid = reader.readGuid();
            this.encId = reader.readGuid();
            this.encBaseId = reader.readGuid();
        }
    }
}