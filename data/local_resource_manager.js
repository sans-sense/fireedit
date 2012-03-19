define("fireedit/core/localResourceManager", 
       ["require", "exports", "module"],
       function(require, exports, module) {
           
           var LocalResourceManager = function() {
           };

           (function(){
               var currentSettings = {};
               var settingsCallbacks = [];
               var settingsChanged = function() {
                   var settingsCallback, i;
                   for (i = 0; i < settingsCallbacks.length; i++) {
                       settingsCallback = settingsCallbacks[i];
                       settingsCallback();
                   }
               };
               this.doWithUrl = function(urlVal, callback, localpath) {
                   // ignores the local path parameter as we can not do much with security restrictions
                   $.ajax({
                       url: urlVal,
                       success: function(data, textStatus, jqXhr){
                           callback(jqXhr.responseText);
                       }
                   }).fail(function() {
                       callback("problems retriving data from " + urlVal);
                   });
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

               this.storePreferences = function() {
                   settingsChanged();
               };
               this.initPreferences = function(preferenceKeys) {
                   settingsChanged();
               };
               this.observeSettings = function(settingsCallback) {
                   settingsCallback.push(settingsCallback);
               };
               
           }).call(LocalResourceManager.prototype);

           exports.localResourceManager = new LocalResourceManager();
       });
