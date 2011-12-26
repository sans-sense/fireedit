// AN 23-12-11 global editor and parsedResult so we can mess with in console
var editor;

window.onload = function() {
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/twilight");
    
    var JavaScriptMode = require("fireedit/mode/enh_javascript").Mode;
    var jsMode = new JavaScriptMode();
    editor.getSession().setMode(jsMode);
    
    // TODO we need a way to listen on change and rebuild my AST
    jsMode.enhanceWorker(editor.getSession());

    var OutlineView = require("fireedit/view/outline_view").View;
    var outlineView = new OutlineView(jsMode, document.getElementById("outline-view"));

    jsMode.emitAST(editor.getSession().getDocument().getValue());
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

//Utility methods format and trim added to string
(function() {
    if (typeof String.prototype.format !== 'function') {
        String.prototype.format = function () {
            var formatted = this,
            i;
            for (i = 0; i < arguments.length; i++) {
                formatted = formatted.replace("[" + i + "]", arguments[i]);
            }
            return formatted;
        };
    }

    if (typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function () {
            var str = this;
            // AN typeof recipe for disaster in IE8
            // if (!str || typeof str !== 'string') {
            if (!str) {
                return "";
            } else {
                str = str.toString();
                return str.replace(/^[\s]+/, '').replace(/[\s]+$/, '').replace(/[\s]{2,}/, ' ');
            }
        };
    }
}());
