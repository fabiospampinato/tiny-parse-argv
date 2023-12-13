
/* MAIN */

//TODO: Type these more strictly, if it doesn't cause too many troubles with generics...

type Options = {
  boolean?: string[],
  string?: string[],
  eager?: string[],
  required?: string[],
  variadic?: string[],
  alias?: Record<string, string[]>,
  default?: Partial<Record<string, any>>,
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
