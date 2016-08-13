/**
 * @module conversion
 * @desc This module contains utilities used for converting Relax NG files to
 * the format required by salve.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013-2015 Mangalam Research Center for Buddhist Languages
 */
define(/** @lends module:conversion */
  function conversion(require, exports, _module) {
    "use strict";

    var parser = require("./conversion/parser");
    var walker = require("./conversion/walker");

    exports.Element = parser.Element;
    exports.ConversionParser = parser.ConversionParser;
    exports.DefaultConversionWalker = walker.DefaultConversionWalker;
    exports.NameGatherer = walker.NameGatherer;
    exports.Renamer = walker.Renamer;
    exports.DatatypeProcessor = walker.DatatypeProcessor;
  });
