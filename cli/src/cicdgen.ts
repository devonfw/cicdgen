import { readFileSync } from 'fs';
import { join } from 'path';
import * as yargs from 'yargs';
import { generateBuilder, generateHandler } from './generate/generate';

const schematicPath = join(__dirname, '../node_modules/@devonfw/cicdgen-schematics/src/');

/**
 * Main function of the program. It register the command line parser, called yargs, and parse the user input.
 *
 * @export
 */
export function executable() {
  // tslint:disable-next-line: no-unused-expression
  yargs
    .usage('The usage of the command')
    .command('generate <technology>', 'Generate CICD files for a devonfw technology stack', builder)
    .demandCommand()
    .wrap(null)
    .strict()
    .help().argv;
}

/**
 * Builder function. It is passed to the yargs command. It defines the command usage, params, etc.
 *
 * @param {yargs.Argv} yargsArgv The yargs argv object.
 */
const builder = (yargsArgv: yargs.Argv) => {
  let newYargs = yargsArgv
    .usage('Usage: $0 devonfw-cicd generate <technology> [Options]')
    .example('$0 devonfw-cicd generate devon4ng', 'Generate all files for devon4ng')
    .version(false);

  const collection = JSON.parse(readFileSync(join(schematicPath, 'collection.json')).toString());

  Object.keys(collection.schematics).forEach((element: string) => {
    const schematic = collection.schematics[element];
    const path = join(schematicPath, schematic.schema || '');
    newYargs = newYargs.command(
      element,
      schematic.description,
      generateBuilder(element, path),
      generateHandler(element, path),
    );
  });

  return newYargs;
};
