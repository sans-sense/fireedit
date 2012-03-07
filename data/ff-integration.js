(function() {
    var processFileContents = function(fileMessage) {
        document.getElementById('ff-int-path').value = fileMessage.path;
        document.getElementById('ff-int-field').value = fileMessage.contents;
        document.defaultView.postMessage("readNew", "*");
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
        doWithUrl: function(url, callback) {
            var unique_stamp = url + Date.now();
            self.port.emit("getUrl", {"path": url, "callerId": unique_stamp});
            ResourceManager.callbacks[unique_stamp] = callback;
        },
        execute: function(unique_stamp, urlContents) {
            var callback = ResourceManager.callbacks[unique_stamp];
            if (callback) {
                callback(urlContents);
                delete ResourceManager.callbacks[unique_stamp];
            }
        }
    };

    var processUrlContents = function(responseData) {
        ResourceManager.execute(responseData.callerId, responseData.contents);
    };
    self.port.on("urlContents", processUrlContents);

    unsafeWindow.ffResourceManager = ResourceManager;
}());