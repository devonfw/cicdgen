import { join } from 'path';
import * as shelljs from 'shelljs';
import * as yargs from 'yargs';
import { jsonSchemaToYargsOptions, unparseArguments } from '../utils/utils';

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
  groupid: {
    alias: 'g',
    type: 'string',
    ngars: 1,
    describe:
      'The groupid of the project. It will be used only at devon4ng projects',
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
export function devon4ngBuilder(yargs: yargs.Argv) {
  return yargs
    .usage('Usage: $0 devonfw-cicd generate devon4ng [Options]')
    .options(
      jsonSchemaToYargsOptions(
        join(
          __dirname,
          '../../node_modules/@devonfw/cicdgen-schematics/src/devon4ng/schema.json',
        ),
      ),
    )
    .example(
      '$0 devonfw-cicd generate devonfw4ng -d --groupid com.devonfw',
      'Generate all files for devonfw4ng, including also files related with docker.',
    )
    .version(false);
}

/**
 * Function that will be executed when the command generate devon4ng is called. It recives
 * the arguments as an object.
 *
 * @export
 * @param {yargs.Arguments} argv The CLI arguments as an object.
 */
export async function devon4ngHandler(argv: yargs.Arguments) {
  const executionResult = shelljs.exec(
    join(__dirname, '../..', 'node_modules/.bin/schematics') +
      ' @devonfw/cicdgen-schematics:devon4ng' +
      unparseArguments(argv, options),
  );

  if (executionResult.code == 0 && shelljs.which('git')) {
    shelljs.exec('git add .');
    shelljs.exec('git commit -m "Added CICD files to the project"');
  }
}
