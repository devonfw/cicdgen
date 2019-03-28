import * as shelljs from 'shelljs';
import * as yargs from 'yargs';
import { join } from 'path';

/**
 * Main function of the program. It register the command line parser, called yargs, and parse the user input.
 *
 * @export
 */
export function executable() {
  yargs
    .usage('The usage of the command')
    .command('generate <technology>', '', builder, handler)
    .demandCommand()
    .wrap(null)
    .strict()
    .help().argv;
}

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
 * @param {yargs.Argv} yargs The yargs argv object.
 */
const builder = (yargs: yargs.Argv) =>
  yargs
    .usage('Usage: $0 devonfw-cicd generate <technology> [Options]')
    .positional('technology', {
      describe: 'Devonfw technology',
      choices: ['devon4j', 'devon4ng'],
      default: 'devon4ng',
    })
    .options(options)
    .example(
      '$0 devonfw-cicd generate devonfw4ng',
      'Generate all files for devonfw4ng',
    )
    .version(false);

/**
 * Generate command function handler. It will be executed when yargs detects that you are calling to the generate command.
 * It will call to "schematics" program passing the correct schematic and arguments. It also makes a new commit.
 *
 * @param {yargs.Arguments} argv Command line arguments as an object.
 */
const handler = (argv: yargs.Arguments) => {
  const executionResult = shelljs.exec(
    join(__dirname, '../..', 'node_modules/.bin/schematics') +
      ' @devonfw/cicd-schematics:' +
      argv.technology +
      unparseArguments(argv),
  );

  if (executionResult.code == 0 && shelljs.which('git')) {
    shelljs.exec('git add .');
    shelljs.exec('git commit -m "Added CICD files to the project"');
  }
};

/**
 * Function that recive the command line arguments as an object and return a string with all of those arguments.
 * This string will be used in the "schematics" program call.
 *
 * @param {yargs.Arguments} args
 * @returns
 */
function unparseArguments(args: yargs.Arguments) {
  let result: string = '';

  Object.keys(options).forEach(e => {
    if (args[e] !== undefined && args[e]) {
      if (options[e].type === 'boolean') {
        result = result.concat(` --${e}`);
      } else {
        result = result.concat(` --${e} ${args[e]}`);
      }
    }
  });

  return result;
}
