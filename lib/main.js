
(function(){
    const { Hotkey } = require("hotkeys");
    const {Panel } = require("panel");
    const tabs  = require("tabs");
    const data = require("self").data;
    const fileUtils = require("fireedit/fileUtils");
    const {Cc, Ci } = require("chrome");
    const nsIFP = Ci.nsIFilePicker;
    const cm = require("context-menu");
    const preferenceService = require("preferences-service");

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
        var preferencePrefix = "extensions.fireedit.";

        tabs.open({
            url: data.url("editor.html"),
            onReady: function(tab) {
                // create a page-mod
                var worker = tab.attach({
                    contentScriptFile: [data.url("jquery.js"), data.url("ff-integration.js")]
                });

                worker.port.on("openFile", function(path){
                    try{
                        var window = require("window-utils").activeWindow;
                        if(!path || !path.length){
                            var filePicker = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFP);

                            filePicker.init(window, "Choose JS file", nsIFP.modeOpen);

                            var res = filePicker.show();
                            if (res == nsIFP.returnOK || res == nsIFP.returnReplace) {
                                path = filePicker.file.path;
                            }
                        }
                        if(path && path.length){
                            worker.port.emit("fileContents", {
                                "path": path,
                                "contents": fileUtils.openFile(path)
                            });
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
                worker.port.on("getUrl",function(urlRequest) {
                    try{
                        var content = data.load("file://"+urlRequest.path);
                        //worker.port.emit("urlContents", {"contents":data.load(urlRequest.path), "callerId": urlRequest.callerId});
                    }catch(e){
                        console.log(e.message, urlRequest.path, data, data.load);
                    }
                });
                worker.port.on("getLocalUrl",function(urlRequest) {
                    try{
                        var fileContents = fileUtils.openFile(urlRequest.path);
                        worker.port.emit("urlContents", {"contents":fileContents, "callerId": urlRequest.callerId});
                    }catch(e) {
                        worker.port.emit("urlContents", {"contents":"No File at "+urlRequest, "callerId": urlRequest.callerId});
                    }
                });
                worker.port.on("getAllPrefernces",function(message) {
                    var preferences = {}, i, key, preferenceKeys, value;
                    preferenceKeys = message.contents;
                    console.log("get All called " + message + preferenceKeys);
                    for (i = 0; i < preferenceKeys.length; i++) {
                        key = preferenceKeys[i];
                        value = preferenceService.get( preferencePrefix + key);
                        preferences[key] = value;
                        console.log(key +" " +value);
                    }
                    worker.port.emit("allPreferences", {"contents":preferences});
                });
                worker.port.on("storeAllPreferences",function(message) {
                    var value, key, preferences;
                    preferences = message.contents;
                    console.log("store All called " + message + preferences);

                    for (key in preferences) {
                        value = preferences[key];
                        preferenceService.set(preferencePrefix + key, value);
                    }
                });
            }
        });
    }
}());
