# inferModule.js JSDoc Plugin

Using JSDoc's `-c` option, pass the JSDoc conf.json that has the inferModule.js
plugin enabled. In the `conf.json` file, using the key `inferModule`, specify a
`"schema"` array of regexp replacements that define the objects you would like
module names changed from and to. You may optionally set file paths that the
inferModule plugin should exclude.  The globs patterns that can be handled are
described further [here](https://github.com/isaacs/node-glob#glob-primer). If
no `"exclude"` option is set, the plugin's behavior will not change.

Here is an example basic conf.json to enable the plugin. (JSDoc will otherwise
use default values for any other keys.):
```json
{
    "plugins": ["path/to/inferModule"],
    "inferModule": {
        "exclude": [
            "lib/foo/b.js"
        ],
        "schema": [
            { "from": "^lib\\/foo\\/(.*)\\.js$", "to": "bar/$1" },
            { "from": "...", "to": "..."}
        ]
    }
}
```
If no regexp is matched, then the module defaults to the file path (without the
file extension). Additionally, if the file comment already has a `@module` tag
(the `@module` tag can be located anywhere in the comment), the module name in
the tag takes precedence, even if the file is matched. If the
`inferModule.schema` key is missing from `conf.json`, the plugin does not alter
JSDoc's behavior.

For example, to have JSDoc interpret `lib/foo/a.js` as the module `baz/a` as
specified in the example conf.json above, use the following command from
`jsdoc_plugin/`: `./node_modules/.bin/jsdoc lib/* -c path/to/conf.json`. The
generated documentation based on the `inferModule` key values is in `out/`.

You may have `jsdoc` installed differently. In that case, you will need to alter
the command and paths according to your installation.

## Testing

This plugin uses mocha and chai to handle testing. To run the testing suite,
from `jsdoc_plugin/` run `npm test`.
