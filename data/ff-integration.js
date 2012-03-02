(function() {
    var processFileContents = function(fileMessage) {
        document.getElementById('ff-int-path').value = fileMessage.path;
        document.getElementById('ff-int-field').value = fileMessage.contents;
        document.defaultView.postMessage("readNew", "*");
    };

    var openFileElement = document.getElementById('openFile');
    openFileElement.onclick = function(event) {
        self.port.emit("openFile", "");
        return false;
    };

    var saveFileElement = document.getElementById('saveFile');
    saveFileElement.onclick = function(event) {
        document.defaultView.postMessage("copyOld", "*");
        return false;
    };

    // document.getElementById('settings').onclick = function(event) {
    //     ResourceManager.getFileContents("settings.html", function(urlContents) { 
    //         document.defaultView.postMessage("urlContents", {data:urlContents});
    //     });        
    // }

    self.port.on("fileContents", processFileContents);

    document.defaultView.addEventListener("message", function(event) {
        if (event.data == "readOld") {
            self.port.emit("saveFile", {"path":document.getElementById('ff-int-path').value, "contents":document.getElementById('ff-int-field').value});
        }
    });

    var ResourceManager = {
        callbacks: {},
        getFileContents: function(url, callback) {
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
    }
    self.port.on("urlContents", processUrlContents);

    document.defaultView.ffResourceManager = ResourceManager;
    console.log("value of windows is " + document.defaultView);
}());