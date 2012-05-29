// AN 26-12-11 outline view to show method outline, depends on AST from the mode
var parsedResults, sortedFunctions;

define("fireedit/view/outline_view",
    ["require", "exports", "module", "jquery", "jquery.citrus", "pilot/oop", "pilot/event_emitter", "fireedit/view/view", "fireedit/internal/function", "fireedit/internal/function_namer", "fireedit/graph/function_combiner", "fireedit/graph/decorated_node", "fireedit/core/application"],
    function (require, exports, module) {
        var View = require("fireedit/view/view").View;
        var application = require('fireedit/core/application').application;
        var viewDictionary = {};
        var oop = require("pilot/oop");
        var ASTFunction = require("fireedit/internal/function").ASTElement;
        var FunctionNamer = require("fireedit/internal/function_namer").Namer;
        var viewUI;
        var FunctionCombiner = require("fireedit/graph/function_combiner").FunctionCombiner;

        var OutlineView = function (jsMode, viewElement) {
            this.jsMode = jsMode;
            viewUI = viewElement;
            // set it up to listen to the mode
            this.jsMode.on("AST", this.handleAST);
            application.registerView("outline_view", this);
        };

        (function () {
            oop.inherits(this, View);
            var self = this;
            var functionNamer = new FunctionNamer();
            var functionCombiner = new FunctionCombiner();

            /**
             * Sorts the array on basis of lineno property
             */
            var getSortedParseFunctions = function (functionArray) {
                return functionArray.sort(function (first, second) {
                    if (first.lineno > second.lineno) {
                        return 1;
                    } else if (first.lineno < second.lineno) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
            };

            var getTextValue = function (htmlElement) {
                var i = 0;
                var children = htmlElement.childNodes;

                // Iterate through the child nodes of the element
                for (; i < children.length; i++) {
                    // Look for text nodes
                    if (children.item(i).nodeType === children.item(i).TEXT_NODE) {
                        return children.item(i).nodeValue;
                    }
                }
                return null;
            };

            /*
             * TODO: This method should be improved to traverse through the
             * function list and return the starting line number
             * of the current function starts at.
             */
            function getFunctionAtCursor() {
                return application.getCurrentEditor().getSession().getSelection().getCursor().row + 1;
            }

            /**
             * Callback method for handling the AST, callback so watch out for this.
             * delegates to the proper method for actual name determination
             */
            this.handleAST = function (parsedAST) {

                var tmpNode;
                var childCounter = 0;

                //uses this to identify methods present in last view and not in this one
                var tmpMap = [];
                var parsedFunction = 0;
                // parsed functions is a global exposed from narcissus
                var sortedParsedFunctions = getSortedParseFunctions(parsedFunctions);
                var functionASTs = [], i, listHtml = "";

                for (parsedFunction in sortedParsedFunctions) {
                    tmpNode = sortedParsedFunctions[parsedFunction];
                    var functionName = functionNamer.guessName(tmpNode);
                    var functionKey = functionName + "@" + tmpNode.lineno;
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
                    } else {
                        functionASTs.push(fun);
                    }
                }

                // exporting to global variable for ease of debugging
                if (self.dirty) {
                    parsedResults = parsedAST;
                    sortedFunctions = functionCombiner.reorganize(functionASTs);
                    if(!this._outlineTree){
                        this._outlineTree = $("<div>").attr('id', 'function_tree');
                        $(viewUI).html('');
                        $(viewUI).append(this._outlineTree);

                        var outlineTree = $(this._outlineTree);
                        $(outlineTree).citrus({
                            'data': sortedFunctions,
                            'controllerId': 'outline-tree-control',
                            'listId': 'outline-tree'
                        });

                        var selectNode = $('<span>')
                            .addClass('icon-adjust icon-fx')
                            .attr('title', 'Select Node');

                        outlineTree.citrus('addToControls', selectNode, function (event) {
                            outlineTree.citrus('highlightNodeForData', 'lineno', getFunctionAtCursor());
                            return false;
                        }).bind('citrus_node_click', function(e, data){
                            if(!data){
                                return;
                            }
                            var lineNo = $(data.target).data("lineno");
                            if(isNaN(lineNo)){
                                return;
                            }
                            var editor = application.getCurrentEditor();
                            if (lineNo) {
                                editor.gotoLine(parseInt(lineNo) + 1);
                                editor.focus();
                            }
                        });
                    }else{
                        $(this._outlineTree).citrus('refresh', sortedFunctions);
                    }
                    self.dirty = false;
                }
            };

            this.handleNavigation = function (clickEvent) {
                var lineNo = $(clickEvent.target).data("lineno");
                var editor = application.getCurrentEditor();
                if (lineNo) {
                    editor.gotoLine(parseInt(lineNo) + 1);
                    editor.focus();
                }
            };
            this.find = function(functionPattern) {
                var query = 'span.nodeText:actuallyContains("'+functionPattern+'")';
                $("#function_tree").citrus('highlightNode', query);
            };
        }).call(OutlineView.prototype);
        exports.View = OutlineView;
    });

/**
 * Internal Object used only for AST for the view
 */
define("fireedit/internal/function",
    ["require", "exports", "module"],
    function (require, exports, module) {
        var ASTFunction = function (name, lineNo, endToken) {
            this.name = name;
            this.lineNo = lineNo;
            this.internalName = name + "@" + lineNo;
            this.endTokenPosition = endToken;
        };

        (function () {
            var _parentFunction;

            this.updateLine = function (lineNo) {
                if (!(this.lineNo === lineNo)) {
                    this.lineNo = lineNo;
                }
            };

            this.toString = function () {
                return "ASTF : [0] at line [1]".format(this.name, this.lineNo);
            };

            this.setParent = function (parentFunction) {
                _parentFunction = parentFunction;
            };

            this.getParent = function () {
                return _parentFunction;
            };

            this.contains = function (anotherFunction) {
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
    function (require, exports, module) {
        var debug = false;

        var FunctionNamer = function () {

        };

        (function () {
            var getReadableValueFromDotNode = function (node) {
                var readableValue = "", nodeChildren, currentChild, i = 0;

                nodeChildren = node.children;
                //iterate through the children
                for (i = 0; i < nodeChildren.length; i++) {
                    currentChild = nodeChildren[i];
                    // if it is a dot node
                    if (currentChild.type === 35) {
                        readableValue += getReadableValueFromDotNode(currentChild);
                    } else {
                        readableValue += currentChild.value;
                        readableValue += ".";
                    }
                }
                return readableValue;
            }
            // gets the name from the actual expression body, handles "this.parse = function() {}"
            var getNameFromExpression = function (node) {
                var firstChild = node.children[0];
                var firstValue = null, nodeChildren, counter = 0;
                if (firstChild) {
                    if (firstChild.children.length > 1) {
                        // in case first value is not defined the child is in turn a parent of more elements
                        if (firstChild.children[0].type === 35) {
                            firstValue = getReadableValueFromDotNode(firstChild.children[0]);
                        } else {
                            firstValue = firstChild.children[0].value + ".";
                        }
                        return firstValue + firstChild.children[1].value;
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            };

            // gets the name from the actual initialization part  handles "var parse = function() {}"
            var getNameFromIdentifier = function (node) {
                var firstChild = node.children[0];
                if (firstChild) {
                    return firstChild.value;
                } else {
                    return null;
                }

            };

            // gets the name using the parent
            var getNameUsingParent = function (node) {
                var parentNode = node.parentNode;
                var guessedName = null;
                // if parent node is ":" we will just use the first child
                if (parentNode && parentNode.type === 51) {
                    guessedName = parentNode.children[0].value;
                }
                return guessedName;
            };

            /**
             * Main entry point, takes a node and guesses the name for the block
             */
            this.guessName = function (node) {
                var declaringScript = null;
                var currentStmt;
                var stmtIndex = 0;
                var guessedName;
                const GETTER_TYPE = 52;
                const SETTER_TYPE = 53;


                // for non-anonymous function form i.e. DECLARED_FORM the name is in the node
                if (node.functionForm === 0) {
                    guessedName = node.name;
                } else {
                    if (node.type === GETTER_TYPE || node.type === SETTER_TYPE) {
                        return node.name + "$getter";
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
                                    guessedName = getNameFromIdentifier(currentStmt);
                                    break;
                                }
                            }
                        }
                    }
                }
                if (!(guessedName)) {
                    guessedName = getNameUsingParent(node);
                    if (!(guessedName)) {
                        guessedName = "Anony@" + node.lineno;
                    }
                }
                return guessedName;
            }
        }).call(FunctionNamer.prototype);

        exports.Namer = FunctionNamer;
    });
