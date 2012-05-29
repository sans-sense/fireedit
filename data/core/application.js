define("fireedit/core/application", 
       ["require", "exports", "module", "fireedit/core/localResourceManager", "fireedit/history/file_open_history"],
       function(require, exports, module) {

           var getResourceManager = function() {
               // content-script overrides the window variable
               return window.ffResourceManager;
           };


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
               var registeredViews = {};
               var self = this;
               var history = require('fireedit/history/file_open_history');

               var loadURL = function(urlVal){
                   require('fireedit/ui/ui_manager').UIManager.openUrl(urlVal,  function(responseText) {
                       self.setCurrentEditorUrl(urlVal);
                       self.setCurrentEditorContent(responseText);
                   });
               };

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
               this.registerView = function(name, implementation) {
                   registeredViews[name] = implementation;
               };
               this.getView = function(name) {
                   return registeredViews[name];
               };
               this.init = function() {
                   if (this.localModeRun()) {
                       history.bind(function(path){
                           if(!path.length){
                               document.defaultView.location.reload();
                           }else{
                               loadURL(path);
                           }
                       });
                   }
               };
               this.openUrlInEditor = function(urlVal) {
                   history.pushFileToHistory(urlVal);
                   loadURL(urlVal);
               };
               this.uiInitialized = function() {
                   var editor = ace.edit("editor-file001");
                   editor.setTheme("ace/theme/twilight");
                   self.setCurrentEditor(editor);

                   var JavaScriptMode = require("fireedit/mode/enh_javascript").Mode;
                   var jsMode = new JavaScriptMode();
                   editor.getSession().setMode(jsMode);
                   // TODO we need a way to listen on change and rebuild my AST
                   jsMode.enhanceWorker(editor.getSession());

                   var OutlineView = require("fireedit/view/outline_view").View;
                   new OutlineView(jsMode, document.getElementById("sidebar-outline"));

                   jsMode.emitAST(editor.getSession().getDocument().getValue());
                   editor.focus();

                   require("fireedit/shell-commands").commands.register();
                   var commandLineView = require("fireedit/command-line-view").view;
                   var commandLineController = require("fireedit/command-line-controller").controller;
                   commandLineView.bindTo($('#command-line'));
                   commandLineController.bindTo(commandLineView);
               };
           }).call(Application.prototype);

           var currentApplication = new Application();
           currentApplication.init();
           exports.application = currentApplication;
           
       });


// $("#edit-area ul.nav-tabs").append('<li><a href="#editor-file001" data-toggle="tab">Scratch Pad</a>')
