/// <reference path="../pe.ts" />

module test_ClrDirectory_read_sample64Exe {

    var sampleBuf =
    [77,90,144,,3,,,,4,,,,255,255,,,184,,,,,,,,64,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,128,,,,14,31,186,14,,180,9,205,33,184,1,76,205,33,84,104,105,115,32,112,114,111,103,114,97,109,32,99,97,110,110,111,116,32,98,101,32,114,117,110,32,105,110,32,68,79,83,32,109,111,100,101,46,13,13,10,36,,,,,,,,80,69,,,100,134,2,,160,22,193,80,,,,,,,,,240,,34,,11,2,11,,,4,,,,6,,,,,,,,,,,,32,,,,,,64,1,,,,,32,,,,2,,,4,,,,,,,,4,,,,,,,,,96,,,,2,,,,,,,3,,64,133,,,64,,,,,,,64,,,,,,,,,16,,,,,,,32,,,,,,,,,,,16,,,,,,,,,,,,,,,,,,,,,64,,,224,4,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,32,,,72,,,,,,,,,,,,46,116,101,120,116,,,,232,2,,,,32,,,,4,,,,2,,,,,,,,,,,,,,,32,,,96,46,114,115,114,99,,,,224,4,,,,64,,,,6,,,,6,,,,,,,,,,,,,,,64,,,64,46,114,101,108,111,99,,,,,,,,96,,,,,,,,12,,,,,,,,,,,,,,,64,,,66,72,,,,2,,5,,104,32,,,128,2,,,1,,,,1,,,6,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,54,,114,1,,,112,40,3,,,10,,42,30,2,40,4,,,10,42,,,66,83,74,66,1,,1,,,,,,12,,,,118,52,46,48,46,51,48,51,49,57,,,,,5,,108,,,,228,,,,35,126,,,80,1,,,188,,,,35,83,116,114,105,110,103,115,,,,,12,2,,,32,,,,35,85,83,,44,2,,,16,,,,35,71,85,73,68,,,,60,2,,,68,,,,35,66,108,111,98,,,,,,,,2,,,1,71,20,,,9,,,,,250,37,51,,22,,,1,,,,4,,,,2,,,,2,,,,4,,,,2,,,,1,,,,1,,,,,,10,,1,,,,,,6,,47,,40,,6,,97,,65,,6,,129,,65,,6,,168,,40,,,,,,1,,,,,,1,,1,,,,16,,23,,,,5,,1,,1,,80,32,,,,,145,,54,,10,,1,,94,32,,,,,134,24,59,,14,,1,,17,,59,,18,,25,,59,,14,,33,,176,,23,,9,,59,,14,,46,,11,,28,,46,,19,,37,,4,128,,,,,,,,,,,,,,,,,159,,,,4,,,,,,,,,,,,1,,31,,,,,,,,,,,60,77,111,100,117,108,101,62,,115,97,109,112,108,101,54,52,46,101,120,101,,80,114,111,103,114,97,109,,109,115,99,111,114,108,105,98,,83,121,115,116,101,109,,79,98,106,101,99,116,,77,97,105,110,,46,99,116,111,114,,83,121,115,116,101,109,46,82,117,110,116,105,109,101,46,67,111,109,112,105,108,101,114,83,101,114,118,105,99,101,115,,67,111,109,112,105,108,97,116,105,111,110,82,101,108,97,120,97,116,105,111,110,115,65,116,116,114,105,98,117,116,101,,82,117,110,116,105,109,101,67,111,109,112,97,116,105,98,105,108,105,116,121,65,116,116,114,105,98,117,116,101,,115,97,109,112,108,101,54,52,,67,111,110,115,111,108,101,,87,114,105,116,101,76,105,110,101,,,,,27,72,,101,,108,,108,,111,,44,,32,,87,,111,,114,,108,,100,,33,,,,,,202,173,71,97,31,64,83,71,138,19,175,127,84,43,181,190,,8,183,122,92,86,25,52,224,137,3,,,1,3,32,,1,4,32,1,1,8,4,,1,1,14,8,1,,8,,,,,,30,1,,1,,84,2,22,87,114,97,112,78,111,110,69,120,99,101,112,116,105,111,110,84,104,114,111,119,115,1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,2,,16,,,,32,,,128,24,,,,56,,,128,,,,,,,,,,,,,,,1,,1,,,,80,,,128,,,,,,,,,,,,,,,1,,1,,,,104,,,128,,,,,,,,,,,,,,,1,,,,,,128,,,,,,,,,,,,,,,,,,1,,,,,,144,,,,160,64,,,76,2,,,,,,,,,,,240,66,,,234,1,,,,,,,,,,,76,2,52,,,,86,,83,,95,,86,,69,,82,,83,,73,,79,,78,,95,,73,,78,,70,,79,,,,,,189,4,239,254,,,1,,,,,,,,,,,,,,,,,,63,,,,,,,,4,,,,1,,,,,,,,,,,,,,,,68,,,,1,,86,,97,,114,,70,,105,,108,,101,,73,,110,,102,,111,,,,,,36,,4,,,,84,,114,,97,,110,,115,,108,,97,,116,,105,,111,,110,,,,,,,,176,4,172,1,,,1,,83,,116,,114,,105,,110,,103,,70,,105,,108,,101,,73,,110,,102,,111,,,,136,1,,,1,,48,,48,,48,,48,,48,,52,,98,,48,,,,44,,2,,1,,70,,105,,108,,101,,68,,101,,115,,99,,114,,105,,112,,116,,105,,111,,110,,,,,,32,,,,48,,8,,1,,70,,105,,108,,101,,86,,101,,114,,115,,105,,111,,110,,,,,,48,,46,,48,,46,,48,,46,,48,,,,60,,13,,1,,73,,110,,116,,101,,114,,110,,97,,108,,78,,97,,109,,101,,,,115,,97,,109,,112,,108,,101,,54,,52,,46,,101,,120,,101,,,,,,40,,2,,1,,76,,101,,103,,97,,108,,67,,111,,112,,121,,114,,105,,103,,104,,116,,,,32,,,,68,,13,,1,,79,,114,,105,,103,,105,,110,,97,,108,,70,,105,,108,,101,,110,,97,,109,,101,,,,115,,97,,109,,112,,108,,101,,54,,52,,46,,101,,120,,101,,,,,,52,,8,,1,,80,,114,,111,,100,,117,,99,,116,,86,,101,,114,,115,,105,,111,,110,,,,48,,46,,48,,46,,48,,46,,48,,,,56,,8,,1,,65,,115,,115,,101,,109,,98,,108,,121,,32,,86,,101,,114,,115,,105,,111,,110,,,,48,,46,,48,,46,,48,,46,,48,,,,,,,,239,187,191,60,63,120,109,108,32,118,101,114,115,105,111,110,61,34,49,46,48,34,32,101,110,99,111,100,105,110,103,61,34,85,84,70,45,56,34,32,115,116,97,110,100,97,108,111,110,101,61,34,121,101,115,34,63,62,13,10,60,97,115,115,101,109,98,108,121,32,120,109,108,110,115,61,34,117,114,110,58,115,99,104,101,109,97,115,45,109,105,99,114,111,115,111,102,116,45,99,111,109,58,97,115,109,46,118,49,34,32,109,97,110,105,102,101,115,116,86,101,114,115,105,111,110,61,34,49,46,48,34,62,13,10,32,32,60,97,115,115,101,109,98,108,121,73,100,101,110,116,105,116,121,32,118,101,114,115,105,111,110,61,34,49,46,48,46,48,46,48,34,32,110,97,109,101,61,34,77,121,65,112,112,108,105,99,97,116,105,111,110,46,97,112,112,34,47,62,13,10,32,32,60,116,114,117,115,116,73,110,102,111,32,120,109,108,110,115,61,34,117,114,110,58,115,99,104,101,109,97,115,45,109,105,99,114,111,115,111,102,116,45,99,111,109,58,97,115,109,46,118,50,34,62,13,10,32,32,32,32,60,115,101,99,117,114,105,116,121,62,13,10,32,32,32,32,32,32,60,114,101,113,117,101,115,116,101,100,80,114,105,118,105,108,101,103,101,115,32,120,109,108,110,115,61,34,117,114,110,58,115,99,104,101,109,97,115,45,109,105,99,114,111,115,111,102,116,45,99,111,109,58,97,115,109,46,118,51,34,62,13,10,32,32,32,32,32,32,32,32,60,114,101,113,117,101,115,116,101,100,69,120,101,99,117,116,105,111,110,76,101,118,101,108,32,108,101,118,101,108,61,34,97,115,73,110,118,111,107,101,114,34,32,117,105,65,99,99,101,115,115,61,34,102,97,108,115,101,34,47,62,13,10,32,32,32,32,32,32,60,47,114,101,113,117,101,115,116,101,100,80,114,105,118,105,108,101,103,101,115,62,13,10,32,32,32,32,60,47,115,101,99,117,114,105,116,121,62,13,10,32,32,60,47,116,114,117,115,116,73,110,102,111,62,13,10,60,47,97,115,115,101,109,98,108,121,62,13,10];
    sampleBuf[3071] = 0; // 3072 bytes
    for (var i = 0; i < sampleBuf.length; i++) {
        if (!sampleBuf[i])
            sampleBuf[i] = 0;
    }

