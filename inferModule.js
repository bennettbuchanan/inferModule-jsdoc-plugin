var path = require('path');
var fs = require('fs');
var glob = require("glob");
var env = require("jsdoc/env");

var config = env.conf.inferModule || {};

exports.astNodeVisitor = {
    visitNode: function(node, e, parser, currentSourceName) {
        if (node.comments != undefined) {
            // If the configuration file is empty, do nothing. Otherwise store
            // value in conf.
            if (config.schema == undefined) {
                throw new Error('No "schema" key is defined in ' +
                                'inferModule\'s configuration.');
            }

            // Isolate the path relative to the project's root.
            var parsedPath = path.parse(currentSourceName);
            var relPath = parsedPath.dir.replace(process.cwd() + '/', '');
            relPath = relPath + '/' + parsedPath.base;

            // If the exclude object is present, test for files to exlude.
            if (config.exclude !== undefined) {
                var match_found = false;

                config.exclude.map(function(item) {
                    glob.sync(item).map(function(match) {
                        if (relPath === match) {
                            match_found = true;
                        }
                    });
                });

                // If the relative path is matched by the exlude object, return.
                if (match_found) {
                    return;
                }
            }

            // Call the map method to check if an object in the inferModule
            // array is applicable. If it is, then update relPath to the change.
            config.schema.map(function(item) {
                var re = new RegExp(item.from);

                if (relPath != relPath.replace(re, item.to)) {
                    relPath = relPath.replace(re, item.to);
                }
            });

            // Parse the path regardless if it has been altered. This is
            // necessary because if a module with the .js extension is added to
            // the file, the output will just be "js".
            var mod = path.parse(relPath);

            // If the comment does not have a module tag, then add one that is
            // the concatenated replacement string and extensionless filename.
            var comment = node.comments[0].raw.split('\n');

            if (!/@module/.test(comment[1])) {
                var divider =  mod.dir != '' ? '/' : '';
                var moduleName = mod.dir + divider + mod.name;

                comment.splice(1, 0, ' * @module ' + moduleName);
                node.comments[0].raw = comment.join('\n');
            }
        }
    }
};
