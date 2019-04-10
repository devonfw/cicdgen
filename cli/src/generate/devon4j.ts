import { unparseArguments, jsonSchemaToYargsOptions } from '../utils/utils';
import * as yargs from 'yargs';
import * as shelljs from 'shelljs';
import { join } from 'path';

const options: any = {
  docker: {
    alias: 'd',
    type: 'boolean',
    describe: 'Add docker to the CICD?',
  },
  plurl: {
    type: 'string',
    alias: 'p',
    describe: 'The production line url',
  },
  teams: {
    alias: 't',
    type: 'boolean',
    default: false,
    describe: 'Do you want MS Teams notifications?',
  },
  teamsname: {
    alias: 'n',
    type: 'string',
    ngars: 1,
    describe: 'The name of the MS Teams webhook. Used only if "teams" is true.',
  },
  teamsurl: {
    alias: 'u',
    type: 'string',
    ngars: 1,
    describe: 'The url of the MS Teams webhook. Used only if "teams" is true.',
  },
};

/**
 * Builder function. It is passed to the yargs command. It defines the command usage, params, etc.
 *
 * @exports
 * @param {yargs.Argv} yargs The yargs argv object.
 */
export function devon4jBuilder(yargs: yargs.Argv) {
  return yargs
    .usage('Usage: $0 devonfw-cicd generate devon4j [Options]')
    .options(
      jsonSchemaToYargsOptions(
        join(
          __dirname,
          '../../node_modules/@devonfw/cicdgen-schematics/src/devon4j/schema.json',
        ),
      ),
    )
    .example(
      '$0 devonfw-cicd generate devonfw4j',
      'Generate all files for devonfw4j',
    )
    .version(false);
}

/**
 * Function that will be executed when the command generate devon4j is called. It recives
 * the arguments as an object.
 *
 * @export
 * @param {yargs.Arguments} argv The CLI arguments as an object.
 */
export function devon4jHandler(argv: yargs.Arguments) {
  const executionResult = shelljs.exec(
    join(__dirname, '../..', 'node_modules/.bin/schematics') +
      ' @devonfw/cicdgen-schematics:devon4j' +
      unparseArguments(argv, options),
  );

  if (executionResult.code == 0 && shelljs.which('git')) {
    shelljs.exec('git add .');
    shelljs.exec('git commit -m "Added CICD files to the project"');
  }
}
