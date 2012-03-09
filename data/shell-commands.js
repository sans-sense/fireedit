
/* shell-commands: register built-in commands with the shell */
define("fireedit/shell-commands", 
       ["require", "exports", "module", "fireedit/shell"],
       function(require, exports, module) {
         
           var shell = require("fireedit/shell").shell;

           /* places cursor at the line where the function with the
            * given name is defined */
           var goto_function = {
               name: "goto",
               fn: function(fname) {
                   for(var i = 0; i < sortedFunctions.length; i++) {
                       var f = sortedFunctions[i];
                       f._name === fname 
                           && this.getCurrentEditor().gotoLine(f._lineNo);
                   }
               }
           };

           /* register commands with the shell */
           var register = function() {
               shell.add(goto_function);
           };

           exports.commands = {
               register: register
           };
       });
