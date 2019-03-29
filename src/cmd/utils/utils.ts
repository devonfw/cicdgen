import * as yargs from 'yargs';
/**
 * Function that recive the command line arguments as an object and return a string with all of those arguments.
 * This string will be used in the "schematics" program call.
 *
 * @exports
 * @param {yargs.Arguments} args Command line arguments as an object.
 * @param {*} options The options that the command accepts.
 * @returns The arguments as an string formatted for "schematic" tool.
 */
export function unparseArguments(args: yargs.Arguments, options: any) {
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
