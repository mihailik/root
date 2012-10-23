module Mi.PE.PEFormat {
    export enum PESignature {
        PE =
            "P".charCodeAt(0) +
            ("E".charCodeAt(0) << 8)
    }
}