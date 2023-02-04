
/* IMPORT */

import {isBoolean, isOverridable, set, uniq, without, zip} from './utils';
import type {Options, ParsedArgs} from './types';

/* HELPERS */

const getAliasesMap = ( aliases: Record<string, string[]> = {} ): Partial<Record<string, string[]>> => {

  const map: Partial<Record<string, string[]>> = {};

  for ( const key in aliases ) {

    const values = uniq ([ key, ...aliases[key] ]);

    for ( const value of values ) {

      if ( value in map ) continue;

      map[value] = without ( values, value );

    }

  }

  return map;

};

const getAliasedSet = ( aliases: Partial<Record<string, string[]>>, values: string[] = [] ): Set<string> => {

  const valuesAliases = values.flatMap ( value => aliases[value] || [] );
  const valuesAliased = new Set ([ ...values, ...valuesAliases ]);

  return valuesAliased;

};

const setAliased = ( target: any, key: string, value: any, aliases: Partial<Record<string, string[]>> ): void => {

  set ( target, key, value );

  aliases[key]?.forEach ( alias => {

    set ( target, alias, value );

  });

};

const parseDoubleHyphen = ( argv: string[] ): [parse: string[], preserve: string[]] => {

  const index = argv.indexOf ( '--' );

  if ( index < 0 ) return [argv, []];

  const parse = argv.slice ( 0, index );
  const preserve = argv.slice ( index + 1 );

  return [parse, preserve];

};

const parseWithRegExp = ( argv: string[], re: RegExp, callback: ( ...args: string[] ) => string[] ): string[] => {

  return argv.flatMap ( arg => {

    const match = re.exec ( arg );

    if ( !match ) return arg;

    return callback ( ...match );

  });

};

const parseCharSeparator = ( argv: string[] ): string[] => {

  const re = /^-([a-zA-Z0-9]{2,})([^]*)$/;

  return parseWithRegExp ( argv, re, ( _, chars ) => chars.split ( '' ).map ( char => `-${char}` ) );

};

const parseEqualsSeparator = ( argv: string[] ): string[] => {

  const re = /^(--?[^=][^=]*?)=([^]*)$/;

  return parseWithRegExp ( argv, re, ( _, key, value ) => [key, value] );

};

const parseImplicitSeparator = ( argv: string[] ): string[] => {

  const re = /^(--?(?:no-)?\S*?[a-zA-Z]\S*?)((?:[0-9\/]|-(?=$))[^]*)$/;

  return parseWithRegExp ( argv, re, ( _, key, value ) => [key, value] );

};

const parseProto = ( argv: string[] ): string[] => {

  const re = /^--?(no-)?(__proto__|prototype|constructor)$/;

  return argv.filter ( ( arg, index ) => !re.test ( arg ) && !re.test ( argv[index - 1] ) );

};

const parseOption = ( arg: string ): string | undefined => {

  const optionRe = /^(--?)([^]+)$/;
  const match = optionRe.exec ( arg );

  if ( !match ) return;

  return match[2];

};

const parseOptionNegation = ( arg: string ): [key: string, positive: boolean] => {

  const negationRe = /^no-([^]+)$/;
  const match = negationRe.exec ( arg );

  if ( !match ) return [arg, true];

  return [match[1], false];

};

const parseValue = ( key: string, value: string, booleans: Set<string>, strings: Set<string> ): string | number | boolean => {

  if ( booleans.has ( key ) ) {

    if ( value === 'true' ) return true;

    if ( value === 'false' ) return false;

  }

  if ( !strings.has ( key ) ) {

    const numberRe = /^0[xX][0-9a-fA-F]+$|^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][-+]?\d+)?$/;

    if ( numberRe.test ( value ) ) {

      return Number ( value );

    }

  }

  return String ( value );

};

/* MAIN */

const parseArgv = ( argv: string[], options: Options = {} ): ParsedArgs => {

  const aliases = getAliasesMap ( options.alias );
  const booleans = getAliasedSet ( aliases, options.boolean );
  const strings = getAliasedSet ( aliases, options.string );
  const defaults = options.default || {};

  const [parse, preserve] = parseDoubleHyphen ( argv );
  const parsed: ParsedArgs = { _: [], '--': preserve };
  const args = parseCharSeparator ( parseImplicitSeparator ( parseEqualsSeparator ( parseProto ( parse ) ) ) );

  let optionPrev: string = '';

  for ( let i = 0, l = args.length; i < l; i++ ) {

    const arg = args[i];
    const option = parseOption ( arg );

    if ( option ) { // Option

      const [key, positive] = parseOptionNegation ( option );

      if ( isOverridable ( parsed[key] ) ) { // Maybe we are setting this option multiple times

        const value = ( strings.has ( key ) ? '' : positive );

        setAliased ( parsed, key, value, aliases );

      }

      optionPrev = option;

    } else { // Value or Argument

      const value = parseValue ( optionPrev, arg, booleans, strings );

      if ( optionPrev && ( !booleans.has ( optionPrev ) || isBoolean ( value ) ) ) { // Value

        setAliased ( parsed, optionPrev, value, aliases );

      } else { // Argument

        parsed._.push ( String ( value ) );

      }

      optionPrev = '';

    }

  }

  return { ...zip ( booleans, false ), ...defaults, ...parsed };

};

/* EXPORT */

export default parseArgv;
