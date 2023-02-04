
/* MAIN */

const isBoolean = ( value: unknown ): value is true | false => {

  return value === true || value === false;

};

const isNil = ( value: unknown ): value is null | undefined => {

  return value === null || value === undefined;

};

const isOverridable = ( value: unknown ): value is true | false | null | undefined | '' => {

  return isNil ( value ) || isBoolean ( value ) || value === '';

};

const set = ( target: any, key: string, value: any ): void => {

  if ( Array.isArray ( target[key] ) ) {

    target[key].push ( value );

  } else if ( isOverridable ( target[key] ) ) {

    target[key] = value;

  } else {

    target[key] = [target[key], value];

  }

};

const uniq = <T> ( values: T[] ): T[] => {

  return Array.from ( new Set ( values ) );

};

const without = <T> ( values: T[], value: T ): T[] => {

  return values.filter ( other => other !== value );

};

const zip = <T extends string, U> ( keys: T[] | Set<T>, value: U ): Record<T, U> => {

  return Object.fromEntries ( Array.from ( keys ).map ( key => [key, value] ) ) as Record<T, U>;

};

/* EXPORT */

export {isBoolean, isNil, isOverridable, set, uniq, without, zip};
