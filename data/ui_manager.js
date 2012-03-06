define("fireedit/ui/ui_manager", 
       ["require", "exports", "module", "jquery"],
       function(require, exports, module) {
           var localModeRun = function() {
               return document.location.toString().match(/^file:/);
           };

           var doWithUrl = function(urlVal, callback) {
               if (localModeRun()) {
                   $.ajax({
                       url: urlVal,
                       success: function(data, textStatus, jqXhr){
                           callback(jqXhr.responseText);
                       }
                   }).fail(function() {
                       callback("problems retriving data from " + urlVal);
                   });
               } else {
                   var fileExt = urlVal.substring(urlVal.lastIndexOf(".") + 1);
                   var fileName = urlVal.substring(0, urlVal.lastIndexOf("."));
                   callback($("#hiddenContent_"+fileName + "_" + fileExt).html())
               }

           };

           var setInnerContents = function(element, contentUrl, callback) {
               doWithUrl(contentUrl, function(responseText) {
                   element.html(responseText);
                   setTimeout(callback, 0);
               });
           }

           // Static object for mantaining a loose coupling between jquery and the actual ui
           var UIManager = {
               openModalDialog: function(contentUrl, elementSelector, title, callback) {
                   var element = $(elementSelector);
                   if (!(callback)) {
                       callback = function() {
                       }
                   }
                   setInnerContents(element.children(".modal-body"), contentUrl, function(){
                       element.children(".modal-header").children("h3").html(title);
                       element.modal();
                       element.draggable();
                       if(callback)
                        callback();
                   });
               },
               openDialog: function(contentUrl, elementSelector, title, callback){
                   UIManager.openModalDialog(contentUrl,elementSelector,title,function(){
                        $('.modal-backdrop').hide();
                        if(callback) callback();
                    });
               },
               openUrl: function(contentUrl, callback) {
                   doWithUrl(contentUrl, callback);
               },
               evalNewScript: function(contentUrl) {
                   doWithUrl(contentUrl, function(responseText) {
                       var newFunction = Function(responseText);
                       newFunction();
                   });
               },
               getElement: function(elementSelector) {
                   return $(elementSelector);
               },
               getFirstElement: function(elementSelector) {
                   return $(elementSelector)[0];
               }

           };

           exports.UIManager = UIManager;
       }
       
);
