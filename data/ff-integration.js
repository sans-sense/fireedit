(function() {
    var openFileWidget = document.getElementById('openFile');
    var path;
    openFileWidget.onclick = function(event) {
        path = window.prompt("Enter js file name","/data/host/projects/personalProjects/fun/jseditor/scratch.js");
        self.port.emit("openFile", path);
        return false;
    };

    var saveFileWidget = document.getElementById('saveFile');
    console.log(saveFileWidget);
    saveFileWidget.onclick = function(event) {
        document.defaultView.postMessage("copyOld", "*");
        return false;
    }


    self.port.on("fileContents", function(text) {
        document.getElementById('ff-int-field').value = text;
        document.defaultView.postMessage("readNew", "*");
    });

    self.port.on("readOld", function() {
        self.port.emit("saveFile", {"path":path, "contents":document.getElementById('ff-int-field').value});
    });

    document.defaultView.addEventListener("message", function(event) {
        if (event.data == "readOld") {
            self.port.emit("saveFile", {"path":path, "contents":document.getElementById('ff-int-field').value});
        }
    });
}());