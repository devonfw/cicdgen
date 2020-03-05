import { strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, Rule, template, Tree, url, noop } from '@angular-devkit/schematics';
import { IExtendedOptions } from '../util/index';
import { validateOptions, validateDevon4ngProject } from '../util/validations';
import { mergeStrategies, mergeFiles } from '../util/merge';

/**
 * Interface for devon4ngInitializer options. It reflects the properties defined at schema.json
 *
 * @interface IDevon4ngOptions
 */
type IDevon4ngOptions = IExtendedOptions;

/**
 * Funtion that updates the package.json file in order to add the
 * script "test:ci".
 *
 * @param {Tree} host The tree of files
 * @returns {string} The new content of package.json
 */
function updatePackageJson(host: Tree): string {
  const content = JSON.parse(host.read('package.json')!.toString('utf-8'));
  content.scripts['test:ci'] = 'ng test --browsers ChromeHeadless --watch=false --code-coverage';

  return JSON.stringify(content, null, 2);
}

/**
 * Function that recover the project name from package.json and return it.
 *
 * @param {Tree} host The tree of files
 * @returns {string} The project name
 */
function getProjectName(host: Tree): string {
  return JSON.parse(host.read('package.json')!.toString('utf-8')).name;
}

/**
 * Function that update the content of angular.json file in order to modify the ouputPath to "dist".
 *
 * @param {Tree} host The tree of files
 * @returns {string} The new content of angular.json
 */
function updateAngularJson(host: Tree): string {
  const content = JSON.parse(host.read('angular.json')!.toString('utf-8'));

  content.projects[getProjectName(host)].architect.build.options.outputPath = 'dist';

  return JSON.stringify(content, null, 2);
}

/**
 * Main function for the devon4ng schematic. It will add all files included at files folder.
 * Also, it will update the package.json and the angular.json files.
 *
 * @export
 * @param {*} _options The command line options parsed as an object.
 * @returns {Rule} The rule to modify the file tree.
 */
export function devon4ngInitializer(_options: IDevon4ngOptions): Rule {
  validateOptions(_options);
  const strategy: mergeStrategies = mergeStrategies[_options.merge];

  return (tree: Tree): Rule => {
    validateDevon4ngProject(tree);
    return chain([
      (host: Tree): Tree => {
        if (host.exists('karma.conf.js')) {
          host.delete('karma.conf.js');
        }
        return host;
      },
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
      (host: Tree): Tree => {
        host.overwrite('package.json', updatePackageJson(host));
        return host;
      },
      (host: Tree): Tree => {
        host.overwrite('angular.json', updateAngularJson(host));
        return host;
      },
    ]);
  };
}
