var assert = require("chai").assert;
var expect = require("chai").expect;
var inferModule = require("../inferModule.js");
var visitNode = inferModule.astNodeVisitor.visitNode;

var node = { comments: [ { raw: '' } ] };
var op_conf = {
    "inferModule": {
        "exclude": [],
        "schema": [
            { "from": "^lib\\/foo\\/(.*)\\.js$", "to": "bar/$1" },
            { "from": "^lib\\/fin\\/(.*)\\.js$", "to": "baz/$1" },
            { "from": "^lib\\/(.*\\.js$)", "to": "$1"}
        ]
    }
}

describe("Infer Module", function() {
    it("Converts the path appropriately for module naming.", function() {
        expect(visitNode(node, {}, {}, 'lib/foo/a.js', op_conf)).to.equal('bar/a');
    });

    it("Regiters different mapping.", function() {
        expect(visitNode(node, {}, {}, 'lib/fin/a.js', op_conf)).to.equal('baz/a');
    });

    it("Handles a file with no path.", function() {
        expect(visitNode(node, {}, {}, 'lib/a.js', op_conf)).to.equal('a');
    });

    it("Does not alter naming of differing extensions.", function() {
        expect(visitNode(node, {}, {}, 'lib/a.py', op_conf)).to.equal('lib/a');
    });

    it("Does not process files that match the exclude object.", function() {
        op_conf.inferModule.exclude = ["lib/foo/*.js"];
        expect(visitNode(node, {}, {}, 'lib/foo/a.js', op_conf)).to.equal(undefined);
    });

    it("If module tag is already present, use it.", function () {
        op_conf.inferModule.exclude = [];
        node = { comments: [ { raw: '**\n * @module this/that' } ] };

        expect(visitNode(node, {}, {}, 'lib/a.js', op_conf)).to.equal(undefined);
    });
});
