import { join } from 'path';
import * as shelljs from 'shelljs';
import * as yargs from 'yargs';
import { jsonSchemaToYargsOptions, unparseArguments } from '../utils/utils';

/**
 * Builder function. It is passed to the yargs command. It defines the command usage, params, etc.
 *
 * @exports
 * @param {yargs.Argv} yargs The yargs argv object.
 */
export function generateBuilder(schematicName: string, schemaPath: string) {
  return (yargsArg: yargs.Argv): yargs.Argv => {
    return yargsArg
      .usage(`Usage: $0 generate ${schematicName} [Options]`)
      .options(jsonSchemaToYargsOptions(schemaPath))
      .example(`$0 generate ${schematicName}`, `Generate all files for ${schematicName}`)
      .version(false);
  };
}

/**
 * Function that will be executed when the command generate devon4j is called. It recives
 * the arguments as an object.
 *
 * @export
 * @param {yargs.Arguments} argv The CLI arguments as an object.
 */
export function generateHandler(schematicName: string, schemaPath: string) {
  return (argv: yargs.Arguments): void => {
    const executionResult = shelljs.exec(
      join(__dirname, '../..', 'node_modules/.bin/schematics') +
        ' @devonfw/cicdgen-schematics:' +
        schematicName +
        ' ' +
        unparseArguments(argv, jsonSchemaToYargsOptions(schemaPath)),
    );

    if (argv.commit && executionResult.code === 0 && shelljs.which('git')) {
      shelljs.exec('git add .');
      shelljs.exec('git commit -m "Added CICD files to the project"');
    }
  };
}
