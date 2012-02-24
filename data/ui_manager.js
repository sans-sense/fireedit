define("fireedit/ui/ui_manager", 
       ["require", "exports", "module", "jquery"],
       function(require, exports, module) {
           var doWithUrl = function(urlVal, callback) {
               $.ajax({
                   url: urlVal,
                   success: function(data, textStatus, jqXhr){
                       callback(jqXhr.responseText);
                   }
               });
           };

           var setInnerContents = function(element, contentUrl, callback) {
               doWithUrl(contentUrl, function(responseText) {
                   element.html(responseText);
                   setTimeout(callback, 0);
               });
           }

           // Static object for mantaining a loose coupling between jquery and the actual ui
           var UIManager = {
               openDialog: function(contentUrl, elementSelector, title, callback) {
                   var element = $(elementSelector);
                   if (!(callback)) {
                       callback = function() {
                           element.attr('title', title)
                           element.dialog();
                       }
                   }
                   setInnerContents(element, contentUrl, callback);
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
