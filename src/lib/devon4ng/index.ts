import { strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  mergeWith,
  Rule,
  template,
  Tree,
  url,
  noop,
} from '@angular-devkit/schematics';

/**
 * Main function for the devon4ng schematic. It will add all files included at files folder.
 * Also, it will update the package.json and the angular.json files.
 *
 * @export
 * @param {*} _options The command line options parsed as an object.
 * @returns {Rule} The rule to modify the file tree.
 */
export function devon4ngInitializer(_options: any): Rule {
  console.dir(_options);
  return chain([
    (host: Tree): Tree => {
      host.delete('src/karma.conf.js');
      return host;
    },
    mergeWith(
      apply(url('./files'), [
        template({
          ..._options,
          ...strings,
        }),
      ]),
    ),
    _options.docker
      ? mergeWith(
          apply(url('./docker'), [
            template({
              ..._options,
              ...strings,
            }),
          ]),
        )
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
}

/**
 * Funtion that updates the package.json file in order to add the
 * script "test:ci".
 *
 * @param {Tree} host The tree of files
 * @returns {string} The new content of package.json
 */
function updatePackageJson(host: Tree): string {
  const content = JSON.parse(host.read('package.json')!.toString('utf-8'));
  content.scripts['test:ci'] =
    'ng test --browsers ChromeHeadless --watch=false';

  return JSON.stringify(content, null, 2);
}

/**
 * Function that update the content of angular.json file in order to modify the ouputPath to "dist".
 *
 * @param {Tree} host The tree of files
 * @returns {string} The new content of angular.json
 */
function updateAngularJson(host: Tree): string {
  const content = JSON.parse(host.read('angular.json')!.toString('utf-8'));

  content.projects[getProjectName(host)].architect.build.options.outputPath =
    'dist';

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
