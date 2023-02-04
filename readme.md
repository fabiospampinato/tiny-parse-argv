# Tiny Parse Argv

A tiny function for parsing `process.argv`, a modern rewrite of a sensible subset of [`minimist`](https://github.com/minimistjs/minimist).

## Features

The following features are provided:

- Built-in TypeScript types, and pretty clean and understandable code.
- Single/multiple implicit/explicit shorthand flags: `-f`, `-f some`, `-f 123`, `-f123`, `-abc`, `-abc 123`, `-abc123`, `-f some -f other`.
- Single/multiple implicit/explicit longhand flags: `--foo`, `--foo some`, `--foo 123`, `--foo=123`, `--foo=some`, `--foo some --foo other`.
- Explicitly negated flags are `false` by default: `--no-foo`, `--no-bar`.
- Arguments: `./app.sh with some list of arguments`.
- Values that would be interpreted as numbers if they were JavaScript are coerced to numbers automatically.
- Flags that could lead to prototype pollution issues are safely ignored.
- `options.boolean`: the value for the listed flags will always be coerced to a boolean.
- `options.string`: the value for the listed flags will always be coerced to a string.
- `options.alias`: if any aliased flag is assigned then all the aliases for it will be assigned too, automatically.
- `options.default`: an object containing default values, which will be used if not overridded by the `argv` array.
- `--`: a special flag that stops parsing, everything after it will be copied, untouched, into the `--` property of the return object.

## Differences with `minimist`

The following differences exist compared to `minimist`:

- `option['--']` set to `false` is not supported, it's as if it's always set to `true`.
- `option.boolean` set to `true` is not supported, you should always explicitly list all your supported boolean flags instead.
- `option.boolean` set to a single string is not supported, always provide an array of flags instead.
- `option.string` set to a single string is not supported, always provide an array of flags instead.
- `option.alias` mapping to a single string is not supported, always provide an array of aliases instead.
- `option.unknown` is not supported, you should handle unknown flags at another level of abstraction.
- `option.stopEarly` is not supported, it's as if it's always set to `false`.
- Dotted flags are not supported, so their paths will not be expanded, you can use [`path-prop`](https://github.com/fabiospampinato/path-prop)'s `unflat` function for that.

Other than that it should work pretty much identically, since we are basically using the same tests.

## Install

```sh
npm install --save tiny-parse-argv
```

## Usage

```ts
import parseArgv from 'tiny-parse-argv';

parseArgv ([ '-f', '--foo', 'some', 'argument', '--', '--app-flag' ]);
// => { f: true, foo: 'some', _: ['argument'], '--': ['--app-flag'] }
```

## License

MIT © Fabio Spampinato
