
/* MAIN */

//TODO: Type these more strictly, if it doesn't cause too many troubles with generics...

type Options = {
  boolean?: string[],
  integer?: string[],
  number?: string[],
  string?: string[],
  eager?: string[],
  required?: string[],
  unary?: string[],
  variadic?: string[],
  alias?: Partial<Record<string, string[]>>,
  default?: Partial<Record<string, any>>,
  incompatible?: Partial<Record<string, string[]>>,
  validators?: Partial<Record<string, ( value: string ) => boolean>>,
  onIncompatible?: ( flags: [string, string][] ) => void,
  onInvalid?: ( flags: string[] ) => void,
  onMissing?: ( flags: string[] ) => void,
  onUnknown?: ( flags: string[] ) => void
};

type ParsedArgs = {
  [arg: string]: any,
  '_': string[],
  '--': string[]
};

/* EXPORT */

export type {Options, ParsedArgs};
