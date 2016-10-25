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

    // When we run the plugin directly here, this module does not exist. It does
    // exist when jsdoc loads the plugin.
    mockery.registerMock("jsdoc/util/logger", {
      error: function () {
        throw new Error("error called on mocked logger");
      },
      fatal: function () {
        throw new Error("fatal called on mocked logger");
      },
      warn: function () {
        throw new Error("warn called on mocked logger");
      }
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


  it("If a file is renamed and then matched again, the additional renaming " +
     "is disregarded.", function it() {
       opConf.inferModule.schema =
         [
           { "from": "lib/a.js", "to": "lib/b" },
           { "from": "lib/b", "to": "lib/c" }
         ];

       parseBegin({ sourcefiles: [ 'lib/a.js' ] });
       visitNode(node, {}, {}, "lib/a.js");
       expect(node.comments[0].raw).to.equal("/**\n * @module lib/b");
     });
});

describe("JSDoc Command line test.", function() {
  // Avoid 2000ms timeouts due to JSDoc processesing.
  this.timeout(15000);

  afterEach(function afterEach(done) {
    exec("rm -rf test/out/*", done);
  });

  function execJSDoc(args, cb) {
    exec("node_modules/.bin/jsdoc -c test/conf.json -d test/out " + args, cb);
  }

  it("Plugin with does not cause JSDoc to throw errors.", function(done) {
    execJSDoc("test/lib/a.js", function execute(error, stdout, stderr) {
      if (error) done(error);
      expect(stdout).to.equal("");
      done();
    });
  });

  it("An error is raised when a document has no top level comment",
     function(done) {
    execJSDoc("test/lib/noComment.js", function execute(error, stdout, stderr) {
      if (error) {
        expect(error.toString()).to
          .include("FATAL: No toplevel comment for JSDoc");
        return done();
      }
      return done(new Error("did not get an error!"));
    });
  });
});
