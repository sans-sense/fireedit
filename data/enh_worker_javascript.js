define("fireedit/lib/enh_worker_javascript",
       ["require", "exports", "module", "pilot/oop", "ace/worker/mirror", "ace/worker/jshint", "ace/narcissus/jsparse"],
       function(require, exports, module) {
           
           var oop = require("pilot/oop");
           var Mirror = require("ace/worker/mirror").Mirror;
           //var lint = require("ace/worker/jslint").JSLINT;
           var lint = require("ace/worker/jshint").JSHINT;
           
           var EnhancedJavaScriptWorker = exports.EnhancedJavaScriptWorker = function(sender) {
               Mirror.call(this, sender);
               this.setTimeout(500);
           };

           oop.inherits(EnhancedJavaScriptWorker, Mirror);

           (function() {
               
               this.onUpdate = function() {
                   var value = this.doc.getValue();
                   value = value.replace(/^#!.*\n/, "\n");
                   
                   var parser = require("ace/narcissus/jsparse");
                   try {
                       parser.parse(value);
                   } catch(e) {
                       var chunks = e.message.split(":")
                       var message = chunks.pop().trim();
                       var lineNumber = parseInt(chunks.pop().trim()) - 1;
                       this.sender.emit("narcissus", {
                           row: lineNumber,
                           column: null, // TODO convert e.cursor
                           text: message,
                           type: "error"
                       });
                       return;
                   }
                   lint(value, {undef: false, onevar: false, passfail: false});
                   this.sender.emit("jslint", lint.errors);        
               }
               
           }).call(EnhancedJavaScriptWorker.prototype);

       });