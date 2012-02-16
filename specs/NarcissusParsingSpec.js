describe("Narcissus should parse the supplied text into an AST ", function() {
    it("A list of functions should be generated from the given text", function() {
        var functionASTs = parser.parse("function foo() {}; function bar() {};");
        expect(functionASTs.length).toEqual(2);
    });
    
    it("All Prototypes should be returned as statements", function() {
        var functionASTs = parser.parse("function Foo() {}; Foo.prototype = { getX: function(){}};");
        expect(functionASTs.length).toEqual(2);
    });
});