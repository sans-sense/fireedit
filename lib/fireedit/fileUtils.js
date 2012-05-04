/**
 * File utils used for saving and reading.
 *
 */
define("fireedit/fileUtils", function() {
    const {Cc,Ci} = require("chrome");



    var openFile = function(path) {
        return readFile(getFile(path));
    };
	var openFileInputStream = function(file) {
		var stream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
		stream.init(file, 0x01, 00004, 0);
		var sis = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);
		sis.init(stream);
		return sis;
	};
	var readFile = function(file) {
		var stream = openFileInputStream(file);
		var content = stream.read(stream.available());
		stream.close();
		return content;
	};
    var writeFile = function(path, text) {
        var stream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
        var file = getFile(path);
		stream.init(file, 0x02 | 0x08 | 0x20, 420, 0);
        stream.write(text, text.length);
	    stream.close();
    };
    var getFile = function(path) {
		var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
		file.initWithPath(path);
		return file;
    };

    //In few versions of Firefox, global exports are not defined. Hence the below fix.
    if (!exports) {
        return {
            getFile: getFile,
            writeFile: writeFile,
            openFile: openFile
        };
    }

    // exports...
    exports.getFile = getFile;
    exports.writeFile = writeFile;
    exports.openFile = openFile;
});