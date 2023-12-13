
/* IMPORT */

import {describe} from 'fava';
import parseArgv from 'tiny-parse-argv';

/* HELPERS */

const parse = ( t, { input, options = {}, output } ) => {
  t.deepEqual ( parseArgv ( input, options ), output );
};

/* MAIN */

// Tests adapted from "minimist": https://github.com/minimistjs/minimist
// License: https://github.com/minimistjs/minimist/blob/main/LICENSE

describe ( 'tiny-parse-argv', it => {

  // native

  it ( 'flags after -- are not modified', t => {

    parse ( t, {
      input: ['--', '-f', '--foo', '123', '--bar=123', '-f123', '-123'],
      output: {
        _: [],
        '--': ['-f', '--foo', '123', '--bar=123', '-f123', '-123']
      }
    });

  });

  it ( 'supports detecting invalid flags', t => {

    t.plan ( 2 );

    parse ( t, {
      input: ['--foo', '--bar', '--no-baz'],
      options: {
        string: ['foo', 'bar', 'baz'],
        onInvalid ( flags ) {
          t.deepEqual ( flags, ['foo', 'bar', 'baz'] );
        }
      },
      output: {
        _: [],
        '--': []
      }
    });

  });

  it ( 'supports detecting missing flags', t => {

    t.plan ( 2 );

    parse ( t, {
      input: ['--foo'],
      options: {
        alias: { f: ['foo'] },
        required: ['foo', 'f', 'bar', 'b', 'baz'],
        default: { baz: false },
        onMissing ( flags ) {
          t.deepEqual ( flags, ['bar', 'b'] );
        }
      },
      output: {
        foo: true,
        f: true,
        baz: false,
        _: [],
        '--': []
      }
    });

  });

  it ( 'supports detecting unknown flags', t => {

    t.plan ( 2 );

    parse ( t, {
      input: ['--foo', '--bar', '--baz', '--qux'],
      options: {
        boolean: ['foo'],
        alias: { f: ['foo'] },
        default: { baz: false },
        onUnknown ( flags ) {
          t.deepEqual ( flags, ['bar', 'qux'] );
        }
      },
      output: {
        foo: true,
        f: true,
        bar: true,
        baz: true,
        qux: true,
        _: [],
        '--': []
      }
    });

  });

  it ( 'supports eager flags', t => {

    parse ( t, {
      input: ['-e', 'foo', 'bar', 'baz', '--eager', 'foo', 'bar', '--regular', 'asd', 'dsa', '--bool', 'b1', 'b2'],
      options: {
        boolean: ['bool'],
        eager: ['e', 'eager', 'bool'],
      },
      output: {
        bool: true,
        e: ['foo', 'bar', 'baz'],
        eager: ['foo', 'bar'],
        regular: 'asd',
        _: ['dsa', 'b1', 'b2'],
        '--': []
      }
    });

  });

  it ( 'supports explicitly variadic flags', t => {

    parse ( t, {
      input: ['--bool', '--str', '--no-foo', '--bar', 'one', '--baz', 'one', '--baz', 'one', '--qux', 'one', 'two'],
      options: {
        boolean: ['bool', 'foo'],
        string: ['str', 'bar', 'baz'],
        eager: ['qux'],
        variadic: ['bool', 'str', 'foo', 'bar', 'baz'],
      },
      output: {
        bool: [true],
        foo: [false],
        bar: ['one'],
        baz: ['one', 'one'],
        qux: ['one', 'two'],
        _: [],
        '--': []
      }
    });

  });

  it ( 'detects string flags with empty value as missing, when they are required', t => { //TODO: Maybe they should just never receive an empty value

    t.plan ( 2 );

    parse ( t, {
      input: ['-s'],
      options: {
        string: ['s'],
        required: ['s'],
        onMissing ( flags ) {
          t.deepEqual ( flags, ['s'] );
        }
      },
      output: {
        _: [],
        '--': []
      }
    });

  });

  // bool: https://github.com/minimistjs/minimist/blob/main/test/bool.js

  it ( 'flag boolean default false', t => {

    parse ( t, {
      input: ['moo'],
      options: {
        boolean: ['t', 'verbose'],
        default: { verbose: false, t: false }
      },
      output: {
        verbose: false,
        t: false,
        _: ['moo'],
        '--': []
      }
    });

  });

  it ( 'boolean groups', t => {

    parse ( t, {
      input: ['-x', '-z', 'one', 'two', 'three'],
      options: {
        boolean: ['x', 'y', 'z'],
      },
      output: {
        x: true,
        y: false,
        z: true,
        _: ['one', 'two', 'three'],
        '--': []
      }
    });

  });

  it ( 'boolean and alias with chainable api', t => {

    parse ( t, {
      input: ['-h', 'derp'],
      options: {
        boolean: ['herp'],
        alias: { h: ['herp'] }
      },
      output: {
        herp: true,
        h: true,
        _: ['derp'],
        '--': []
      }
    });

    parse ( t, {
      input: ['--herp', 'derp'],
      options: {
        boolean: ['herp'],
        alias: { h: ['herp'] },
      },
      output: {
        herp: true,
        h: true,
        _: ['derp'],
        '--': []
      }
    });

  });

  it ( 'boolean and alias with options hash', t => {

    parse ( t, {
      input: ['-h', 'derp'],
      options: {
        alias: { h: ['herp'] },
        boolean: ['herp'],
      },
      output: {
        herp: true,
        h: true,
        _: ['derp'],
        '--': []
      }
    });

    parse ( t, {
      input: ['--herp', 'derp'],
      options: {
        alias: { h: ['herp'] },
        boolean: ['herp'],
      },
      output: {
        herp: true,
        h: true,
        _: ['derp'],
        '--': []
      }
    });

  });

  it ( 'boolean and alias array with options hash', t => {

    parse ( t, {
      input: ['-h', 'derp'],
      options: {
        alias: { h: ['herp', 'harp'] },
        boolean: ['h'],
      },
      output: {
        harp: true,
        herp: true,
        h: true,
        _: ['derp'],
        '--': []
      }
    });

    parse ( t, {
      input: ['--herp', 'derp'],
      options: {
        alias: { h: ['herp', 'harp'] },
        boolean: ['h'],
      },
      output: {
        harp: true,
        herp: true,
        h: true,
        _: ['derp'],
        '--': []
      }
    });

    parse ( t, {
      input: ['--harp', 'derp'],
      options: {
        alias: { h: ['herp', 'harp'] },
        boolean: ['h'],
      },
      output: {
        harp: true,
        herp: true,
        h: true,
        _: ['derp'],
        '--': []
      }
    });

  });

  it ( 'boolean and alias using explicit true', t => {

    parse ( t, {
      input: ['-h', 'true'],
      options: {
        alias: { h: ['herp'] },
        boolean: ['h'],
      },
      output: {
        herp: true,
        h: true,
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['--herp', 'true'],
      options: {
        alias: { h: ['herp'] },
        boolean: ['h'],
      },
      output: {
        herp: true,
        h: true,
        _: [],
        '--': []
      }
    });

  });

  it ( 'boolean and --x=true', t => {

    parse ( t, {
      input: ['--boool', '--other=true'],
      options: {
        boolean: ['boool'],
      },
      output: {
        boool: true,
        other: 'true',
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['--boool', '--other=false'],
      options: {
        boolean: ['boool'],
      },
      output: {
        boool: true,
        other: 'false',
        _: [],
        '--': []
      }
    });

  });

  it ( 'boolean --boool=true', t => {

    parse ( t, {
      input: ['--boool=true'],
      options: {
        default: {
          boool: false,
        },
        boolean: ['boool'],
      },
      output: {
        boool: true,
        _: [],
        '--': []
      }
    });

  });

  it ( 'boolean --boool=false', t => {

    parse ( t, {
      input: ['--boool=false'],
      options: {
        default: {
          boool: true,
        },
        boolean: ['boool'],
      },
      output: {
        boool: false,
        _: [],
        '--': []
      }
    });

  });

  it ( 'boolean using something similar to true', t => {

    parse ( t, {
      input: ['-h', 'true.txt'],
      options: {
        boolean: ['h']
      },
      output: {
        h: true,
        _: ['true.txt'],
        '--': []
      }
    });

  });

  // dash: https://github.com/minimistjs/minimist/blob/main/test/dash.js

  it ( '-', t => {

    parse ( t, {
      input: ['-n', '-'],
      output: {
        n: '-',
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['-'],
      output: {
        _: ['-'],
        '--': []
      }
    });

    parse ( t, {
      input: ['-f-'],
      output: {
        f: '-',
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['-b', '-'],
      options: {
        boolean: ['b'],
      },
      output: {
        b: true,
        _: ['-'],
        '--': []
      }
    });

    parse ( t, {
      input: ['-s', '-'],
      options: {
        string: ['s'],
      },
      output: {
        s: '-',
        _: [],
        '--': []
      }
    });

  });

  it ( '-a -- b', t => {

    parse ( t, {
      input: ['-a', '--', 'b'],
      output: {
        a: true,
        _: [],
        '--': ['b']
      }
    });

    parse ( t, {
      input: ['--a', '--', 'b'],
      output: {
        a: true,
        _: [],
        '--': ['b']
      }
    });

  });

  it ( 'move arguments after the -- into their own `--` array', t => {

    parse ( t, {
      input: ['--name', 'John', 'before', '--', 'after'],
      output: {
        name: 'John',
        _: ['before'],
        '--': ['after']
      }
    });

  });

  // default_bool: https://github.com/minimistjs/minimist/blob/main/test/default_bool.js

  it ( 'boolean default true', t => {

    parse ( t, {
      input: [],
      options: {
        boolean: ['sometrue'],
        default: { sometrue: true },
      },
      output: {
        sometrue: true,
        _: [],
        '--': []
      }
    });

  });

  it ( 'boolean default false', t => {

    parse ( t, {
      input: [],
      options: {
        boolean: ['somefalse'],
        default: { somefalse: false },
      },
      output: {
        somefalse: false,
        _: [],
        '--': []
      }
    });

  });

  it ( 'boolean default to null', t => {

    parse ( t, {
      input: [],
      options: {
        boolean: ['maybe'],
        default: { maybe: null },
      },
      output: {
        maybe: null,
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['--maybe'],
      options: {
        boolean: ['maybe'],
        default: { maybe: null },
      },
      output: {
        maybe: true,
        _: [],
        '--': []
      }
    });

  });

  // kv_short: https://github.com/minimistjs/minimist/blob/main/test/kv_short.js

  it ( 'short -k=v', t => {

    parse ( t, {
      input: ['-b=123'],
      output: {
        b: 123,
        _: [],
        '--': []
      }
    });

  });

  it ( 'multi short -k=v', t => {

    parse ( t, {
      input: ['-a=whatever', '-b=robots'],
      output: {
        a: 'whatever',
        b: 'robots',
        _: [],
        '--': []
      }
    });

  });

  // long: https://github.com/minimistjs/minimist/blob/main/test/long.js

  it ( 'long opts', t => {

    parse ( t, {
      input: ['--bool'],
      output: {
        bool: true,
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['--pow', 'xixxle'],
      output: {
        pow: 'xixxle',
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['--pow=xixxle'],
      output: {
        pow: 'xixxle',
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['--host', 'localhost', '--port', '555'],
      output: {
        host: 'localhost',
        port: 555,
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['--host=localhost', '--port=555'],
      output: {
        host: 'localhost',
        port: 555,
        _: [],
        '--': []
      }
    });

  });

  // num: https://github.com/minimistjs/minimist/blob/main/test/num.js

  it ( 'nums', t => {

    parse ( t, {
      input: [
        '-x', '1234',
        '-y', '5.67',
        '-z', '1e7',
        '-w', '10f',
        '--hex', '0xdeadbeef',
        '789',
      ],
      output: {
        x: 1234,
        y: 5.67,
        z: 1e7,
        w: '10f',
        hex: 0xdeadbeef,
        _: ['789'],
        '--': []
      }
    });

  });

  it ( 'already a number', t => {

    parse ( t, {
      input: ['-x', 1234, 789],
      output: {
        x: 1234,
        _: ['789'],
        '--': []
      }
    });

  });

  // parse: https://github.com/minimistjs/minimist/blob/main/test/parse.js

  it ( 'parse with modifier functions', t => {

    parse ( t, {
      input: ['-b', '123'],
      options: {
        boolean: ['b']
      },
      output: {
        b: true,
        _: ['123'],
        '--': []
      }
    });

  });

  // parse_modified: https://github.com/minimistjs/minimist/blob/main/test/parse_modified.js

  it ( 'parse args', t => {

    parse ( t, {
      input: ['--no-moo'],
      output: {
        moo: false,
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['-v', 'a', '-v', 'b', '-v', 'c'],
      output: {
        v: ['a', 'b', 'c'],
        _: [],
        '--': []
      }
    });

  });

  it ( 'comprehensive', t => {

    parse ( t, {
      input: [
        '--name=meowmers', 'bare', '-cats', 'woo',
        '-h', 'awesome', '--multi=quux',
        '--key', 'value',
        '-b', '--bool', '--no-meep', '--multi=baz',
        '--', '--not-a-flag', 'eek',
      ],
      output: {
        c: true,
        a: true,
        t: true,
        s: 'woo',
        h: 'awesome',
        b: true,
        bool: true,
        key: 'value',
        multi: ['quux', 'baz'],
        meep: false,
        name: 'meowmers',
        _: ['bare'],
        '--': ['--not-a-flag', 'eek']
      }
    });

  });

  it ( 'flag boolean', t => {

    parse ( t, {
      input: ['-t', 'moo'],
      options: {
        boolean: ['t']
      },
      output: {
        t: true,
        _: ['moo'],
        '--': []
      }
    });

  });

  it ( 'flag boolean value', t => {

    parse ( t, {
      input: ['--verbose', 'false', 'moo', '-t', 'true'],
      options: {
        boolean: ['t', 'verbose'],
        default: { verbose: true }
      },
      output: {
        verbose: false,
        t: true,
        _: ['moo'],
        '--': []
      }
    });

  });

  it ( 'newlines in params', t => {

    parse ( t, {
      input: ['-s', 'X\nX'],
      output: {
        s: 'X\nX',
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['--s=X\nX'],
      output: {
        s: 'X\nX',
        _: [],
        '--': []
      }
    });

  });

  it ( 'strings', t => {

    parse ( t, {
      input: ['-s', '0001234'],
      options: {
        string: ['s']
      },
      output: {
        s: '0001234',
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['-x', '56'],
      options: {
        string: ['x']
      },
      output: {
        x: '56',
        _: [],
        '--': []
      }
    });

  });

  it ( 'stringArgs', t => {

    parse ( t, {
      input: ['  ', '  '],
      options: {
        string: ['_']
      },
      output: {
        _: ['  ', '  '],
        '--': []
      }
    });

  });

  it ( 'empty strings', t => {

    parse ( t, {
      input: ['-s'],
      options: {
        string: ['s']
      },
      output: {
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['--str'],
      options: {
        string: ['str']
      },
      output: {
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['-art'],
      options: {
        string: ['a', 't'],
      },
      output: {
        r: true,
        _: [],
        '--': []
      }
    });

  });

  it ( 'string and alias', t => {

    parse ( t, {
      input: ['--str', '000123'],
      options: {
        string: ['s'],
        alias: { s: ['str'] },
      },
      output: {
        str: '000123',
        s: '000123',
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['-s', '000123'],
      options: {
        string: ['str'],
        alias: { str: ['s'] },
      },
      output: {
        str: '000123',
        s: '000123',
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['-s123'],
      options: {
        string: ['str'],
        alias: { str: ['s', 'S'] },
      },
      output: {
        s: '123',
        S: '123',
        str: '123',
        _: [],
        '--': []
      }
    });

  });

  it ( 'slashBreak', t => {

    parse ( t, {
      input: ['-I/foo/bar/baz'],
      output: {
        I: '/foo/bar/baz',
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['-xyz/foo/bar/baz'],
      output: {
        x: true,
        y: true,
        z: '/foo/bar/baz',
        _: [],
        '--': []
      }
    });

  });

  it ( 'alias', t => {

    parse ( t, {
      input: ['-f', '11', '--zoom', '55'],
      options: {
        alias: { z: ['zoom'] }
      },
      output: {
        zoom: 55,
        z: 55,
        f: 11,
        _: [],
        '--': []
      }
    });

  });

  it ( 'multiAlias', t => {

    parse ( t, {
      input: ['-f', '11', '--zoom', '55'],
      options: {
        alias: { z: ['zm', 'zoom'] },
      },
      output: {
        zoom: 55,
        zm: 55,
        z: 55,
        f: 11,
        _: [],
        '--': []
      }
    });

  });

  // proto: https://github.com/minimistjs/minimist/blob/main/test/proto.js

  it ( 'proto pollution', t => {

    parse ( t, {
      input: ['--__proto__', '123', '--no-__proto__', '123', '-__proto__', '123', '-no-__proto__', '123'],
      output: {
        _: [],
        '--': []
      }
    });

  });

  it ( 'prototype pollution', t => {

    parse ( t, {
      input: ['--prototype', '123', '--no-prototype', '123', '-prototype', '123', '-no-prototype', '123'],
      output: {
        _: [],
        '--': []
      }
    });

  });

  it ( 'constructor pollution', t => {

    parse ( t, {
      input: ['--constructor', '123', '--no-constructor', '123', '-constructor', '123', '-no-constructor', '123'],
      output: {
        _: [],
        '--': []
      }
    });

  });

  // short: https://github.com/minimistjs/minimist/blob/main/test/short.js

  it ( 'numeric short args', t => {

    parse ( t, {
      input: ['-n123'],
      output: {
        n: 123,
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['-123', '456'],
      output: {
        1: true,
        2: true,
        3: 456,
        _: [],
        '--': []
      }
    });

  });

  it ( 'short', t => {

    parse ( t, {
      input: ['-b'],
      output: {
        b: true,
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['foo', 'bar', 'baz'],
      output: {
        _: ['foo', 'bar', 'baz'],
        '--': []
      }
    });

    parse ( t, {
      input: ['-cats'],
      output: {
        c: true,
        a: true,
        t: true,
        s: true,
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['-cats', 'meow'],
      output: {
        c: true,
        a: true,
        t: true,
        s: 'meow',
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['-h', 'localhost'],
      output: {
        h: 'localhost',
        _: [],
        '--': []
      }
    });

    parse ( t, {
      input: ['-h', 'localhost', '-p', '555'],
      output: {
        h: 'localhost',
        p: 555,
        _: [],
        '--': []
      }
    });

  });

  it ( 'mixed short bool and capture', t => {

    parse ( t, {
      input: ['-h', 'localhost', '-fp', '555', 'script.js'],
      output: {
        f: true,
        p: 555,
        h: 'localhost',
        _: ['script.js'],
        '--': []
      }
    });

  });

  it ( 'short and long', t => {

    parse ( t, {
      input: ['-h', 'localhost', '-fp', '555', 'script.js'],
      output: {
        f: true,
        p: 555,
        h: 'localhost',
        _: ['script.js'],
        '--': []
      }
    });

  });

  // whitespace: https://github.com/minimistjs/minimist/blob/main/test/whitespace.js

  it ( 'whitespace should be whitespace', t => {

    parse ( t, {
      input: ['-x', '\t'],
      output: {
        x: '\t',
        _: [],
        '--': []
      }
    });

  });

});
