define("fireedit/core/application", 
       ["require", "exports", "module", "fireedit/core/localResourceManager"],
       function(require, exports, module) {

           var getResourceManager = function() {
               // content-script overrides the window variable
               return window.ffResourceManager;
           }


           var Application = function() {
               var preferenceKeys = {};
               preferenceKeys.settingsUrlKey = 'settings-url-key';
               preferenceKeys.browserOverrides = 'added-browser-overrides'; 

               this.preferenceKeys = preferenceKeys;
               this.settingsCallbacks = [];
           };


          window.ffResourceManager = require("fireedit/core/localResourceManager").localResourceManager;

           (function(){
               var currentEditor;
               var self = this;

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
                   getResourceManager().setSettingValue(key, value);
               };

               this.getSettingValue = function(key) {
                   return getResourceManager().getSettingValue(key);
               };

               this.removeSettingValue = function(key) {
                   getResourceManager().removeSettingValue(key);
               };
               this.storeSettings = function() {
                   getResourceManager().storePreferences();
               };
               this.observeSettings = function(settingsCallback) {
                   getResourceManager().observeSettings(settingsCallback);
                   this.settingsCallbacks.push(settingsCallback);
               };
               this.resourceManagerChanged = function() {
                   var i, settingsCallback;
                   for (i = 0; i < this.settingsCallbacks.length; i++) {
                       settingsCallback = this.settingsCallbacks[i];
                       getResourceManager().observeSettings(settingsCallback);
                   }
               };
           }).call(Application.prototype);

           var currentApplication = new Application();
           exports.application = currentApplication;
           
       });

