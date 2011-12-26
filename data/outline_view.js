// AN 26-12-11 outline view to show method outline, depends on AST from the mode
define("fireedit/view/outline_view", 
       ["require", "exports", "module", "pilot/oop", "pilot/event_emitter", "fireedit/view/view", "fireedit/internal/function"],
       function(require, exports, module) {
           var View = require("fireedit/view/view").View;
           var viewDictionary = {};
           var oop = require("pilot/oop");
           var ASTFunction = require("fireedit/internal/function").ASTElement;
           var viewUI;

           var OutlineView = function(jsMode, viewElement) {
               this.jsMode = jsMode;
               viewUI = viewElement;
               // set it up to listen to the mode
               this.jsMode.on("AST", this.handleAST);
               viewUI.addEventListener("click", this.handleNavigation, false);
           };
           
           (function() {
               oop.inherits(this, View);
               var self = this;

               var getTextValue = function(htmlElement) {
                   var i = 0;
                   var children = htmlElement.childNodes;

                   // Iterate through the child nodes of the element
                   for( ; i < children.length; i++ ) {
                       // Look for text nodes
                       if( children.item(i).nodeType === children.item(i).TEXT_NODE ) { 
                           return children.item(i).nodeValue;
                       }
                   }
                   return null;
               };

               this.handleAST = function(parsedAST) {
                   var tmpNode;
                   var childCounter = 0;

                   //uses this to identify methods present in last view and not in this one
                   var tmpMap = [];
                   for( ; childCounter < parsedAST.children.length; childCounter++){
                       tmpNode = parsedAST.children[childCounter];
                       if (tmpNode.value  === "function") {
                           var functionName = tmpNode.name;
                           if (viewDictionary[functionName]) {
                               viewDictionary[functionName].updateLine(tmpNode.lineNo);
                           } else {
                               viewDictionary[functionName] = new ASTFunction(functionName, tmpNode.lineno);
                               self.dirty = true;
                           }
                           tmpMap[functionName] = 1;
                       }
                       for each (fun in viewDictionary) {
                           if (!(tmpMap[fun.name])) {
                               delete viewDictionary[fun.name];
                               self.dirty = true;
                           }
                       }
                   }
                   self.repaintView();
               };

               this.repaintView = function() {
                   if (self.dirty) {
                       // TODO we need to reflect the model changes to UI
                       var listHtml = "<ol>";
                       var liHtml = "<li>[0]</li>"
                       var fun;
                       for each (fun in viewDictionary) {
                           listHtml += liHtml.format(fun.name);
                       }
                       listHtml +="</ol>";
                       viewUI.innerHTML = listHtml;
                       self.dirty = false;
                   }
               };
               this.handleNavigation = function(clickEvent) {
                   var functionName = getTextValue(clickEvent.target);
                   var actualFunction;
                   
                   if (functionName) {
                       actualFunction = viewDictionary[functionName];
                       if (actualFunction) {
                           actualFunction.navigateTo();
                       }
                   }
               };

           }).call(OutlineView.prototype);
           exports.View = OutlineView;
       });

/**
 * Intenal Object used only for AST for the view
 */
define("fireedit/internal/function",
       ["require", "exports", "module"],
       function(require, exports, module) {
           var ASTFunction = function(name, lineNo) {
               this.name = name;
               this.lineNo = lineNo;
           };

           (function() {
               this.navigateTo = function() {
                   editor.gotoLine(this.lineNo + 1);
                   editor.focus();
               };
               this.updateLine = function(lineNo) {
                   if (!(this.lineNo === lineNo)) {
                       this.lineNo = lineNo;
                   }
               };
               this.toString = function() {
                   return "ASTF : [0] at line [1]".format(this.name, this.lineNo);
               };
           } ).call(ASTFunction.prototype);

           exports.ASTElement = ASTFunction;
       });