    export function read_succeeds() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);
    }

    export function cb_72() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);

        if (cdi.cb !== 72)
            throw cdi.cb;
    }

    export function runtimeVersion_25() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);

        if (cdi.runtimeVersion !== "2.5")
            throw cdi.runtimeVersion;
    }

    export function imageFlags_ILOnly() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);

        if (cdi.imageFlags !== pe.managed.metadata.ClrImageFlags.ILOnly)
            throw cdi.imageFlags;
    }

    export function metadataDir_toString_2068_280h() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);

        if (cdi.metadataDir + "" !== "2068:280h")
            throw cdi.metadataDir;
    }

    export function entryPointToken_100663297() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);

        if (cdi.entryPointToken !== 100663297)
            throw cdi.entryPointToken;
    }

    export function resourcesDir_toString_00h() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);

        if (cdi.resourcesDir + "" !== "0:0h")
            throw cdi.resourcesDir;
    }

    export function strongNameSignatureDir_toString_00h() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);

        if (cdi.strongNameSignatureDir + "" !== "0:0h")
            throw cdi.strongNameSignatureDir;
    }

    export function codeManagerTableDir_toString_00h() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);

        if (cdi.codeManagerTableDir + "" !== "0:0h")
            throw cdi.codeManagerTableDir;
    }

    export function vtableFixupsDir_toString_00h() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);

        if (cdi.vtableFixupsDir + "" !== "0:0h")
            throw cdi.vtableFixupsDir;
    }

    export function exportAddressTableJumpsDir_toString_00h() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);

        if (cdi.exportAddressTableJumpsDir + "" !== "0:0h")
            throw cdi.exportAddressTableJumpsDir;
    }

    export function managedNativeHeaderDir_toString_00h() {
        var bi = new pe.io.BufferBinaryReader(sampleBuf);
        var pef = new pe.headers.PEFile();
        pef.read(bi);
        var rvaReader = new pe.io.RvaBinaryReader(bi, pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address, pef.sectionHeaders);

        var cdi = new pe.managed.metadata.ClrDirectory();
        cdi.read(rvaReader);

        if (cdi.managedNativeHeaderDir + "" !== "0:0h")
            throw cdi.managedNativeHeaderDir;
    }
}