import { Rule, SchematicContext, Tree, mergeWith, apply, url, template, noop, chain } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { IBaseOptions } from '../util/index';
import { validateOptions, validateDevon4jProject } from '../util/validations';
import { generateGitIgnoreRule } from '../util/utils';

/**
 * Interface for devon4netInitializer options. It reflects the properties defined at schema.json
 *
 * @interface IDevon4jOptions
 */
interface IDevon4jOptions extends IBaseOptions {}

/**
 * Main function for the devon4ng schematic. It will add all files included at files folder.
 * Also, it will update the pom.xml in order to add the distributionManagement.
 *
 * @export
 * @param {*} _options The command line options parsed as an object.
 * @returns {Rule} The rule to modify the file tree.
 */
export function devon4jInitializer(_options: IDevon4jOptions): Rule {
  validateOptions(_options);

  return (tree: Tree, _context: SchematicContext) => {
    validateDevon4jProject(tree);
    const appname = geProjectName(tree);
    return chain([
      mergeWith(
        apply(url('./files'), [
          template({
            ..._options,
            ...strings,
            appname,
          }),
        ]),
      ),
      _options.docker || _options.openshift
        ? mergeWith(
            apply(url('./docker'), [
              template({
                ..._options,
                ...strings,
                appname,
              }),
            ]),
          )
        : noop,
      (host: Tree): Tree => {
        tree.overwrite('pom.xml', updatePomWithDistributionManagement(host));
        return host;
      },
      generateGitIgnoreRule('java,maven,eclipse,intellij,intellij+all,intellij+iml,visualstudiocode'),
    ]);
  };
}

/**
 * Function that recover the project name from pom.xml and return it.
 *
 * @param {Tree} tree The tree of files
 * @returns {string} The project name
 */
function geProjectName(tree: Tree): string {
  const file = tree.read('pom.xml')!.toString('utf-8');
  const artifactIdRegEx: RegExp = new RegExp('<artifactId>(.*)</artifactId>');
  const match = artifactIdRegEx.exec(file);

  return match![1];
}

/**
 * Function that update the content of pom.xml. If the distributionManagement is not present, will be added.
 *
 * @param {Tree} tree The tree of files
 * @returns The new content of pom.xml
 */
function updatePomWithDistributionManagement(tree: Tree) {
  const file = tree.read('pom.xml')!.toString('utf-8');

  if (file.toLowerCase().indexOf('<distributionmanagement>') < 0) {
    return file.replace(
      '</project>',
      `  <distributionManagement>
    <repository>
      <id>pl-nexus</id>
      <name>PL Releases</name>
      <url>http://nexus3-core:8081/nexus3/repository/maven-releases</url>
    </repository>
    <snapshotRepository>
      <id>pl-nexus</id>
      <name>PL Snapshots</name>
      <url>http://nexus3-core:8081/nexus3/repository/maven-snapshots</url>
    </snapshotRepository>
  </distributionManagement>
</project>`,
    );
  }

  return file;
}
