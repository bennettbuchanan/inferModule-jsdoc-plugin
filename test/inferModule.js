var expect = require("chai").expect;
var mockery = require("mockery");

describe("inferModule.visitNode", function() {
    var inferModule;
    var visitNode;
    var node;
    var op_conf;

    beforeEach(function () {
        node = { comments: [ { raw: '' } ] };
        op_conf = {
            "inferModule": {
                "exclude": [],
                "schema": [
                    { "from": "^lib\\/foo\\/(.*)\\.js$", "to": "bar/$1" },
                    { "from": "^lib\\/fin\\/(.*)\\.js$", "to": "baz/$1" },
                    { "from": "^lib\\/(.*\\.js$)", "to": "$1"}
                ]
            }
        };

        // We mock jsdoc/env so that we can run the tests outside jsdoc,
        // and pass arbitrary configuration.
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false,
            warnOnReplace: false,
        });

        mockery.registerMock("jsdoc/env", {
            conf: op_conf
        });
        inferModule = require("../inferModule.js");
        visitNode = inferModule.astNodeVisitor.visitNode;
    });

    afterEach(function () {
        mockery.disable();
    });

    it("Converts the path appropriately for module naming.", function() {
        visitNode(node, {}, {}, 'lib/foo/a.js');
        expect(node.comments[0].raw).to.equal('\n * @module bar/a');
    });

    it("Regiters different mapping.", function() {
        visitNode(node, {}, {}, 'lib/fin/a.js');
        expect(node.comments[0].raw).to.equal('\n * @module baz/a');
    });

    it("Handles a file with no path.", function() {
        visitNode(node, {}, {}, 'lib/a.js');
        expect(node.comments[0].raw).to.equal('\n * @module a');
    });

    it("Does not alter naming of differing extensions.", function() {
        visitNode(node, {}, {}, 'lib/a.py');
        expect(node.comments[0].raw).to.equal('\n * @module lib/a');
    });

    it("Does not process files that match the exclude object.", function() {
        // Note that when testing exlude, the file itself has to actually exist.
        op_conf.inferModule.exclude = ["test/*.js"];
        visitNode(node, {}, {}, 'test/inferModule.js');
        expect(node.comments[0].raw).to.equal('');
    });

    it("If module tag is already present, use it.", function () {
        op_conf.inferModule.exclude = [];
        var originalComment = '**\n * @module this/that';
        node.comments[0].raw = originalComment;
        visitNode(node, {}, {}, 'lib/a.js');
        expect(node.comments[0].raw).to.equal(originalComment);
    });
});
