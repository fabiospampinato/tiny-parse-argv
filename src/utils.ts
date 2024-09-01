
/* MAIN */

const castArray = <T> ( value: T | T[] ): T[] => {

  return Array.isArray ( value ) ? value : [value];

};

const isBoolean = ( value: unknown ): value is true | false => {

  return value === true || value === false;

};

const isNil = ( value: unknown ): value is null | undefined => {

  return value === null || value === undefined;

};

const isNull = ( value: unknown ): value is null => {

  return value === null;

};

const isOverridable = ( value: unknown ): value is true | false | null | undefined | '' => {

  return isNil ( value ) || isBoolean ( value ) || value === '';

};

const isUndefined = ( value: unknown ): value is undefined => {

  return value === undefined;

};

const setNormal = ( target: any, key: string, value: any ): void => {

  if ( Array.isArray ( target[key] ) ) {

    target[key].push ( value );

  } else if ( isOverridable ( target[key] ) ) {

    target[key] = value;

  } else {

    target[key] = [target[key], value];

  }

};

const setVariadic = ( target: any, key: string, value: any ): void => {

  const values = castArray ( value );

  if ( Array.isArray ( target[key] ) ) {

    target[key].push ( ...values );

  } else if ( isOverridable ( target[key] ) ) {

    target[key] = values;

  } else {

    target[key] = [target[key], ...values];

  }

};

const uniq = <T> ( values: T[] ): T[] => {

  return Array.from ( new Set ( values ) );

};

const uniqBy = <T> ( values: T[], iterator: ( value: T, index: number, arr: ArrayLike<T> ) => unknown ): T[] => {

  const ids = new Set ();

  return values.filter ( ( value, index, arr ) => {

    const id = iterator ( value, index, arr );

    if ( ids.has ( id ) ) return false;

    ids.add ( id );

    return true;

  });

};

const without = <T> ( values: T[], value: T ): T[] => {

  return values.filter ( other => other !== value );

};

const zip = <T extends string, U> ( keys: T[] | Set<T>, value: U ): Record<T, U> => {

  return Object.fromEntries ( Array.from ( keys ).map ( key => [key, value] ) ) as Record<T, U>;

};

/* EXPORT */

export {castArray, isBoolean, isNil, isNull, isOverridable, isUndefined, setNormal, setVariadic, uniq, uniqBy, without, zip};
