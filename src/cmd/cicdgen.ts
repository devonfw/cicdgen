import * as yargs from 'yargs';
import {
  devon4ngBuilder,
  devon4ngHandler,
  devon4jHandler,
  devon4jBuilder,
} from './generate';

/**
 * Main function of the program. It register the command line parser, called yargs, and parse the user input.
 *
 * @export
 */
export function executable() {
  yargs
    .usage('The usage of the command')
    .command(
      'generate <technology>',
      'Generate CICD files for a devonfw technology stack',
      builder,
    )
    .demandCommand()
    .wrap(null)
    .strict()
    .help().argv;
}

/**
 * Builder function. It is passed to the yargs command. It defines the command usage, params, etc.
 *
 * @param {yargs.Argv} yargs The yargs argv object.
 */
const builder = (yargs: yargs.Argv) =>
  yargs
    .usage('Usage: $0 devonfw-cicd generate <technology> [Options]')
    .command(
      'devon4ng',
      'Generate CICD files for a devon4ng project',
      devon4ngBuilder,
      devon4ngHandler,
    )
    .command(
      'devon4j',
      'Generate CICD files for a devon4j project',
      devon4jBuilder,
      devon4jHandler,
    )
    .example(
      '$0 devonfw-cicd generate devonfw4ng',
      'Generate all files for devonfw4ng',
    )
    .version(false);
