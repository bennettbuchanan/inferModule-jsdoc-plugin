"use strict";

var path = require("path");
var glob = require("glob");
// The following two imports exist when the plugin is loaded in jsdoc.
// Unfortunately, jsdoc does not expose them, generally, so we get an import
// error here even though there's really no problem.
/* eslint-disable import/no-unresolved */
var env = require("jsdoc/env");
var logger = require("jsdoc/util/logger");
/* eslint-enable import/no-unresolved */

/* global process, exports */

var config = env.conf.inferModule || {};
var cache = Object.create(null);
var excludedFiles = [];
var done = Object.create(null);

function isExcluded(fileName) {
  return (excludedFiles.indexOf(fileName) !== -1);
}

function isDone(fileName) {
  return done[fileName];
}

exports.handlers = {
  parseBegin: function parseBegin(e) {
    if (config.schema === undefined) {
      logger.fatal("No 'schema' key is defined in " +
                   "inferModule's configuration.");
    }

    e.sourcefiles.forEach(function fileMap(file) {
      var parsedPath = path.parse(file);
      var relPath = parsedPath.dir.replace(process.cwd() + "/", "");
      relPath = relPath + "/" + parsedPath.base;

      // Set the relative file path in cache for later module naming.
      cache[file] = relPath;

      // If the exclude object is present, test for files to exclude.
      if (config.exclude !== undefined) {
        config.exclude.map(function excludeMap(item) {
          return glob.sync(item).map(function globMap(match) {
            if (relPath === match) {
              excludedFiles.push(match);
            }
            return true;
          });
        });
      }
    });
  },
  jsdocCommentFound: function jsdocCommentFound(e) {
    var currentSourceName = e.filename;

    // Retrieve the relative file path from cache.
    var relPath = cache[currentSourceName];
    if (isExcluded(relPath) || isDone(relPath)) {
      return;
    }

    done[relPath] = true;

    var comment = e.comment;

    // If the JSDoc comment already has a module tag, do not process.
    if (/@module/.test(comment)) {
      return;
    }

    // Loop through config.schema to check if an object in the inferModule
    // array is applicable. If it is, then update relPath to the change.
    for (var i = 0; i < config.schema.length; i++) {
      var re = new RegExp(config.schema[i].from);

      if (relPath !== relPath.replace(re, config.schema[i].to)) {
        relPath = relPath.replace(re, config.schema[i].to);
        break;
      }
    }

    // Parse the path regardless if it has been altered. This is
    // necessary because if a module with the .js extension is added to
    // the file, the output will just be "js".
    var mod = path.parse(relPath);

    var divider = mod.dir !== "" ? "/" : "";
    var moduleName = mod.dir + divider + mod.name;

    // If the comment does not have a module tag, then add one that is
    // the concatenated replacement string and extensionless filename.
    comment = comment.split("\n");

    comment.splice(1, 0, " * @module " + moduleName);
    e.comment = comment.join("\n");
  },
};

exports.astNodeVisitor = {
  visitNode: function find(node, e, parser, currentSourceName) {
    // We use this purely to check that files we do process have a top level
    // comment. If the file is deemed *done*, it means that we have run into a
    // top-level comment already.

    var relPath = cache[currentSourceName];
    if (isExcluded(relPath) || isDone(relPath)) {
      return;
    }

    if (node.comments && node.comments[0] === undefined) {
      logger.fatal("No toplevel comment for JSDoc in " + currentSourceName);
    }
  },
};
