define("fireedit/view/view", 
       ["require", "exports", "module", "pilot/oop", "pilot/event_emitter"],
       function(require, exports, module) {
           var View = function() {
               this.dirty = true;
               this.viewModel = {};
           };

           (function(){
               this.isDirty = function() {
                   return this.dirty;
               };

               this.markAsDirty = function() {
                   this.dirty = true;
               };

           }).call(View.prototype);
           exports.View = View;
       });
