# inferModule.js JSDoc Plugin
 
Using JSDoc's `-c` option, pass the JSDoc conf.json that has the inferModule.js
plugin enabled. If necessary, specify a string to replace the file path with as
module name using `-q` option. If `-q` is not passed, then the module defaults
to the file name (without the file extension).

For example, to have JSDoc interpret `lib/foo/a.js` as the module `baz/a`, use
the following command from `jsdoc_plugin/`: `./node_modules/.bin/jsdoc
lib/foo/a.js -q "baz/" -c ./node_modules/jsdoc/conf.json`. The generated
documentation is in `out/`.

You may have `jsdoc` installed differently. In that case, you will need to
alter the command according to your setup.