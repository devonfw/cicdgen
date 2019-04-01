import { readFileSync } from 'fs';
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

export function jsonSchemaToYargsOptions(jsonFile: string): any {
  const json = JSON.parse(readFileSync(jsonFile).toString());
  const result: any = {};

  Object.keys(json.properties).forEach(e => {
    const newOption: any = {
      type: schemaTypeToYargsType(json.properties[e].type),
      description: json.properties[e].description,
    };

    if (json.properties[e].default) {
      newOption.default = json.properties[e].default;
    }

    result[e] = newOption;
  });

  if (json.required) {
    json.required.forEach((e: string) => {
      result[e].demandOption = true;
    });
  }

  return result;
}

function schemaTypeToYargsType(type: string) {
  switch (type) {
    case 'array':
    case 'boolean':
    case 'string':
    case 'number':
      return type;
    case 'integer':
      return 'number';
    case 'object':
    case 'null':
    case 'enum':
    default:
      return 'string';
  }
}
