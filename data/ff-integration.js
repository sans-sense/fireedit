(function() {
    var processFileContents = function(fileMessage) {
        document.getElementById('ff-int-path').value = fileMessage.path;
        document.getElementById('ff-int-field').value = fileMessage.contents;
        document.defaultView.postMessage("readNew", "*");
    };

    var localModeRun = function() {
        return document.location.toString().match(/^file:/);
    }

    var openFileElement = document.getElementById('openFile');
    openFileElement.onclick = function(event) {
        
        if (locaModeRun()) {
            var urlVal = prompt("Enter File Name");
            $.ajax({
                url: urlVal,
                success: function(data, textStatus, jqXhr){
                    processFileContents({path:urlVal, contents: jqXhr.responseText});
                }
            });
        } else {
            self.port.emit("openFile", "");
        }
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