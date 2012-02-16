describe("Function Combiner should create a graph with proper nesting", function() {
    var createASTFunctions = function(arrayOfArrays) {
        var infoArray, astFunctions = [], i = 0; 
        for (i = 0; i < arrayOfArrays.length; i++) {
            astFunctions.push(new ASTFunction(i + '', arrayOfArrays[i][0], arrayOfArrays[i][1]));
        }
        return astFunctions;
    };

    var createDecoratedNode = function(lineNo, end) {
        return new DecoratedNode(createASTFunctions([[lineNo, end]])[0]);
    };

    it("decorate nodes with information from functions", function() {
        var functionName = "test", lineNo = 2, end = 50;
        var testASTFunction = new ASTFunction(functionName, lineNo, end);
        var testDecoratedNode = new DecoratedNode(testASTFunction);
        expect(testDecoratedNode._name).toEqual(functionName);
        expect(testDecoratedNode._lineNo).toEqual(lineNo);
        expect(testDecoratedNode._endTokenPosition).toEqual(end);
    });

    it("contains should be true if line no is less and endTokenStream is greater,  ", function() {
        var parentNode = createDecoratedNode(1, 100);
        var childNode = createDecoratedNode(5,20);
        expect(parentNode.contains(childNode)).toEqual(true);
        expect(childNode.contains(parentNode)).toEqual(false);
    });

    it("If the new guy contains me, add him as my parent", function() {
        var parentNode = createDecoratedNode(1, 100);
        var childNode = createDecoratedNode(5,20);
        childNode.process(parentNode);
        expect(parentNode._child).toEqual(childNode);
        expect(childNode._parent).toEqual(parentNode);
    });

    it("If I contain the new guy, add him as my child", function() {
        var parentNode = createDecoratedNode(1, 100);
        var childNode = createDecoratedNode(5,20);
        parentNode.process(childNode);
        expect(parentNode._child).toEqual(childNode);
        expect(childNode._parent).toEqual(parentNode);
    });

    it("the child should always point to the smallest child among siblings", function() {
        var parentNode = createDecoratedNode(1, 100);
        var firstChildNode = createDecoratedNode(5,40);
        var secondChildNode = createDecoratedNode(3,15);
        var thirdChildNode = createDecoratedNode(4,25);
        parentNode.process(firstChildNode);
        parentNode.process(secondChildNode);
        expect(parentNode._child).toEqual(secondChildNode);
        parentNode.process(thirdChildNode);
        expect(parentNode._child).toEqual(secondChildNode);
    });
    
    it("if the new guy is less than me, I should be his next and my parent should be his parent", function() {
        var me = createDecoratedNode(2, 200);
        var myParent = createDecoratedNode(0, 400);
        var newGuy = createDecoratedNode(1, 100);
        me.process(myParent);
        me.process(newGuy);
        expect(newGuy._parent).toEqual(myParent);
        expect(newGuy._next).toEqual(me);
        expect(me._previous).toEqual(newGuy);
    });

    it("If a new node is greater than me, he should go up my breadth and end up as previous to the node greater than him", function() {
        var me = createDecoratedNode(1, 100);
        var myNext = createDecoratedNode(3, 400);
        var newGuy = createDecoratedNode(2, 200);
        me.process(myNext);
        me.process(newGuy);
        expect(newGuy._next).toEqual(myNext);
        expect(me._next).toEqual(newGuy);
        expect(newGuy._previous).toEqual(me);
        expect(myNext._previous).toEqual(newGuy);
    });

    it("if new guy contains my child, he should replace my child and have my child as his child", function() {
        var me = createDecoratedNode(1, 100);
        var myImmediateChild = createDecoratedNode(5, 40);
        var newGuy = createDecoratedNode(2, 50);
        me.process(myImmediateChild);
        me.process(newGuy);
        expect(me._child).toEqual(newGuy);
        expect(newGuy._child).toEqual(myImmediateChild);
    });
    
    it("if new guy contains two of my children but not my third , he should replace both and should contain them as his children and have the third as his sibling", function() {
        var me = createDecoratedNode(1, 100);
        var myFirstChild = createDecoratedNode(5, 40);
        var mySecondChild = createDecoratedNode(3, 30);
        var myThirdChild = createDecoratedNode(8, 90);
        var newGuy = createDecoratedNode(2, 80);
        me.process(myFirstChild).process(mySecondChild).process(myThirdChild);
        me.process(newGuy);
        expect(me._child).toEqual(newGuy);
        expect(newGuy._child).toEqual(mySecondChild);
        expect(newGuy._child).toEqual(mySecondChild);
        expect(newGuy._next).toEqual(myThirdChild);
   });

    it("Reorganizes passed functions with proper parenting", function() {
        var astFunctions = createASTFunctions([[7,32], [5,25], [1,100], [3,50]]), functionCombiner, reorganizedFunctions;
        functionCombiner = new FunctionCombiner();
        reorganizedFunctions = functionCombiner.reorganize(astFunctions);
        expect(reorganizedFunctions[0]._lineNo).toEqual(1);
    });

    it("Reorganizes passed functions with proper parenting with multiple siblings", function() {
        var astFunctions = createASTFunctions([[2,26], [6,87], [9,167]]), functionCombiner, reorganizedFunctions;
        functionCombiner = new FunctionCombiner();
        reorganizedFunctions = functionCombiner.reorganize(astFunctions);
        expect(reorganizedFunctions[0]._lineNo).toEqual(2);
        expect(reorganizedFunctions.length).toEqual(3);
    });

    it("Reorganizes passed functions with proper parenting with nestings", function() {
        var astFunctions = createASTFunctions([[4,1024], [7,470], [10,924], [12, 910]]), functionCombiner, reorganizedFunctions;
        functionCombiner = new FunctionCombiner();
        reorganizedFunctions = functionCombiner.reorganize(astFunctions);
        expect(reorganizedFunctions[0]._lineNo).toEqual(4);
        expect(reorganizedFunctions.length).toEqual(1);
        expect(reorganizedFunctions[0].getChildren().length).toEqual(2);

    });

});