/// <reference path="PE/BinaryReader.ts" />
/// <reference path="PE/PEFile.ts" />

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

        if (!(value===null)) {
            if (typeof value == "number")
                value = value + "(" + value.toString(16) + "h)";
            else if (typeof value == "string")
                value = "\"" + value + "\"";
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

    Mi.PE.getUrlBinaryReader(
        "mscorlib.dll",
        reader => {
            try {
                var pe = new Mi.PE.PEFile();
                pe.read(reader);

                content.innerText += "\n\nstatic " + printMembers(pe);
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

                    Mi.PE.getFileBinaryReader(
                        file,
                        reader => {
                            var pe = new Mi.PE.PEFile();
                            pe.read(reader);

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