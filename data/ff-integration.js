(function() {
    var openFileElement = document.getElementById('openFile');
    openFileElement.onclick = function(event) {
        self.port.emit("openFile", "");
        return false;
    };

    var saveFileElement = document.getElementById('saveFile');
    saveFileElement.onclick = function(event) {
        document.defaultView.postMessage("copyOld", "*");
        return false;
    }


    self.port.on("fileContents", function(fileMessage) {
        document.getElementById('ff-int-path').value = fileMessage.path;
        document.getElementById('ff-int-field').value = fileMessage.contents;
        document.defaultView.postMessage("readNew", "*");
    });

    document.defaultView.addEventListener("message", function(event) {
        if (event.data == "readOld") {
            self.port.emit("saveFile", {"path":document.getElementById('ff-int-path').value, "contents":document.getElementById('ff-int-field').value});
        }
    });
}());