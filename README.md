# inferModule.js JSDoc Plugin

No more `@module` tags in your JSDoc comments. Just define module names using
regular expressions in your configuration file and generate your JSDoc
documentation.

Using JSDoc's `-c` option, pass the JSDoc confiuration file that has the
`inferModule.js` plugin enabled. In the configuration file, using the key
`inferModule`, specify a `schema` array of
[regexp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Using_special_characters)
replacement objects defining what you would like module names changed from and
to (note that the regexp is a string in the JSON object, so some escaping of
characters may be in order). You may optionally set file paths that the
inferModule plugin should exclude by including an `exclude` key. The glob
patterns that can be handled are described
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
JSDoc's behavior. Each file must contain a toplevel comment in the simplest
form.

For example, to have JSDoc interpret `lib/foo/a.js` as the module `baz/a` as
specified in the example conf.json above, use the following command from
`jsdoc_plugin/`: `./node_modules/.bin/jsdoc lib/* -c path/to/conf.json`. The
generated documentation based on `inferModule` schema array objects is in
`out/`.

You may have `jsdoc` installed differently. In that case, you will need to alter
the command and paths according to your installation.

## Testing

This plugin uses mocha and chai to handle testing. To run the testing suite,
from `inferModule-jsdoc-plugin/` run `npm install`, then `npm test`.
