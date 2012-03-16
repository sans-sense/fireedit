define("fireedit/core/application", 
       ["require", "exports", "module"],
       function(require, exports, module) {

           var Application = function() {
           };

           (function(){
               var currentSettings = {};
               var currentEditor;

               this.localModeRun = function() {
                   return document.location.toString().match(/^file:/);
               };

               this.setCurrentEditorUrl = function(filePath) {
                   var fileName, tabName;
                   if (filePath) {
                       document.getElementById('ff-int-path').value = filePath;
                   } else {
                       filePath = document.getElementById('ff-int-path').value;
                   }

                   if (filePath && filePath.length > 0) {
                       fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
                       tabName = fileName;
                   } else {
                       tabName = "New File";
                   }
                   $("#edit-area ul.nav-tabs li.active a").html(tabName);
               };

               this.setCurrentEditorContent = function(fileContents) {
                   var hiddenValueCarrier = document.getElementById('ff-int-field');

                   if (fileContents && fileContents.length > 0) {
                       hiddenValueCarrier.value = fileContents;
                   }
                   currentEditor.getSession().setValue(hiddenValueCarrier.value);
                   hiddenValueCarrier.value = "";
               };

               this.setCurrentEditor = function(editor) {
                   currentEditor = editor;
               };

               this.getCurrentEditor = function() {
                   return currentEditor;
               };

               this.setSettingValue = function(key, value) {
                   currentSettings[key] = value;
               };

               this.getSettingValue = function(key) {
                   return currentSettings[key];
               };

               this.removeSettingValue = function(key) {
                   delete currentSettings[key];
               };
               
           }).call(Application.prototype);

           exports.application = new Application();
       });

