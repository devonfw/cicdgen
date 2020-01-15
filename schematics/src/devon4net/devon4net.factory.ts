import { Rule, Tree, SchematicContext, chain, mergeWith, apply, template, url, noop } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { IExtendedOptions, generateGitIgnoreRule, validateOptions, validateDevon4netProject } from '../util';

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
  return (tree: Tree, _context: SchematicContext) => {
    validateDevon4netProject(tree);
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
