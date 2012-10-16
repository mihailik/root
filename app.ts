/// <reference path="BinaryReader.ts" />
/// <reference path="PEFile.ts" />

declare var content : HTMLDivElement;

function loaded() {

    try {
        var dummyText =
            "TTTTTTTTTTTTTTTTTTTTTTTTT" + "\n\n"+
            "TTTTTTTTTTTTTTTTTTTTTTTTT";

        content.innerText = dummyText;

        //content.draggable = true;
        content.ondragenter = e => { content.className = "dragover"; return false; };
        content.ondragover = e => false;

        content.ondrop = function (e) {
            try {
                content.className = null;

                var msg = "";

                var files = e.dataTransfer.files;
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    msg += "\n" + file.name + " " + file.size + " " + file.type;

                    PEFile.read(
                        new FileBinaryReader(file),
                        pe => {
                            var result = "PE {\n";
                            for (var p in pe) {
                                if (typeof pe[p] == "function")
                                    continue;

                                if (result[result.length-2]!="{")
                                    result += ",\n";
                                var value = pe[p];
                                if (typeof value == "number")
                                    value = value + "(" + value.toString(16) + "h)";
                                else if (value.toUTCString)
                                    value = value + "("+value.toUTCString()+")";
                                result += "    " +p + "=" + value;
                            }
                            result += "\n}";
                            content.innerText+="\n\n"+result;
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