define("fireedit/core/command_manager", 
       ["require", "exports", "module", "pilot/canon"],
       function(require, exports, module) {

           var CommandManager = function() {
               
           };

           (function(){
               var canon = require("pilot/canon");

               var simulateClick = function(element) {
                   var event = document.createEvent("HTMLEvents");
                   event.initEvent('click', true, true);
                   element.dispatchEvent(event);
               };

               var bindKey = function(win, mac) {
                   return {
                       win: win,
                       mac: mac || win.replace("Ctrl", "Command"),
                       sender: "editor"
                   };
               };
               
               var browserOverrideCommands = [];
               browserOverrideCommands.push({
                   name:"open file",
                   bindKey:bindKey("Ctrl-o"),
                   exec: function(env, args, request) { simulateClick(document.getElementById('openFile')); return false;}
               });

               browserOverrideCommands.push({
                   name:"save file",
                   bindKey:bindKey("Ctrl-s"),
                   exec: function(env, args, request) { simulateClick(document.getElementById('saveFile')); return false;}
               });
               
               this.addBrowserOverrides = function() {
                   for (i = 0; i < browserOverrideCommands.length; i++) {
                       canon.addCommand(browserOverrideCommands[i]);
                   }
               };

               this.removeBrowserOverrrides = function() {
                   var i, command;
                   for ( i = 0; i < commands.length; i++) {
                       command = commands[i];
                       canon.removeCommand(command);
                   }
               };
               
           }).call(CommandManager.prototype);

           exports.commandManager = new CommandManager();
       });