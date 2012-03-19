define("fireedit/ext/customizer", 
       ["require", "exports", "module", 'fireedit/core/application', "fireedit/core/command_manager", "fireedit/ui/ui_manager"],
       function(require, exports, module) {
           var application = require('fireedit/core/application').application;
           var commandManager = require("fireedit/core/command_manager").commandManager;
           var UIManager = require("fireedit/ui/ui_manager").UIManager;

           var Customizer = function() {
           };

           (function(){
               var self = this;
               this.settingsChanged = function() {
                   self.customize();
               };
               this.customize = function() {
                   var browserOverrides = application.getSettingValue(application.preferenceKeys.browserOverridesKey), 
                   settingsFile = application.getSettingValue(application.preferenceKeys.settingsUrlKey);

                   if ( browserOverrides !== false) {
                       commandManager.addBrowserOverrides();
                   }
                   if (settingsFile) {
                       self.runSettingsFile(settingsFile);
                   }
               };
               this.runSettingsFile = function(contentUrl) {
                   UIManager.evalNewScript(contentUrl, true);
               };
               this.setup = function() {
                   application.observeSettings(self.settingsChanged);
               }
           }).call(Customizer.prototype);
           
           var customizer = new Customizer();
           exports.customizer = customizer;
          
       });

require("fireedit/ext/customizer").customizer.setup();
