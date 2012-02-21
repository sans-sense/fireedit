(function(){
    const { Hotkey } = require("hotkeys");
    const {Panel } = require("panel");
    const tabs  = require("tabs");
    const data = require("self").data;
    const fileUtils = require("fireedit/fileUtils");
    const {Cc, Ci } = require("chrome");
    const nsIFP = Ci.nsIFilePicker;
    const cm = require("context-menu");

    // bind the editor to ctrl-shift-f
    var toggleHotKey = Hotkey({
        combo: "control-shift-f",
        onPress: function() {
            wireupEditor();
        }
    });

    cm.Item({
        label: "FireEdit",
        contentScript: "self.on('click', self.postMessage)",
        onMessage: function() {
            wireupEditor();
        }
    });


    /**
     *  Wires up the editor, opens it in a new tab, setsup workers
     **/
    function wireupEditor() {
        tabs.open({
            url: data.url("editor.html"),
            onReady: function(tab) {
                var worker = tab.attach({
                    contentScriptFile: [data.url("ff-integration.js") ]
                });
                worker.port.on("openFile", function(dummypath){
                    try{
                        var window = require("window-utils").activeWindow;
                        var filePicker = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFP);
                        var path;

                        filePicker.init(window, "Choose JS file", nsIFP.modeOpen);

                        var res = filePicker.show();
                        if (res == nsIFP.returnOK || res == nsIFP.returnReplace) {
                            path = filePicker.file.path
                            var contents = fileUtils.openFile(path);
                            worker.port.emit("fileContents", {"path":path, "contents":contents});
                        }
                    }catch(error) {
                        console.log(error);
                    }
                });
                worker.port.on("saveFile", function(dataWithPath) {
                    try{
                        fileUtils.writeFile(dataWithPath.path, dataWithPath.contents);
                    }catch(error) {
                        console.log(error);
                    }
                });
            }
        });
    }
}());
