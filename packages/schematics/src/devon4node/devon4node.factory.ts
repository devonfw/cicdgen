import { strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, Rule, template, Tree, url, noop } from '@angular-devkit/schematics';
import { IExtendedOptions } from '../util';
import { validateOptions, validateDevon4nodeProject } from '../util/validations';
import { mergeFiles, mergeStrategies } from '../util/merge';

/**
 * Interface for devon4nodeInitializer options. It reflects the properties defined at schema.json
 *
 * @interface IDevon4nodeOptions
 */
type IDevon4nodeOptions = IExtendedOptions;

/**
 * Funtion that updates the package.json file in order to add the
 * script "lint:ci".
 *
 * @returns {Rule} The rule that will perform the package.json modificaton
 */
function updatePackageJson(): Rule {
  return (tree: Tree): Tree => {
    const content = JSON.parse(tree.read('package.json')!.toString('utf-8'));
    content.scripts['lint:ci'] = 'eslint {src,apps,lib,test}/**/*.ts -f json -o .eslintreport';

    tree.overwrite('package.json', JSON.stringify(content, null, 2));

    return tree;
  };
}

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
  const strategy: mergeStrategies = mergeStrategies[_options.merge];

  return (tree: Tree): Rule => {
    validateDevon4nodeProject(tree);
    return chain([
      (host: Tree): Rule => {
        return mergeWith(
          apply(url('./files'), [
            template({
              ..._options,
              ...strings,
            }),
            mergeFiles(host, strategy),
          ]),
        );
      },
      _options.docker || _options.openshift
        ? (host: Tree): Rule => {
            return mergeWith(
              apply(url('./docker'), [
                template({
                  ..._options,
                  ...strings,
                }),
                mergeFiles(host, strategy),
              ]),
            );
          }
        : noop,
      updatePackageJson(),
    ]);
  };
}
