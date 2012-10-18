/// <reference path="BinaryReader.ts" />
/// <reference path="PEFile.ts" />

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

        if (value) {
            if (typeof value == "number")
                value = value + "(" + value.toString(16) + "h)";
            else if (value.toUTCString)
                value = value + "(" + value.toUTCString() + ")";
        }
        else {
            value = "null";
        }
        result += "    " +p + "=" + value;
    }
    result += "\n}";
    return result;
}


function loaded() {

    var req = new Mi.PE.HttpBinaryReader("mscorlib.dll");

    Mi.PE.PEFile.read(
        req,
        pe => {
            content.innerText+="\n\nstatic "+printMembers(pe);
        },
        noPE =>
            alert("Error " + noPE));

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

                    Mi.PE.PEFile.read(
                        new Mi.PE.FileBinaryReader(file),
                        pe => {
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