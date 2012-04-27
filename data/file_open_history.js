/**
 * Created with IntelliJ IDEA.
 * User: Sridhar Gopalakrishnan
 * Date: 4/26/12
 * Time: 7:20 PM
 * To change this template use File | Settings | File Templates.
 */

define("fireedit/history/file_open_history", ["require", "exports"], function(require, exports){
    var getFileHash = function(){
        var hash = document.defaultView.location.hash.replace("#", '');
        return hash.replace("file=", '');
    };
    var initHistory = function(){
        var checkAndNotify = function(isOnLoad){
            var filePath = getFileHash();
            console.log("Notify: ", filePath);
            if(isOnLoad && !filePath.length){
                return;
            }
            notifyAll(filePath);
        };
        document.defaultView.addEventListener("hashchange", function(e){
            console.log("hashchange", getFileHash(), isSetUsingJS);
            if(!isSetUsingJS){
                checkAndNotify();
            }
            isSetUsingJS = false;
        });

        /*Fire if needed on load after the listeners are in place*/
        setTimeout(function(){
            checkAndNotify(true);
        }, 100);
    };
    var callbacks = [];
    var notifyAll = function(newPath){
        for(var i=0; i<callbacks.length; i++){
            var callback = callbacks[i];
            callback(newPath);
        }
    };
    try{
        initHistory();
    }catch(e){
        alert(e.message);
    }

    /*Listeners will not be notified if the hash is changed using pushFileToHistory method*/
    var isSetUsingJS = false;
    exports.pushFileToHistory = function(path){
        isSetUsingJS = true;
        document.defaultView.location.hash = "file="+path;
        setTimeout(function(){
            isSetUsingJS = false;
        }, 10);
    };
    exports.bind = function(callback){
        callbacks.push(callback);
    };
    exports.unbindAll = function(){
        callbacks.splice(0, callbacks.length);
    };
    exports.getFileHash = getFileHash;
});