define("fireedit/ui/ui_manager", 
       ["require", "exports", "module", "jquery", "fireedit/core/application"],
       function(require, exports, module) {
           var application = require('fireedit/core/application').application;

           var doWithUrl = function(urlVal, callback, localpath) {
               if (application.localModeRun() || urlVal.match(/^file:/)) {
                   // ignores the local path parameter as we can not do much with security restrictions
                   $.ajax({
                       url: urlVal,
                       success: function(data, textStatus, jqXhr){
                           callback(jqXhr.responseText);
                       }
                   }).fail(function() {
                       callback("problems retriving data from " + urlVal);
                   });
               } else {
                   window.ffResourceManager.doWithUrl(urlVal, callback, localpath);
               }

           };

           var setInnerContents = function(element, contentUrl, callback) {
               doWithUrl(contentUrl, function(responseText) {
                   element.html(responseText);
                   setTimeout(callback, 0);
               });
           };

           // Static object for mantaining a loose coupling between jquery and the actual ui
           var UIManager = {
               openModalDialog: function(contentUrl, elementSelector, title, callback) {
                   var element = $(elementSelector);
                   if (!(callback)) {
                       callback = function() {
                       };
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
               evalNewScript: function(contentUrl, localpath) {
                   doWithUrl(contentUrl, function(responseText) {
                       if (responseText && responseText.match(/^problems/)) {
                           // do nothing
                       } else {
                           var newFunction = Function(responseText);
                           try{
                               newFunction();
                           } catch(e) {
                               alert(e);
                           }
                       }
                   }, localpath);
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
