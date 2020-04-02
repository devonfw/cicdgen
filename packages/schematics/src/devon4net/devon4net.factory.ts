import { strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, noop, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { generateGitIgnoreRule, IExtendedOptions, validateDevon4netProject, validateOptions } from '../util';
import { mergeFiles, mergeStrategies } from '../util/merge';

/**
 * Interface for devon4netInitializer options. It reflects the properties defined at schema.json
 *
 * @interface IDevon4netOptions
 */
interface IDevon4netOptions extends IExtendedOptions {
  appname: string;
  appversion?: string;
}

/**
 * Main function for the devon4net schematic. It will add all files included at files folder.
 * Also, it will update the package.json.
 *
 * @export
 * @param {*} _options The command line options parsed as an object.
 * @returns {Rule} The rule to modify the file tree.
 */
export function devon4netInitializer(_options: IDevon4netOptions): Rule {
  validateOptions(_options);
  const strategy: mergeStrategies = mergeStrategies[_options.merge];
  return (tree: Tree): Rule => {
    validateDevon4netProject(tree);
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
      generateGitIgnoreRule('rider,dotnetcore,visualstudio,visualstudiocode'),
      (host: Tree): Tree => {
        const gitignore = host
          .read('.gitignore')
          ?.toString()
          .replace('*.pfx', '');
        if (gitignore) {
          host.overwrite('.gitignore', gitignore);
        }
        return host;
      },
    ]);
  };
}
