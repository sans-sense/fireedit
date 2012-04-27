(function() {
    var history = undefined;
    var initHistory = function(){
        history = unsafeWindow.require('fireedit/history/file_open_history');
        history.bind(function(path){
            if(!path.length){
                document.defaultView.location.reload()
            }else{
                self.port.emit("openFile", path);
            }
        });
    };

    var processFileContents = function(fileMessage) {
        document.getElementById('ff-int-path').value = fileMessage.path;
        document.getElementById('ff-int-field').value = fileMessage.contents;
        document.defaultView.postMessage("readNew", "*");
        history.pushFileToHistory(fileMessage.path);
    };

    var openFileElement = document.getElementById('openFile');
    if (openFileElement) {
        openFileElement.onclick = function(event) {
            self.port.emit("openFile", "");
            return false;
        };
    }

    var saveFileElement = document.getElementById('saveFile');
    if (saveFileElement) {
        saveFileElement.onclick = function(event) {
            document.defaultView.postMessage("copyOld", "*");
            return false;
        };
    }

    self.port.on("fileContents", processFileContents);

    document.defaultView.addEventListener("message", function(event) {
        if (event.data == "readOld") {
            self.port.emit("saveFile", {"path":document.getElementById('ff-int-path').value, "contents":document.getElementById('ff-int-field').value});
        }
    });

    // TODO change this to use the singleton style, execute should not escape
    var ResourceManager = {
        callbacks:  {},
        preferences:{},
        settingsCallbacks:[],

        doWithUrl: function(url, callback, localpath) {
            var unique_stamp = url + Date.now();
            var requestDescriptor = {"path": url, "callerId": unique_stamp};
            if (localpath) {
                self.port.emit("getLocalUrl", requestDescriptor);
            } else {
                self.port.emit("getUrl", requestDescriptor);
            }
            ResourceManager.callbacks[unique_stamp] = callback;
        },
        execute: function(unique_stamp, urlContents) {
            var callback = ResourceManager.callbacks[unique_stamp];
            if (callback) {
                callback(urlContents);
                delete ResourceManager.callbacks[unique_stamp];
            }
        },
        initPreferences: function(preferenceKeys) {
            self.port.emit("getAllPrefernces", {contents:preferenceKeys});
        },
        
        storePreferences: function() {
            self.port.emit("storeAllPreferences", {contents:ResourceManager.preferences});
            ResourceManager.settingsChanged();
        },
        
        setSettingValue : function(key, value) {
            ResourceManager.preferences[key] = value;
        },

        getSettingValue : function(key) {
            return ResourceManager.preferences[key];
        },

        removeSettingValue : function(key) {
             ResourceManager.preferences[key] = null;
        },
        setupPreferences : function(preferenceData) {
            ResourceManager.preferences = preferenceData;
            ResourceManager.settingsChanged();
        },
        observeSettings : function(settingsCallback) {
            ResourceManager.settingsCallbacks.push(settingsCallback);
        },
        settingsChanged : function() {
            var settingsCallback, i;
            for (i = 0; i < ResourceManager.settingsCallbacks.length; i++) {
                settingsCallback = ResourceManager.settingsCallbacks[i];
                settingsCallback();
            }
        },
        isRemote: true
    };

    var processUrlContents = function(responseData) {
        ResourceManager.execute(responseData.callerId, responseData.contents);
    };

    var processPreferences = function(responseData) {
        ResourceManager.setupPreferences(responseData.contents);
    };

    self.port.on("urlContents", processUrlContents);
    self.port.on("allPreferences", processPreferences);

    unsafeWindow.ffResourceManager = ResourceManager;
    ResourceManager.initPreferences(['settings-url-key', 'added-browser-overrides']);
    unsafeWindow.require("fireedit/core/application").application.resourceManagerChanged();

    initHistory();
}());