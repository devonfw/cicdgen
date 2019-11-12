import { strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, Rule, template, Tree, url, noop } from '@angular-devkit/schematics';

/**
 * Interface for devon4ngInitializer options. It reflects the properties defined at schema.json
 *
 * @interface devon4ngOptions
 */
interface devon4ngOptions {
  docker?: boolean;
  plurl?: string;
  openshift?: boolean;
  ocurl?: boolean;
  ocn?: string;
  groupid: string;
  teams?: boolean;
  teamsname?: string;
  teamsurl?: string;
}

/**
 * Main function for the devon4ng schematic. It will add all files included at files folder.
 * Also, it will update the package.json and the angular.json files.
 *
 * @export
 * @param {*} _options The command line options parsed as an object.
 * @returns {Rule} The rule to modify the file tree.
 */
export function devon4ngInitializer(_options: devon4ngOptions): Rule {
  if ((_options.docker || _options.openshift) && !_options.plurl) {
    console.error('When docker or openshift is true, plurl is required.');
    process.exit(1);
  }

  if (_options.openshift && (!_options.ocurl || !_options.ocn)) {
    console.error('When openshift is true, ocurl and ocn parameters are required.');
    process.exit(1);
  }

  return (tree: Tree): Rule => {
    const packageJson = tree.read('package.json');
    if (!packageJson || !packageJson.toString().includes('angular')) {
      console.error(
        'You are not inside a devon4ng folder. Please change to a devon4ng folder and execute the command again.',
      );
      process.exit(1);
    }
    return chain([
      (host: Tree): Tree => {
        host.delete('karma.conf.js');
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
            apply(url('./docker/lts'), [
              template({
                ..._options,
                ...strings,
              }),
            ]),
          )
        : noop,
      _options.openshift
        ? mergeWith(
            apply(url('./docker/alpine-perl'), [
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
  };
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
  content.scripts['test:ci'] = 'ng test --browsers ChromeHeadless --watch=false';

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

  content.projects[getProjectName(host)].architect.build.options.outputPath = 'dist';

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
