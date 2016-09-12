var path = require("path");
var glob = require("glob");
var env = require("jsdoc/env");

/* global process, exports */

var config = env.conf.inferModule || {};

exports.astNodeVisitor = {
  visitNode: function find(node, e, parser, currentSourceName) {
    "use strict";

    if (node.comments !== undefined) {
      // If the configuration file is empty, do nothing. Otherwise store
      // value in conf.
      if (config.schema === undefined) {
        throw new Error("No 'schema' key is defined in " +
                        "inferModule's configuration.");
      }

      // Isolate the path relative to the project's root.
      var parsedPath = path.parse(currentSourceName);
      var relPath = parsedPath.dir.replace(process.cwd() + "/", "");
      relPath = relPath + "/" + parsedPath.base;

      // If the exclude object is present, test for files to exclude.
      if (config.exclude !== undefined) {
        var matchFound = false;

        config.exclude.map(function excludeMap(item) {
          return glob.sync(item).map(function globMap(match) {
            if (relPath === match) {
              matchFound = true;
            }
            return matchFound;
          });
        });

        // If the relative path is matched by the exclude object,
        // return.
        if (matchFound) {
          return;
        }
      }

      // Call the map method to check if an object in the inferModule
      // array is applicable. If it is, then update relPath to the change.
      config.schema.map(function schemaMap(item) {
        var re = new RegExp(item.from);

        if (relPath !== relPath.replace(re, item.to)) {
          relPath = relPath.replace(re, item.to);
        }
        return relPath;
      });

      // Parse the path regardless if it has been altered. This is
      // necessary because if a module with the .js extension is added to
      // the file, the output will just be "js".
      var mod = path.parse(relPath);

      // If the comment does not have a module tag, then add one that is
      // the concatenated replacement string and extensionless filename.
      var comment = node.comments[0].raw.split("\n");

      if (!/@module/.test(comment[1])) {
        var divider = mod.dir !== "" ? "/" : "";
        var moduleName = mod.dir + divider + mod.name;

        comment.splice(1, 0, " * @module " + moduleName);
        node.comments[0].raw = comment.join("\n");
      }
    }
  },
};
