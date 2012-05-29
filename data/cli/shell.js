
/* shell: container to hold commands and execute them.
 * 
 * Shell executes the commands in the application scope i.e. 'this' inside a 
 * shell command points the the application.
 */
define("fireedit/shell", 
       ["require", "exports", "module", "fireedit/core/application"],
       function(require, exports, module) {

           var commands = [];

           /* shell commands are executed in this application scope */
           var app = require("fireedit/core/application").application;

           /* adds the given command to the available commands.  If there 
            * already exists a command with the same name then this new command
            * shadows the old command.  So, later, when this new command is 
            * removed, the old command is un-shadowed (if at all there is such 
            * a word).  This is by-design (not a bug). */
           var add = function(command) {
               // this command could also be called from outside our code.
               // so a little error checking is done
               validate(command);

               commands.unshift(command);   // add in the front 
           };

           /* return the command given the command name */
           var get = function(name) {
               for(var i = 0; i < commands.length; i++) {
                   if(name === commands[i].name) {
                       return commands[i];
                   }
               }
               throw { 
                   name: "CommandNotFoundError",
                   message: "Unknown command: " + name
               };
           };

           var execute = function(commandName, args) {
               get(commandName).fn.apply(app, args);
               require('fireedit/core/application').application.getCurrentEditor().focus();
           };

           exports.shell = {
               add: add,
               execute: execute               
           };


           /* validate the command name and function given is a function
            * If command becomes an class this is to move into it. */
           var validate = function(command) {
               if(typeof command.name !== 'string' || command.name === '') {
                   throw {
                       name: 'InvalidCommandNameError'
                   };
               }
               if(typeof command.fn !== 'function') {
                   throw {
                       name: 'InvalidCommandFunctionError'
                   };
               }
           };
       });