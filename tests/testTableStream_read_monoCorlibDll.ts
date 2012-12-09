/// <reference path="../pe.ts" />

declare var monoCorLib: number[];

module test_TableStream_read_monoCorlibDll {

    export function read_succeeds() {
        var bi = new pe.io.BufferBinaryReader(monoCorLib);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);

        var cmeReader = rvaReader.readAtOffset(cdi.metadataDir.address);
        var cme = new pe.managed.metadata.ClrMetadata();
        cme.read(cmeReader);

        var mes = new pe.managed.metadata.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, cmeReader);

        var tbReader = cmeReader.readAtOffset(mes.tables.address);
        var tas = new pe.managed.metadata.TableStream();
        tas.read(tbReader, mes);
    }

    export function modules_length_1() {
        var bi = new pe.io.BufferBinaryReader(monoCorLib);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);

        var cmeReader = rvaReader.readAtOffset(cdi.metadataDir.address);
        var cme = new pe.managed.metadata.ClrMetadata();
        cme.read(cmeReader);

        var mes = new pe.managed.metadata.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, cmeReader);

        var tbReader = cmeReader.readAtOffset(mes.tables.address);
        var tas = new pe.managed.metadata.TableStream();
        tas.read(tbReader, mes);

        if (tas.tables[pe.managed.metadata.TableKind.Module].length !== 1)
            throw tas.tables[pe.managed.metadata.TableKind.Module].length;
    }

    export function modules_0_name_sampleExe() {
        var bi = new pe.io.BufferBinaryReader(monoCorLib);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);

        var cmeReader = rvaReader.readAtOffset(cdi.metadataDir.address);
        var cme = new pe.managed.metadata.ClrMetadata();
        cme.read(cmeReader);

        var mes = new pe.managed.metadata.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, cmeReader);

        var tbReader = cmeReader.readAtOffset(mes.tables.address);
        var tas = new pe.managed.metadata.TableStream();
        tas.read(tbReader, mes);

        var _module = tas.tables[pe.managed.metadata.TableKind.Module][0];

        if (_module.name !== "sample.exe")
            throw _module.name;
    }

    export function modules_0_generation_0() {
        var bi = new pe.io.BufferBinaryReader(monoCorLib);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);

        var cmeReader = rvaReader.readAtOffset(cdi.metadataDir.address);
        var cme = new pe.managed.metadata.ClrMetadata();
        cme.read(cmeReader);

        var mes = new pe.managed.metadata.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, cmeReader);

        var tbReader = cmeReader.readAtOffset(mes.tables.address);
        var tas = new pe.managed.metadata.TableStream();
        tas.read(tbReader, mes);

        var _module = tas.tables[pe.managed.metadata.TableKind.Module][0];

        if (_module.generation !== 0)
            throw _module.generation;
    }

    export function modules_0_mvid_0d9cc7924913ca5a188f769e27c2bc72() {
        var bi = new pe.io.BufferBinaryReader(monoCorLib);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);

        var cmeReader = rvaReader.readAtOffset(cdi.metadataDir.address);
        var cme = new pe.managed.metadata.ClrMetadata();
        cme.read(cmeReader);

        var mes = new pe.managed.metadata.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, cmeReader);

        var tbReader = cmeReader.readAtOffset(mes.tables.address);
        var tas = new pe.managed.metadata.TableStream();
        tas.read(tbReader, mes);

        var _module = tas.tables[pe.managed.metadata.TableKind.Module][0];

        if (_module.mvid !== "{0d9cc7924913ca5a188f769e27c2bc72}")
            throw _module.mvid;
    }

    export function modules_0_encId_null() {
        var bi = new pe.io.BufferBinaryReader(monoCorLib);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);

        var cmeReader = rvaReader.readAtOffset(cdi.metadataDir.address);
        var cme = new pe.managed.metadata.ClrMetadata();
        cme.read(cmeReader);

        var mes = new pe.managed.metadata.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, cmeReader);

        var tbReader = cmeReader.readAtOffset(mes.tables.address);
        var tas = new pe.managed.metadata.TableStream();
        tas.read(tbReader, mes);

        var _module = tas.tables[pe.managed.metadata.TableKind.Module][0];

        if (_module.encId !== null)
            throw _module.encId;
    }

    export function modules_0_encBaseId_null() {
        var bi = new pe.io.BufferBinaryReader(monoCorLib);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);

        var cmeReader = rvaReader.readAtOffset(cdi.metadataDir.address);
        var cme = new pe.managed.metadata.ClrMetadata();
        cme.read(cmeReader);

        var mes = new pe.managed.metadata.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, cmeReader);

        var tbReader = cmeReader.readAtOffset(mes.tables.address);
        var tas = new pe.managed.metadata.TableStream();
        tas.read(tbReader, mes);

        var _module = tas.tables[pe.managed.metadata.TableKind.Module][0];

        if (_module.encBaseId !== null)
            throw _module.encBaseId;
    }

    export function typeRefs_length_4() {
        var bi = new pe.io.BufferBinaryReader(monoCorLib);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);

        var cmeReader = rvaReader.readAtOffset(cdi.metadataDir.address);
        var cme = new pe.managed.metadata.ClrMetadata();
        cme.read(cmeReader);

        var mes = new pe.managed.metadata.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, cmeReader);

        var tbReader = cmeReader.readAtOffset(mes.tables.address);
        var tas = new pe.managed.metadata.TableStream();
        tas.read(tbReader, mes);

        var typeRefs = tas.tables[pe.managed.metadata.TableKind.TypeRef];

        if (typeRefs.length !== 4)
            throw typeRefs.length;
    }
}