"use strict";
var expect = require("chai").expect;
var mockery = require("mockery");
var exec = require("child_process").exec;

/* global it, describe, beforeEach, afterEach */

describe("inferModule.visitNode", function describe() {
  var inferModule;
  var parseBegin;
  var jsdocCommentFound;
  var opConf;

  beforeEach(function beforeEach() {
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
      error: function error() {
        throw new Error("error called on mocked logger");
      },
      fatal: function fatal() {
        throw new Error("fatal called on mocked logger");
      },
      warn: function warn() {
        throw new Error("warn called on mocked logger");
      },
    });

    // eslint-disable-next-line global-require
    inferModule = require("../inferModule.js");
    parseBegin = inferModule.handlers.parseBegin;
    jsdocCommentFound = inferModule.handlers.jsdocCommentFound;
  });

  afterEach(function afterEach() {
    mockery.disable();
  });

  function test(source, comment) {
    comment = comment || "/**\n*/";
    parseBegin({ sourcefiles: [source] });
    var e = {
      filename: source,
      comment: comment,
    };

    jsdocCommentFound(e);
    return e.comment;
  }

  it("Converts the path appropriately for module naming.", function it() {
    expect(test("lib/foo/a.js")).to.equal("/**\n * @module bar/a\n*/");
  });

  it("Registers different mapping.", function it() {
    expect(test("lib/fin/a.js")).to.equal("/**\n * @module baz/a\n*/");
  });

  it("Handles a file with no path.", function it() {
    expect(test("lib/a.js")).to.equal("/**\n * @module a\n*/");
  });

  it("Does not alter naming of differing extensions.", function it() {
    expect(test("lib/a.py")).to.equal("/**\n * @module lib/a\n*/");
  });

  it("Does not process files that match the exclude object.", function it() {
    // Note that when testing exlude, the file itself has to actually exist.
    opConf.inferModule.exclude = ["test/*.js"];
    expect(test("test/inferModule.js")).to.equal("/**\n*/");
  });

  it("If module tag is already present, use it.", function it() {
    var originalComment = "**\n * @module this/that";
    expect(test("lib/a.js", originalComment)).to.equal(originalComment);
  });


  it("The schema array applies only once to a file", function it() {
    opConf.inferModule.schema = [
      { from: "lib/a.js", to: "lib/b" },
      { from: "lib/b", to: "lib/c" },
    ];

    expect(test("lib/a.js")).to.equal("/**\n * @module lib/b\n*/");
  });
});

describe("JSDoc Command line test.", function describe() {
  // Avoid 2000ms timeouts due to JSDoc processesing.
  this.timeout(15000);

  afterEach(function afterEach(done) {
    exec("rm -rf test/out/*", done);
  });

  function execJSDoc(args, cb) {
    exec("node_modules/.bin/jsdoc -X -c test/conf.json -d test/out " + args, cb);
  }

  function extractModules(output) {
    var doclets = JSON.parse(output);
    var ret = [];
    for (var docletIx = 0; docletIx < doclets.length; ++docletIx) {
      var doclet = doclets[docletIx];
      if (doclet.kind === "module") {
        ret.push(doclet.name);
      }
    }
    return ret;
  }

  it("Handles an AMD module fine.", function it(done) {
    execJSDoc("test/lib/a.js", function execute(error, stdout) {
      if (error) {
        done(error);
        return;
      }
      expect(extractModules(stdout)).to.deep.equal(["a"]);
      done();
    });
  });

  it("Handles a CommonJS module fine.", function it(done) {
    execJSDoc("test/lib/CommonJS.js", function execute(error, stdout) {
      if (error) {
        done(error);
        return;
      }
      expect(extractModules(stdout)).to.deep.equal(["CommonJS"]);
      done();
    });
  });

  it("Error when a document has no top level comment", function it(done) {
    execJSDoc("test/lib/noComment.js", function execute(error) {
      if (error) {
        expect(error.toString()).to
          .include("FATAL: No toplevel comment for JSDoc");
        done();
        return;
      }
      done(new Error("did not get an error!"));
    });
  });
});
