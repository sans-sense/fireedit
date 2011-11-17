var editor;

window.onload = function() {
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/twilight");
    
    var JavaScriptMode = require("ace/mode/enh-javascript").Mode;
    editor.getSession().setMode(new JavaScriptMode());
};

window.addEventListener("message", function(event) {
    try{
        var hiddenValueCarrier = document.getElementById('ff-int-field');
        if (event.data == "readNew") {
            console.log("got the readNew message");
            editor.getSession().setValue(hiddenValueCarrier.value);        
        } else if (event.data == "copyOld") {
            console.log("got the copyOld message");
            hiddenValueCarrier.value = editor.getSession().doc.getAllLines().join("\n");
            document.defaultView.postMessage("readOld", "*");
        }
    }catch(error) {
        console.log(error);
    }
}, false);

