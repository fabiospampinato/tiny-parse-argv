
/* IMPORT */

import * as minimist from 'minimist';
import process from 'node:process';
import type {Options, ParsedArgs} from './types';

/* MAIN */

const parseArgv = ( argv: string[] = process.argv, options?: Options ): ParsedArgs => {

  return minimist ( argv, options );

};

/* EXPORT */

export default parseArgv;
