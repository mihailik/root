/// <reference path="PE/IO/BinaryReader.ts" />
/// <reference path="PE/IO/DataViewBinaryReader.ts" />
/// <reference path="PE/PEFormat/PEFile.ts" />
/// <reference path="PE/PEFormat/PEFileReader.ts" />
/// <reference path="PE/AssemblyDefinition.ts" />
/// <reference path="PE/Cli/ModuleReader.ts" />

declare var content : HTMLDivElement;

function printMembers(pe) {
    var result = "{\n";
    for (var p in pe) {
        var value;
        try { value = pe[p]; }
        catch (error) { value = "### " + error.message + " ###"; }

        if (typeof value == "function")
            continue;

        if (result[result.length-2]!="{")
            result += ",\n";

        if (value === null) {
            value = "null";
        }
        else if (typeof value == "undefined") {
            value = "undefined";
        }
        else {
            if (typeof value == "number")
                value = value + "(" + value.toString(16) + "h)";
            else if (typeof value == "string")
                value = "\"" + value + "\"";
            else if (typeof value == "object" && value.constructor == Date && value.toUTCString)
                value = value + "(" + value.toUTCString() + ")";
        }

        result += "    " +p + "=" + value;
    }
    result += "\n}";
    return result;
}


function loaded() {

    Mi.PE.IO.getUrlBinaryReader(
        "mscorlib.dll",
        reader => {
            try {
                //var pe = new Mi.PE.PEFile();
                //Mi.PE.Internal.PEFileReader.read(pe, reader);

                var pe = new Mi.PE.PEFormat.PEFile();
                Mi.PE.PEFormat.readPEFile(pe, reader);

                var mod = new Mi.PE.ModuleDefinition();
                mod.pe = pe;
                Mi.PE.Cli.ModuleReader.readModule(mod, reader);

                //var asmLoader = new Mi.PE.AssemblyLoader();
                //var pe = asmLoader.load(reader);

                content.innerText += "\n\nstatic " + printMembers(pe) + "\n\n"+printMembers(mod);
            }
            catch (error) {
                if (pe)
                    content.innerText += "\n\nstatic " + printMembers(pe);

                alert("Error " + error + " "+((e: any) => e.stack)(error));
            }
        },
        noPE =>
            alert("Error " + noPE + " "+((e: any) => e.stack)(noPE)));

    try {

        var dummyText =
            "TTTTTTTTTTTTTTTTTTTTTTTTT" + "\n\n"+
            "TTTTTTTTTTTTTTTTTTTTTTTTT";

        content.innerText = dummyText;

        //content.draggable = true;
        content.ondragenter = e => { content.className = "dragover"; return false; };
        content.ondragleave =  e => { content.className = null; return false; };
        content.ondragover = e => false;

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

                            content.innerText+="\n\n"+file.name+" "+printMembers(pe);
                        },
                        noPE =>
                            alert("Error " + noPE));
                }

                content.innerText = dummyText + "\n\n" + msg;
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