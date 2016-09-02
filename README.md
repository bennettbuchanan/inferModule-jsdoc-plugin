# inferModule.js JSDoc Plugin

Using JSDoc's `-c` option, pass the JSDoc `conf.json` that has the
`inferModule.js` plugin enabled. In the `conf.json` file, using the key
`inferModule`, specify a `schema` array of
[regexp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Using_special_characters)
replacement objects defining what you would like module names changed from and
to (note that the regexp is a string in the JSON object so some excaping of
characters may be in order). You may optionally set file paths that the
inferModule plugin should exclude by including an `exlude` key. The globs
patterns that can be handled are described further
[here](https://github.com/isaacs/node-glob#glob-primer).

Here is an example basic `conf.json` to enable the plugin:
```json
{
    "plugins": ["path/to/inferModule"],
    "inferModule": {
        "exclude": [
            "lib/foo/b.js",
            "..."
        ],
        "schema": [
            { "from": "^lib\\/foo\\/(.*)\\.js$", "to": "bar/$1" },
            { "from": "...", "to": "..."}
        ]
    }
}
```
If no regexp is matched, then the module defaults to the file path (without the
file extension). Additionally, if the file comment already has a `@module` tag,
the module name in the tag takes precedence, even if the file is matched (the
`@module` tag can be located anywhere in the comment). If the
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
from `inferModule-jsdoc-plugin/` run `npm install`, then `npm test`.
