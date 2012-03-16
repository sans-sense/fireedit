define("fireedit/ext/customizer", 
       ["require", "exports", "module", 'fireedit/core/application', "fireedit/core/command_manager", "fireedit/ui/ui_manager"],
       function(require, exports, module) {
           var application = require('fireedit/core/application').application;
           var commandManager = require("fireedit/core/command_manager").commandManager;
           var UIManager = require("fireedit/ui/ui_manager").UIManager;

           var Customizer = function() {
           };

           (function(){
               this.customize = function() {
                   commandManager.addBrowserOverrides();
                   application.setSettingValue("added-browser-overrides",true);
               };
               this.runSettingsFile = function(contentUrl) {
                   UIManager.evalNewScript(contentUrl, true)
               };
           }).call(Customizer.prototype);
           
           exports.customizer = new Customizer();
       });

require("fireedit/ext/customizer").customizer.customize();