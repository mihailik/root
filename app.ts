/// <reference path="PE/IO/BinaryReader.ts" />
/// <reference path="PE/IO/RvaBinaryReader.ts" />
/// <reference path="PE/IO/IO.ts" />
/// <reference path="PE/PEFormat/PEFile.ts" />
/// <reference path="PE/PEFormat/PEFileReader.ts" />
/// <reference path="PE/AssemblyDefinition.ts" />
/// <reference path="PE/Cli/ModuleReader.ts" />

declare var ko;
function renderPE(pe: Mi.PE.PEFormat.PEFile) {
    ko.cleanNode(document.getElementById("pe"));
    setTimeout(function {
        ko.applyBindings(pe, document.getElementById("pe"));
    }, 100);
}

function formatHex(value: number) {
    if (typeof value == "null"
        || value === null)
        return "null";
    else if(typeof value == "undefined")
        return "undefined";
    else if (value==0)
        return "0";
    else if (typeof value == "number")
        return value.toString(16).toUpperCase() + "h";
    else
        return value + "";
}

function formatAddress(value: number) {
    if (typeof value == "null"
        || value === null)
        return "null";
    else if(typeof value == "undefined")
        return "undefined";
    
    var result = value.toString(16).toUpperCase();
    if (result.length<=4)
        result = "0000".substring(result.length) + result + "h";
    else
        result = "00000000".substring(result.length) + result + "h";

    return result;
}

function formatBytes(bytes: Uint8Array) {
    var concatResult: string[] = [];
    for (var i = 0; i < bytes.length; i++) {
        if (i > 0) {
            if (i % 16 == 0)
                concatResult.push("\r\n");
            else if (i % 8 == 0)
                concatResult.push(" | ");
            else if (i % 4 == 0)
                concatResult.push(" ");
        }
        
        if (bytes[i]<16)
            concatResult.push("0" + bytes[i].toString(16).toUpperCase());
        else
            concatResult.push(bytes[i].toString(16).toUpperCase());
    }

    return " " + concatResult.join(" ");
}

function applyTo(name: string, apply: (element: HTMLElement) => void ) {
    var element = document.getElementById(name);
    if (element) {
        apply(element);
    }
}

function onloaded() {
    try {

    var content = document.getElementById("pe");

    Mi.PE.IO.getUrlBinaryReader(
        "sample.exe",
        reader => {
            try {
                //var pe = new Mi.PE.PEFile();
                //Mi.PE.Internal.PEFileReader.read(pe, reader);

                var pe = new Mi.PE.PEFormat.PEFile();
                Mi.PE.PEFormat.readPEFile(pe, reader);

                renderPE(pe);

                var mod = new Mi.PE.ModuleDefinition();
                mod.pe = pe;

                var sections = [];
                for (var i = 0; i < pe.sectionHeaders.length; i++) {
                    sections.push({ physical: pe.sectionHeaders[i].rawData, virtual: pe.sectionHeaders[i].virtualRange });
                }
                var rvaReader = new Mi.PE.IO.RvaBinaryReader(reader, sections[0].virtual.address, sections);
                Mi.PE.Cli.ModuleReader.readModule(mod, rvaReader);
            }
            catch (error) {
                alert("Error " + error + " "+((e: any) => e.stack)(error));
            }
        },
        noPE =>
            alert("Error " + noPE + " "+((e: any) => e.stack)(noPE)));


        //content.draggable = true;
        content.ondragenter = e => { content.className = "dragover"; e.cancelBubble = true; };
        content.ondragleave = e => { if (e.toElement == content) content.className = null; e.cancelBubble = true; };
        //content.ondragover = e => false;

        content.ondrop = function (e) {
            try {
                content.className = null;

                var msg = "";

                var files = e.dataTransfer.files;
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    msg += "\n" + file.name + " " + file.size + " " + file.type;

                    Mi.PE.IO.getFileBinaryReader(
                        file,
                        reader => {
                            var pe = new Mi.PE.PEFormat.PEFile();
                            Mi.PE.PEFormat.readPEFile(pe, reader);

                            renderPE(pe);
                        },
                        noPE =>
                            alert("Error " + noPE));
                }
            }
            catch (error) {
                alert("ondrop "+ error);
            }

            return false;
        };
    }
    catch (e) {
        var errorText = e + "";
        if (errorText.indexOf(e.message)<0)
            errorText = e.message;
        alert(errorText);
    }

}
window.onload = onloaded;