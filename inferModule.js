var path = require("path");
var glob = require("glob");
var env = require("jsdoc/env");

/* global process, exports */

var config = env.conf.inferModule || {};
var cache = Object.create(null);
var excludedFiles = [];

exports.handlers = {
  parseBegin: function parseBegin(e) {
    "use strict";

    if (config.schema === undefined) {
      throw (new Error("No 'schema' key is defined in " +
                       "inferModule's configuration."));
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
};

exports.astNodeVisitor = {
  visitNode: function find(node, e, parser, currentSourceName) {
    "use strict";

    if (node.comments !== undefined) {
      // Retrieve the relative file path from cache.
      var relPath = cache[currentSourceName];

      // If the file is in the array of files to exclude, do not process.
      if (excludedFiles.indexOf(relPath) !== -1) {
        return;
      }

      // If the comment is non-existant, or a one-line comment (e.g., a
      // `@lends` tag), then create a new comment for the file.
      if (node.comments[0] === undefined) {
        throw (new Error("No toplevel comment for JSDoc in " +
                        currentSourceName));
      }

      // If the JSDoc comment already has a module tag, do not process.
      if (/@module/.test(node.comments[0].raw)) {
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

      // If the comment does not have a module tag, then add one that is
      // the concatenated replacement string and extensionless filename.
      var comment = node.comments[0].raw.split("\n");
      var divider = mod.dir !== "" ? "/" : "";
      var moduleName = mod.dir + divider + mod.name;

      comment.splice(1, 0, " * @module " + moduleName);
      node.comments[0].raw = comment.join("\n");
    }
  },
};
