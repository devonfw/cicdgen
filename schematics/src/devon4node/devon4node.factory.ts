import { strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, Rule, template, Tree, url, noop } from '@angular-devkit/schematics';
import { IExtendedOptions } from '../util';
import { validateOptions, validateDevon4nodeProject } from '../util/validations';

/**
 * Interface for devon4nodeInitializer options. It reflects the properties defined at schema.json
 *
 * @interface IDevon4nodeOptions
 */
interface IDevon4nodeOptions extends IExtendedOptions {}

/**
 * Main function for the devon4node schematic. It will add all files included at files folder.
 * Also, it will update the package.json.
 *
 * @export
 * @param {*} _options The command line options parsed as an object.
 * @returns {Rule} The rule to modify the file tree.
 */
export function devon4nodeInitializer(_options: IDevon4nodeOptions): Rule {
  validateOptions(_options);

  return (tree: Tree): Rule => {
    validateDevon4nodeProject(tree);
    return chain([
      mergeWith(
        apply(url('./files'), [
          template({
            ..._options,
            ...strings,
          }),
        ]),
      ),
      _options.docker || _options.openshift
        ? mergeWith(
            apply(url('./docker'), [
              template({
                ..._options,
                ...strings,
              }),
            ]),
          )
        : noop,
    ]);
  };
}
