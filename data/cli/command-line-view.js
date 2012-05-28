
/* command-line-view: Binds to the text field in the UI.  
 * 
 * Notifies 
 * onCommand: when 'enter' is pressed, 
 * onCommandChange: on each character typed.
 * 
 * (This guy knows about jQuery.)
 */
define("fireedit/command-line-view", 
       ["require", "exports", "module"],
       function(require, exports, module) {
           
           var commandLineField;

           var bindTo = function(field) {
               commandLineField = field;
           };

           /* register the function 'fn' to be called on command to execute,
            * i.e. when ENTER key is pressed in the field.
            * The function is called with the command line text. */
           var onCommand = function(fn) {
               commandLineField.keypress(onEnterKey(fn));
           };

           /* register the function 'fn' to be called on command line change.
            * The function is called with the command line text. */
           var onCommandChange = function(fn) {
               commandLineField.keyup(
                   function() { fn(commandLineField.val()); });
           };

           /* clear the text in the command line */
           var clear = function() {
               commandLineField.val('');
           };

           exports.view = {
               bindTo: bindTo,
               onCommand: onCommand,
               onCommandChange: onCommandChange,
               clear: clear
           };

           /* returns a function which calls the given function 'fn' only on
            * ENTER key */
           var onEnterKey = function(fn) {
               return function(e) {
                   var code = (e.keyCode ? e.keyCode : e.which);
                   if(code == 13) {  // ENTER key
                       fn(commandLineField.val());
                   }
               };
           };
           
       });
