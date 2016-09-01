var expect    = require("chai").expect;
var inferModule = require("../node_modules/jsdoc/plugins/inferModule.js");
var node = { comments: [ { raw: '' } ] };

describe("Infer Module", function() {
    it("Converts the path appropriately for module naming.", function() {
        expect(inferModule.astNodeVisitor.visitNode(
            node, {}, {}, 'lib/foo/a.js', true)).to.equal('bar/a');
    });

    it("Regiters different mapping.", function() {
        expect(inferModule.astNodeVisitor.visitNode(
            node, {}, {}, 'lib/fin/a.js', true)).to.equal('baz/a');
    });

    it("Handles a file with no path.", function() {
        expect(inferModule.astNodeVisitor.visitNode(
            node, {}, {}, 'lib/a.js', true)).to.equal('a');
    });
});
