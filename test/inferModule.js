var expect = require("chai").expect;
var mockery = require("mockery");
const exec = require('child_process').exec;

/* global it, describe, beforeEach, afterEach */

describe("inferModule.visitNode", function describe() {
  "use strict";

  var inferModule;
  var visitNode;
  var parseBegin;
  var node;
  var opConf;

  beforeEach(function beforeEach() {
    node = { comments: [{ raw: "/**" }] };
    opConf = {
      inferModule: {
        exclude: [],
        schema: [
          { from: "^lib\\/foo\\/(.*)\\.js$", to: "bar/$1" },
          { from: "^lib\\/fin\\/(.*)\\.js$", to: "baz/$1" },
          { from: "^lib\\/(.*\\.js$)", to: "$1" },
        ],
      },
    };

    // We mock jsdoc/env so that we can run the tests outside jsdoc,
    // and pass arbitrary configuration.
    mockery.enable({
      useCleanCache: true,
      warnOnUnregistered: false,
      warnOnReplace: false,
    });

    mockery.registerMock("jsdoc/env", {
      conf: opConf,
    });
    inferModule = require("../inferModule.js");
    visitNode = inferModule.astNodeVisitor.visitNode;
    parseBegin = inferModule.handlers.parseBegin;
  });

  afterEach(function afterEach() {
    mockery.disable();
  });

  it("Converts the path appropriately for module naming.", function it() {
    parseBegin({ sourcefiles: [ 'lib/foo/a.js' ] });
    visitNode(node, {}, {}, "lib/foo/a.js");
    expect(node.comments[0].raw).to.equal("/**\n * @module bar/a");
  });

  it("Regiters different mapping.", function it() {
    parseBegin({ sourcefiles: [ 'lib/fin/a.js' ] });
    visitNode(node, {}, {}, "lib/fin/a.js");
    expect(node.comments[0].raw).to.equal("/**\n * @module baz/a");
  });

  it("Handles a file with no path.", function it() {
    parseBegin({ sourcefiles: [ 'lib/a.js' ] });
    visitNode(node, {}, {}, "lib/a.js");
    expect(node.comments[0].raw).to.equal("/**\n * @module a");
  });

  it("Does not alter naming of differing extensions.", function it() {
    parseBegin({ sourcefiles: [ 'lib/a.py' ] });
    visitNode(node, {}, {}, "lib/a.py");
    expect(node.comments[0].raw).to.equal("/**\n * @module lib/a");
  });

  it("Does not process files that match the exclude object.", function it() {
    // Note that when testing exlude, the file itself has to actually exist.
    opConf.inferModule.exclude = ["test/*.js"];
    parseBegin({ sourcefiles: [ 'test/inferModule.js' ] });
    visitNode(node, {}, {}, "test/inferModule.js");
    expect(node.comments[0].raw).to.equal("/**");
  });

  it("If module tag is already present, use it.", function it() {
    parseBegin({ sourcefiles: [ 'lib/a.js' ] });
    opConf.inferModule.exclude = [];
    var originalComment = "**\n * @module this/that";
    node.comments[0].raw = originalComment;
    visitNode(node, {}, {}, "lib/a.js");
    expect(node.comments[0].raw).to.equal(originalComment);
  });
});

describe("JSDoc Command line test.", function() {
  // Avoid 2000ms timeouts due to JSDoc processesing.
  this.timeout(15000);

  var captured_stdout;

  before(function before(done) {

    // Use command to run JSDoc from the command line to test integration.
    exec("node_modules/.bin/jsdoc test/lib/a.js -c test/conf.json -d test/out ;"
         + " rm -rf test/out/*",
         function execute(error, stdout, stderr) {
           if (error) done(error);
           captured_stdout = stdout;
           done();
         });
  });

  it("Plugin with does not cause JSDoc to throw errors.", function() {
    expect(captured_stdout).to.equal("");
  });
});
