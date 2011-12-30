// AN 26-12-11 outline view to show method outline, depends on AST from the mode
var parsedResults;

define("fireedit/view/outline_view", 
       ["require", "exports", "module", "pilot/oop", "pilot/event_emitter", "fireedit/view/view", "fireedit/internal/function", "fireedit/internal/function_namer"],
       function(require, exports, module) {
           var View = require("fireedit/view/view").View;
           var viewDictionary = {};
           var oop = require("pilot/oop");
           var ASTFunction = require("fireedit/internal/function").ASTElement;
           var FunctionNamer = require("fireedit/internal/function_namer").Namer;
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
               var functionNamer = new FunctionNamer();
               
               /**
                 * Sorts the array on basis of lineno property
                 */
               var getSortedParseFunctions = function(functionArray) {
                   return functionArray.sort(function(first, second){
                       if (first.lineno > second.lineno) {
                           return 1;
                       } else if (first.lineno < second.lineno) {
                           return -1;
                       } else {
                           return 0;
                       }
                   });
               };

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

               /**
                 * Callback method for handling the AST, callback so watch out for this.
                 * delegates to the proper method for actual name determination
                 */
               this.handleAST = function(parsedAST) {

                   var tmpNode;
                   var childCounter = 0;

                   //uses this to identify methods present in last view and not in this one
                   var tmpMap = [];
                   var parsedFunction = 0;
                   var sortedParsedFunctions = getSortedParseFunctions(parsedFunctions);

                   // parsed functions is a global exposed from narcissus
                   for (parsedFunction in sortedParsedFunctions) {
                       tmpNode = sortedParsedFunctions[parsedFunction];
                       var functionName = functionNamer.guessName(tmpNode);
                       var functionKey = functionName+"@"+tmpNode.lineno;
                       if (!(viewDictionary[functionKey])) {
                           viewDictionary[functionKey] = new ASTFunction(functionName, tmpNode.lineno, tmpNode.end);
                           self.dirty = true;
                       }
                       tmpMap[functionKey] = 1;
                   }

                   for each (fun in viewDictionary) {
                       if (!(tmpMap[fun.internalName])) {
                           delete viewDictionary[fun.internalName];
                           self.dirty = true;
                       }
                   }
                   
                   // exporting to global variable for ease of debugging
                   if (self.dirty) {
                       parsedResults = parsedAST;
                       self.repaintView();
                       self.dirty = false;
                   };
               };

               this.repaintView = function() {
                       // TODO we need to reflect the model changes to UI
                       var listHtml = "<ul>";
                       var liHtml = "<li class='[0]'>[1]</li>"
                       var fun;
                       for each (fun in viewDictionary) {
                           listHtml += liHtml.format(fun.lineNo, fun.name);
                       }
                       listHtml +="</ul>";
                       viewUI.innerHTML = listHtml;
               };
               this.handleNavigation = function(clickEvent) {
                   var lineNo = clickEvent.target.getAttribute("class");
                   if (lineNo) {
                       editor.gotoLine(parseInt(lineNo) + 1);
                       editor.focus();
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
           var ASTFunction = function(name, lineNo, endToken) {
               this.name = name;
               this.lineNo = lineNo;
               this.internalName = name+"@"+lineNo;
               this.endTokenPosition = endToken;
           };

           (function() {
               var _parentFunction;

               this.updateLine = function(lineNo) {
                   if (!(this.lineNo === lineNo)) {
                       this.lineNo = lineNo;
                   }
               };

               this.toString = function() {
                   return "ASTF : [0] at line [1]".format(this.name, this.lineNo);
               };

               this.setParent = function(parentFunction) {
                   _parentFunction = parentFunction;
               };
               
               this.getParent = function() {
                   return _parentFunction;
               };
               
               this.contains = function(anotherFunction) {
                   return ((anotherFunction.endTokenPosition < this.endTokenPosition) 
                           && (anotherFunction.lineNo > this.lineNo));
               };
           } ).call(ASTFunction.prototype);

           exports.ASTElement = ASTFunction;
       });


/**
 * Helps in determining function names. SInce most functions are actually anonymous, we need to take the initialization and 
 * expression into account to derive the name properly
 */
define("fireedit/internal/function_namer",
       ["require", "exports", "module", "ace/narcissus/jsdefs"],
       function(require, exports, module) {
           var debug = false;

           var FunctionNamer = function() {
               
           };
           
           (function() {

               // gets the name from the actual expression body, handles "this.parse = function() {}"
               var getNameFromExpression = function (node) {
                   var firstChild = node.children[0];
                   if (firstChild) {
                       if (firstChild.children.length > 1) {
                           return firstChild.children[0].value +"." +  firstChild.children[1].value;
                       } else {
                           return null;
                       }
                   } else {
                       return "Failure";
                   }
               };

               // gets the name from the actual initialization part  handles "var parse = function() {}"
               var getNameFromIdentifier = function(node) {
                   var firstChild = node.children[0];
                   if (firstChild) {
                       return firstChild.value;
                   } else {
                       return "Failure";
                   }
                   
               };

               /**
                 * Main entry point, takes a node and guesses the name for the block
                 */
               this.guessName = function(node) {
                   var declaringScript = null;
                   var currentStmt;
                   var stmtIndex = 0;
                   var guessedName;

                   // for non-anonymous function form i.e. DECLARED_FORM the name is in the node
                   if (node.functionForm === 0) {
                       guessedName = node.name;
                   } else {
                       // for anonymous functions i.e STATEMENT_FORM and EXPRESSED_FORM we need to determine the name
                       declaringScript = node.parentBlock;
                       for (stmtIndex in declaringScript.children) {
                           currentStmt = declaringScript.children[stmtIndex];
                           if (currentStmt.lineno === node.lineno) {
                               if (currentStmt.expression) {
                                   guessedName = getNameFromExpression(currentStmt.expression);
                                   break;
                               } else {
                                   guessedName = getNameFromIdentifier(currentStmt);;
                               }
                           }
                       }
                   }
                   if (!(guessedName)) {
                       guessedName = "Anony@"+node.lineno;
                   }
                   return guessedName;
               }
           }).call(FunctionNamer.prototype);

           exports.Namer = FunctionNamer;
       });
