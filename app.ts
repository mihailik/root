/// <reference path="PE/IO/BinaryReader.ts" />
/// <reference path="PE/IO/IO.ts" />
/// <reference path="PE/PEFormat/PEFile.ts" />
/// <reference path="PE/PEFormat/PEFileReader.ts" />
/// <reference path="PE/AssemblyDefinition.ts" />
/// <reference path="PE/Cli/ModuleReader.ts" />

declare var ko;
function renderPE(pe: Mi.PE.PEFormat.PEFile) {
    ko.applyBindings(pe, document.getElementById("pe"));
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

function applyTo(name: string, apply: (element: HTMLElement) => void ) {
    var element = document.getElementById(name);
    if (element) {
        apply(element);
    }
}

function loaded() {

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
                Mi.PE.Cli.ModuleReader.readModule(mod, reader);
            }
            catch (error) {
                alert("Error " + error + " "+((e: any) => e.stack)(error));
            }
        },
        noPE =>
            alert("Error " + noPE + " "+((e: any) => e.stack)(noPE)));

    try {

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
        alert(e);
    }

}

window.onload = loaded;