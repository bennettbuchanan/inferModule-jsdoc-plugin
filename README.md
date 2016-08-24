# inferModule.js JSDoc Plugin

Using JSDoc's `-c` option, pass the JSDoc conf.json that has the inferModule.js
plugin enabled. In the `map` array, define the objects you would like module
names change to and from. If no regex is matched, then the module defaults to
the file path (without the file extension).

For example, to have JSDoc interpret `lib/foo/a.js` as the module `baz/a`, use
the following command from `jsdoc_plugin/`: `./node_modules/.bin/jsdoc lib/*/ -c
./node_modules/jsdoc/conf.json`. The generated documentation based on the
mapping defined in `inferModule.js` is in `out/`.

You may have `jsdoc` installed differently. In that case, you will need to alter
the command according to your setup.
