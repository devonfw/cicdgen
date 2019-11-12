import { strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, Rule, template, Tree, url, noop } from '@angular-devkit/schematics';

/**
 * Interface for devon4nodeInitializer options. It reflects the properties defined at schema.json
 *
 * @interface devon4nodeOptions
 */
interface devon4nodeOptions {
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
 * Main function for the devon4node schematic. It will add all files included at files folder.
 * Also, it will update the package.json.
 *
 * @export
 * @param {*} _options The command line options parsed as an object.
 * @returns {Rule} The rule to modify the file tree.
 */
export function devon4nodeInitializer(_options: devon4nodeOptions): Rule {
  if (_options.docker && !_options.plurl) {
    console.error('When docker is true, plurl is required.');
    process.exit(1);
  }

  if (_options.openshift && (!_options.ocurl || !_options.ocn)) {
    console.error('When openshift is true, ocurl and ocn parameters are required.');
    process.exit(1);
  }

  return (tree: Tree): Rule => {
    const packageJson = tree.read('package.json');
    if (!packageJson || !packageJson.toString().includes('nestjs')) {
      console.error(
        'You are not inside a devon4node folder. Please change to a devon4node folder and execute the command again.',
      );
      process.exit(1);
    }
    return chain([
      (host: Tree): Tree => {
        host.delete('.gitignore');
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
      (host: Tree): Tree => {
        host.overwrite('package.json', updatePackageJson(host));
        return host;
      },
    ]);
  };
}

/**
 * Funtion that updates the package.json file in order to add the
 * script "start:production".
 *
 * @param {Tree} host The tree of files
 * @returns {string} The new content of package.json
 */
function updatePackageJson(host: Tree): string {
  const content = JSON.parse(host.read('package.json')!.toString('utf-8'));
  content.scripts['start:production'] = 'node main.js';
  content.scripts['prestart:prod'] = undefined;

  return JSON.stringify(content, null, 2);
}
