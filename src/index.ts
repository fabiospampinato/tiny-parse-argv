
/* IMPORT */

import {isBoolean, isOverridable, setNormal, setVariadic, uniq, uniqBy, without, zip} from './utils';
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

const getAliasedDefaults = ( aliases: Partial<Record<string, string[]>>, defaults: Partial<Record<string, any>> = {} ): Partial<Record<string, any>> => {

  const defaultsAliased: Partial<Record<string, any>> = {};

  for ( const key in defaults ) {

    const value = defaults[key];
    const keys = uniq ([ key, ...( aliases[key] || [] ) ]);

    for ( const key of keys ) {

      if ( key in defaultsAliased ) continue;

      defaultsAliased[key] = value;

    }

  }

  return defaultsAliased;

};

const getAliasedIncompatibles = ( aliases: Partial<Record<string, string[]>>, incompatibles: Partial<Record<string, string[]>> = {} ): Partial<Record<string, Set<string>>> => {

  const incompatiblesAliased: Partial<Record<string, Set<string>>> = {};

  for ( const source in incompatibles ) {

    const sources = getAliasedSet ( aliases, [source] );
    const targets = getAliasedSet ( aliases, incompatibles[source] );

    for ( const source of sources ) {

      for ( const target of targets ) {

        const sourceSet = ( incompatiblesAliased[source] ||= new Set () );
        const targetSet = ( incompatiblesAliased[target] ||= new Set () );

        sourceSet.add ( target );
        targetSet.add ( source );

      }

    }

  }

  return incompatiblesAliased;

};

const setAliased = ( target: any, key: string, value: any, variadic: boolean, aliases: Partial<Record<string, string[]>> ): void => {

  const set = variadic ? setVariadic : setNormal;

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

  const re = /^-([a-zA-Z0-9\.]{2,})([^]*)$/;

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

const parseValue = ( key: string, value: string, booleans: Set<string>, integers: Set<string>, numbers: Set<string>, strings: Set<string> ): string | number | boolean | null => {

  if ( booleans.has ( key ) ) {

    if ( value === 'true' ) return true;

    if ( value === 'false' ) return false;

  }

  if ( integers.has ( key ) ) {

    const integer = Number ( value );

    if ( Number.isInteger ( integer ) ) return integer;

    return null;

  }

  if ( numbers.has ( key ) ) {

    const number = Number ( value );

    if ( !Number.isNaN ( number ) ) return number;

    return null;

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
  const integers = getAliasedSet ( aliases, options.integer );
  const numbers = getAliasedSet ( aliases, options.number );
  const strings = getAliasedSet ( aliases, options.string );
  const eagers = getAliasedSet ( aliases, options.eager );
  const variadics = getAliasedSet ( aliases, options.variadic );
  const defaults = getAliasedDefaults ( aliases, options.default );
  const incompatibles = getAliasedIncompatibles ( aliases, options.incompatible );
  const required = options.required || [];
  const known = new Set ([ ...booleans, ...integers, ...numbers, ...strings, ...Object.keys ( defaults ) ]);
  const found: string[] = [];
  const onIncompatible = options.onIncompatible;
  const onInvalid = options.onInvalid;
  const onMissing = options.onMissing;
  const onUnknown = options.onUnknown;

  const [parse, preserve] = parseDoubleHyphen ( argv );
  const parsed: ParsedArgs = { _: [], '--': preserve };
  const args = parseCharSeparator ( parseImplicitSeparator ( parseEqualsSeparator ( parseProto ( parse ) ) ) );

  let optionPrev: string = '';
  let optionEagerPrev: string = '';

  for ( let i = 0, l = args.length; i < l; i++ ) {

    const arg = args[i];
    const option = parseOption ( arg );

    if ( option ) { // Option

      const [key, positive] = parseOptionNegation ( option );

      if ( isOverridable ( parsed[key] ) ) { // Maybe we are setting this option multiple times

        if ( !integers.has ( key ) && !numbers.has ( key ) && !strings.has ( key ) ) { // String options shouldn't have an inferred value

          const variadic = variadics.has ( key );
          const value = variadic ? [positive] : positive;

          setAliased ( parsed, key, value, variadic, aliases );

        }

      }

      found.push ( key );

      optionPrev = option;
      optionEagerPrev = eagers.has ( key ) ? option : '';

    } else { // Value or Argument

      const value = parseValue ( optionPrev, arg, booleans, integers, numbers, strings );

      if ( optionPrev && ( !booleans.has ( optionPrev ) || isBoolean ( value ) ) ) { // Regular value

        if ( value !== null ) {

          const variadic = variadics.has ( optionPrev );

          setAliased ( parsed, optionPrev, value, variadic, aliases );

        }

      } else if ( optionEagerPrev && !booleans.has ( optionEagerPrev ) ) { // Eager value

        if ( value !== null ) {

          const variadic = variadics.has ( optionEagerPrev );

          setAliased ( parsed, optionEagerPrev, value, variadic, aliases );

        }

      } else { // Argument

        parsed._.push ( String ( value ?? arg ) );

        optionEagerPrev = '';

      }

      optionPrev = '';

    }

  }

  const parsedWithDefaults: ParsedArgs = { ...defaults, ...parsed };
  const parsedWithDefaultsAndBooleans: ParsedArgs = { ...zip ( booleans, false ), ...parsedWithDefaults };

  if ( onUnknown ) {

    const unknowns = Object.keys ( parsedWithDefaults ).filter ( key => key !== '_' && key !== '--' && !known.has ( key ) );

    if ( unknowns.length ) {

      onUnknown ( unknowns );

    }

  }

  if ( onMissing ) {

    const missings = required.filter ( key => !( key in parsedWithDefaults ) );

    if ( missings.length ) {

      onMissing ( missings );

    }

  }

  if ( onInvalid ) {

    const invalids = found.filter ( key => parsedWithDefaults[key] === undefined );

    if ( invalids.length ) {

      onInvalid ( invalids );

    }

  }

  if ( onIncompatible ) {

    const options = uniq ( found );
    const pairs: [string, string][] = [];

    for ( let si = 0, sl = options.length; si < sl; si++ ) {

      const source = options[si];
      const sourceIncompatibles = incompatibles[source];

      if ( !sourceIncompatibles ) continue;

      for ( let ti = si + 1, tl = sl; ti < tl; ti++ ) {

        const target = options[ti];

        if ( !sourceIncompatibles.has ( target ) ) continue;

        pairs.push ([ source, target ]);

      }

    }

    if ( pairs.length ) {

      const pairsUnique = uniqBy ( pairs, pair => [...pair].sort ().join () );

      onIncompatible ( pairsUnique );

    }

  }

  return parsedWithDefaultsAndBooleans;

};

/* EXPORT */

export default parseArgv;
export type {Options, ParsedArgs};
