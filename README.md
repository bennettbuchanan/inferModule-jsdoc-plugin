# inferModule.js JSDoc Plugin

Using JSDoc's `-c` option, pass the JSDoc conf.json that has the inferModule.js
plugin enabled. In the `conf.json` file, using the key `inferModule`, specify an
array of regexp replacements that define the objects you would like module names
changed from and to:
```json
    "inferModule": {
        "exclude": [
            "lib/foo/b.js"
        ],
        "schema": [
            { "from": "^lib\\/foo\\/(.*)\\.js$", "to": "bar/$1" },
            { "from": "...", "to": "..."}
        ]
    }
```
If no regexp is matched, then the module defaults to the file path (without the
file extension). Additionally, if the file comment already has a `@module` tag,
the module name in the tag will take precedence even if the file is matched. The
`@module` tag can be located anywhere in the comment.If the `inferModule.schema`
key is missing from `conf.json`, the plugin does not alter JSDoc's behavior.

For example, to have JSDoc interpret `lib/foo/a.js` as the module `baz/a`, use
the following command from `jsdoc_plugin/`: `./node_modules/.bin/jsdoc lib/*/ -c
./node_modules/jsdoc/conf.json`. The generated documentation based on the
`inferModule` key values is in `out/`.

You may optionally set file paths that the inferModule plugin should exclude.
The globs patterns that can be handled are described further here:
https://github.com/isaacs/node-glob#glob-primer. If no `"exclude"` option is
set, the plugin's behavior will not change.

You may have `jsdoc` installed differently. In that case, you will need to alter
the command according to your setup.

## Testing

This plugin uses mocha and chai to handle testing. To run the testing suite,
from `jsdoc_plugin/` run `npm test`.
