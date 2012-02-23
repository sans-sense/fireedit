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
    }

    var helpElement = document.getElementById('helpLink');
    helpElement.onclick = function(event) {
        window.open('http://blog.imaginea.com/mViewer');
    }

    document.getElementById('settings').onclick = function(event) {
        
    }

    self.port.on("fileContents", processFileContents);

    document.defaultView.addEventListener("message", function(event) {
        if (event.data == "readOld") {
            self.port.emit("saveFile", {"path":document.getElementById('ff-int-path').value, "contents":document.getElementById('ff-int-field').value});
        }
    });
}());