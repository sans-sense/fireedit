// group the functions together, support nesting depending on who is declaring what
define("fireedit/graph/function_combiner", 
       ["require", "exports", "module", "fireedit/internal/function", "fireedit/graph/reordered_graph"],
       function(require, exports, module, functionAST, reorderedGraphProto) {
           const ReorderedGraph = require("fireedit/graph/reordered_graph").Graph;

           var FunctionCombiner = function() {
               
           };
           (function(){
               // reorganizes the funcion ASTS, creating a tree structure
               this.reorganize = function (functionASTs) {
                   var reorderedGraph = new ReorderedGraph(), i;
                   for (i = 0; i < functionASTs.length; i++) {
                       reorderedGraph.addNode(functionASTs[i]);
                   }
                   return reorderedGraph.toArray();
               };
           }).call(FunctionCombiner.prototype);
           exports.FunctionCombiner = FunctionCombiner;
       });

define("fireedit/graph/reordered_graph",
       ["require", "exports", "module", "fireedit/internal/function", "fireedit/graph/decorated_node"],
       function(require, exports, module) {
           const DecoratedNode = require("fireedit/graph/decorated_node").DecoratedNode;

           var ReorderedGraph = function() {
               this._rootNode = new DecoratedNode({endTokenPosition:120000, lineNo:0});
           };

           (function(){
               this.toArray = function() {
                   return this._rootNode.getChildren();
               };
               this.addNode = function(functionAST) {
                   this._rootNode.process(new DecoratedNode(functionAST));
               };
           }).call(ReorderedGraph.prototype);
           exports.Graph = ReorderedGraph;
       });

define("fireedit/graph/decorated_node",
       ["require", "exports", "module", "fireedit/internal/function"],
       function(require, exports, module) {
           var DecoratedNode = function(functionAST) {
               this._name = functionAST.name;
               this._endTokenPosition = functionAST.endTokenPosition;
               this._lineNo = functionAST.lineNo;
               this._next;
               this._previous;
               this._parent;
               this._child;
               // TODO check if holding this reference causes eventual memory leaks
               this.originalFunction = functionAST;
           };

           (function() {
              
               var propagateParenting = function(otherNode, me) {
                   if (otherNode) {
                       if (me._parent.contains(otherNode)) {
                           propagateParenting(otherNode._next, me);
                       } else {
                           otherNode._previous = me._parent;
                           me._parent._next = otherNode;
                       }
                   }
               };
               var addElement = function(element, elements) {
                   if (element) {
                       elements.push(element);
                       if (element._next) {
                           addElement(element._next, elements);
                       }
                   }
               };

               this.process = function(otherNode) {
                   if (this.contains(otherNode)) {
                       this.addAsChild(otherNode);
                   } else if (otherNode.contains(this)) {
                       this.addAsParent(otherNode);
                   } else {
                       this.addAsSibling(otherNode);
                   }
                   return this;
               };
               this.contains = function(otherNode) {
                   // my line number should be less or equal and my endTokenStream greater or equal
                   return ((this._lineNo <= otherNode._lineNo)
                           && (this._endTokenPosition >= otherNode._endTokenPosition));
               };
               this.compareSiblings = function(otherNode) {
                   if (this._lineNo > otherNode._lineNo ) {
                       return 1;
                   } else if (this._lineNo == otherNode._lineNo) {
                       if (this._endTokenPosition > otherNode._endTokenPosition) {
                           return 1;
                       } else if (this._endTokenPosition === otherNode._endTokenPosition) {
                           return 0;
                       } else {
                           return -1;
                       }
                   } else {
                       return -1;
                   }
               };
               this.addAsSibling = function(otherNode) {
                   var compareValue = this.compareSiblings(otherNode);
                   if (compareValue === 0) {
                       // we are equal, so lets make him my next
                       this.insertNext(otherNode);
                   } else if (compareValue === 1) {
                       // i am greater than the new guy, so add him as my previous, changing the parenting also if needed
                       this.insertPrevious(otherNode);
                   } else {
                       // new guy greater than me, so let him go on my breadth chain
                       if (this._next) {
                           this._next.process(otherNode);
                       } else {
                           this.insertNext(otherNode);
                       }
                   }
               };
               this.getChildren = function() {
                   var children = [];
                   if (this._child) {
                       addElement(this._child, children);
                   }
                   return children;
               };
               this.addAsParent = function(otherNode) {
                   // transfer parent relationship from both the concerned nodes
                   if (this._parent) {
                       otherNode.setParent(this._parent);
                   }
                   this.setParent(otherNode);
                   propagateParenting(this._next, this);
               };
               this.addAsChild = function(otherNode) {
                   if (this._child) {
                       this._child.process(otherNode);
                   } else {
                       otherNode.setParent(this);
                   }
               };
               this.setParent = function(otherNode) {
                   otherNode._child = this;
                   this._parent = otherNode;
               };
               this.insertNext = function(otherNode) {
                   if (this._next) {
                       this._next.previous = otherNode;
                       this.otherNode._next = this._next;
                   }
                   this._next = otherNode;
                   otherNode._previous = this;
               };
               this.insertPrevious = function(otherNode) {
                   if (this._previous) {
                       this._previous._next = otherNode;
                       otherNode._previous = this._previous;
                   }
                   this._previous = otherNode;
                   otherNode._next = this;
                   if (this._parent) {
                       // only the lowest value should hold a reference to parent
                       otherNode.setParent(this._parent);
                       this._parent = null;
                   }
               };
               this.toString = function() {
                   return "[0]@[1] with end @ [2]".format([this._name, this._lineNo, this._endTokenPosition]);
               }
           } ).call(DecoratedNode.prototype);
           exports.DecoratedNode = DecoratedNode;
       });
