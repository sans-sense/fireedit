define("fireedit/mode/enh_javascript", 
       ["require", "exports", "module", "pilot/oop", "pilot/event_emitter", "ace/mode/javascript", "ace/mode/behaviour/cstyle", "ace/mode/javascript_highlight_rule", "ace/mode/matching_brace_outdent", "ace/narcissus/jsparse"], 
function(require, exports, module) {
    var oop = require("pilot/oop");
    var JavaScriptMode = require("ace/mode/javascript").Mode;
    var Tokenizer = require("ace/tokenizer").Tokenizer;
    var JavaScriptHighlightRules = require("ace/mode/javascript_highlight_rules").JavaScriptHighlightRules;
    var MatchingBraceOutdent = require("ace/mode/matching_brace_outdent").MatchingBraceOutdent;
    var CstyleBehaviour = require("ace/mode/behaviour/cstyle").CstyleBehaviour;
    var EventEmitter = require("pilot/event_emitter").EventEmitter;

    var EnhancedJSMode = function() {
        this.$tokenizer = new Tokenizer(new JavaScriptHighlightRules().getRules());
        this.$outdent = new MatchingBraceOutdent();
        this.$behaviour = new CstyleBehaviour();
    };
    oop.inherits(EnhancedJSMode, JavaScriptMode);

    // define the new worker functionality to return something parsed
    (function() {
        var jsParser = require("ace/narcissus/jsparse");
    
        //our mode actually is a event source
        oop.implement(this, EventEmitter);

        this.enhanceWorker = function(editSession) {
            var doc = editSession.getDocument();
            var self = this;
            var changeListener = function(event) {
                var value = doc.getValue();
                self.emitAST(value);
            };
            doc.on("change", changeListener);
        };

        this.emitAST = function (value) {
            if (jsParser) {
                try{
                    value = value.replace(/^#!.*\n/, "\n");
                    var parsedResults = jsParser.parse(value);
                    this._dispatchEvent("AST", parsedResults);
                }catch(error) {
                    // nothing much doing parsing failed, not end of world
                }
            }
        };

    }).call(EnhancedJSMode.prototype);

    exports.Mode = EnhancedJSMode;
});

