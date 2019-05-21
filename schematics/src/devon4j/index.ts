import {
  Rule,
  SchematicContext,
  Tree,
  mergeWith,
  apply,
  url,
  template,
  noop,
  chain,
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';

/**
 * Main function for the devon4ng schematic. It will add all files included at files folder.
 * Also, it will update the pom.xml in order to add the distributionManagement.
 *
 * @export
 * @param {*} _options The command line options parsed as an object.
 * @returns {Rule} The rule to modify the file tree.
 */
export function devon4jInitializer(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const appname = geProjectName(tree);
    const dockerOrOpenshift = (_options.docker || _options.openshift)
      ? mergeWith(
          apply(url('./docker'), [
            template({
              ..._options,
              ...strings,
              appname,
            }),
          ]),
        )
      : noop;
    const files = mergeWith(
      apply(url('./files'), [
        template({
          ..._options,
          ...strings,
          appname,
        }),
      ]),
    );
    const pom = (tree: Tree): Tree => {
      tree.overwrite('pom.xml', updatePomWithDistributionManagement(tree));
      return tree;
    };

    return chain([files, dockerOrOpenshift, pom]);
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
