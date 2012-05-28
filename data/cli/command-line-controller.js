
/* command-line-controller: Listens to command-line-view and acts on
 * command (and command changes TBD).
 */
define("fireedit/command-line-controller", 
       ["require", "exports", "module", "fireedit/shell"],
       function(require, exports, module) {

           var view;

           /* to execute the commands */
           var shell = require("fireedit/shell").shell;

           /* execute the given command.  command line is the string 
            * 'name arg1 arg2...'.  so needs to be split. */
           var onCommand = function(commandString) {
               // split command string to name and args
               var line = commandString.trim().split(/\s+/);
               var name = line.shift();  // first string is command name 
               var args = line;          // rest are arguments

               shell.execute(name, args);

               view.clear();
           };

           var onCommandChange = function(commandString) {
               // TODO to populate view with suggestions base on the current
               // command situation.
           };

           var bindTo = function(_view) {
               view = _view;
               view.onCommand(onCommand);
               view.onCommandChange(onCommandChange);
           };

           exports.controller = {
               bindTo: bindTo
           };

       });
