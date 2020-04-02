/* eslint-disable no-console */
import { join } from 'path';
import { Tree, SchematicsException } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Observable } from 'rxjs';
import { mergeStrategies } from '../util/merge';

const collectionPath = join(__dirname, '../collection.json');

describe('devon4j', () => {
  it('should throw an error if the current folder do not contains a devon4j project', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);

    expect(() => {
      runner.runSchematic('devon4j', {}, Tree.empty());
    }).toThrowError(SchematicsException);
  });

  it('should validate the input options', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const baseTree: Tree = Tree.empty();
    baseTree.create('pom.xml', '<artifactId>devon4j</artifactId></project>');

    expect(() => {
      runner.runSchematic('devon4j', { docker: true }, baseTree);
    }).toThrowError(SchematicsException);
  });

  it('should generate files', done => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const baseTree: Tree = Tree.empty();
    baseTree.create('pom.xml', '<artifactId>devon4j</artifactId></project>');
    const tree: Observable<UnitTestTree> = runner.runSchematicAsync('devon4j', {}, baseTree);

    tree.subscribe(value => {
      const content = value.readContent('/Jenkinsfile');
      const pom = value.readContent('/pom.xml');
      expect(value.files).toStrictEqual(['/pom.xml', '/Jenkinsfile', '/.gitignore']);
      expect(pom.includes('<distributionManagement>')).toStrictEqual(true);
      expect(pom.includes('<url>http://nexus3-core:8081/nexus3/repository/maven-releases</url>')).toStrictEqual(true);
      expect(pom.includes('<url>http://nexus3-core:8081/nexus3/repository/maven-snapshots</url>')).toStrictEqual(true);
      expect(content.includes('office365ConnectorWebhooks')).toStrictEqual(false);
      expect(content.includes('oc "OpenShiftv3.11.0"')).toStrictEqual(false);
      expect(content.includes('dockerFileName = ')).toStrictEqual(false);
      expect(content.includes('dockerDaemonUrl =')).toStrictEqual(false);
      expect(content.includes('openshiftClusterName =')).toStrictEqual(false);
      expect(content.includes('tool dockerTool')).toStrictEqual(false);
      expect(content.includes(`stage ('Create the Docker image')`)).toStrictEqual(false);
      expect(content.includes(`stage ('Deploy the new image')`)).toStrictEqual(false);
      expect(content.includes(`stage ('Check pod status')`)).toStrictEqual(false);
      done();
    });
  });

  it('should throw an error if there is a conflict', done => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const baseTree: Tree = Tree.empty();
    baseTree.create('pom.xml', '<artifactId>devon4j</artifactId></project>');
    baseTree.create('Jenkinsfile', '');
    const tree: Observable<UnitTestTree> = runner.runSchematicAsync('devon4j', {}, baseTree);

    tree.subscribe(
      value => {
        expect(value).toBeUndefined();
        done(new Error(''));
      },
      error => {
        expect(error).toBeDefined();
        done();
      },
    );
  });

  it('should keep the files when merge strategy is equals to keep', done => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const baseTree: Tree = Tree.empty();
    baseTree.create('pom.xml', '<artifactId>devon4j</artifactId></project>');
    baseTree.create('Jenkinsfile', 'stupid content');
    const tree: Observable<UnitTestTree> = runner.runSchematicAsync(
      'devon4j',
      { merge: mergeStrategies[mergeStrategies.keep] },
      baseTree,
    );

    tree.subscribe(
      value => {
        const content = value.readContent('/Jenkinsfile');
        expect(value.files).toStrictEqual(['/pom.xml', '/Jenkinsfile', '/.gitignore']);
        expect(content).toStrictEqual('stupid content');
        done();
      },
      error => {
        done(error);
      },
    );
  });

  it('should override the files when merge strategy is equals to override', done => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const baseTree: Tree = Tree.empty();
    baseTree.create('pom.xml', '<artifactId>devon4j</artifactId></project>');
    baseTree.create('Jenkinsfile', 'stupid content');
    const tree: Observable<UnitTestTree> = runner.runSchematicAsync(
      'devon4j',
      { merge: mergeStrategies[mergeStrategies.override] },
      baseTree,
    );

    tree.subscribe(
      value => {
        const content = value.readContent('/Jenkinsfile');
        expect(value.files).toStrictEqual(['/pom.xml', '/Jenkinsfile', '/.gitignore']);
        expect(content.includes('pipeline')).toStrictEqual(true);
      },
      error => {
        done(error);
      },
      () => {
        done();
      },
    );
  });

  it('should combine the files when merge strategy is equals to combine', done => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const baseTree: Tree = Tree.empty();
    baseTree.create('pom.xml', '<artifactId>devon4j</artifactId></project>');
    baseTree.create('Jenkinsfile', 'stupid content');
    const tree: Observable<UnitTestTree> = runner.runSchematicAsync(
      'devon4j',
      { merge: mergeStrategies[mergeStrategies.combine] },
      baseTree,
    );

    tree.subscribe(
      value => {
        const content = value.readContent('/Jenkinsfile');
        expect(value.files).toStrictEqual(['/pom.xml', '/Jenkinsfile', '/.gitignore']);
        expect(content.startsWith('<<<<<<< HEAD')).toStrictEqual(true);
        expect(content.endsWith('>>>>>>> new_content\n')).toStrictEqual(true);
      },
      error => {
        console.log('error');
        done(error);
      },
      () => {
        done();
      },
    );
  });

  it('should generate office365ConnectorWebhooks if teams option is present', done => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const baseTree: Tree = Tree.empty();
    baseTree.create('pom.xml', '<artifactId>devon4j</artifactId><distributionManagement></project>');
    const tree: Observable<UnitTestTree> = runner.runSchematicAsync(
      'devon4j',
      { teams: true, teamsname: 'jenkins', teamsurl: 'msteams.com' },
      baseTree,
    );

    tree.subscribe(value => {
      const content = value.readContent('/Jenkinsfile');
      const pom = value.readContent('/pom.xml');
      expect(value.files).toStrictEqual(['/pom.xml', '/Jenkinsfile', '/.gitignore']);
      expect(pom.includes('<distributionManagement>')).toStrictEqual(true);
      expect(pom.includes('<url>http://nexus3-core:8081/nexus3/repository/maven-releases</url>')).toStrictEqual(false);
      expect(pom.includes('<url>http://nexus3-core:8081/nexus3/repository/maven-snapshots</url>')).toStrictEqual(false);
      expect(
        content.includes(
          `office365ConnectorWebhooks([[name: 'jenkins', notifyAborted: true, notifyBackToNormal: true, notifyFailure: true, notifySuccess: true, notifyUnstable: true, url: 'msteams.com']])`,
        ),
      ).toStrictEqual(true);
      expect(content.includes('oc "OpenShiftv3.11.0"')).toStrictEqual(false);
      expect(content.includes('dockerFileName = ')).toStrictEqual(false);
      expect(content.includes('dockerDaemonUrl =')).toStrictEqual(false);
      expect(content.includes('openshiftClusterName =')).toStrictEqual(false);
      expect(content.includes('tool dockerTool')).toStrictEqual(false);
      expect(content.includes(`stage ('Create the Docker image')`)).toStrictEqual(false);
      expect(content.includes(`stage ('Deploy the new image')`)).toStrictEqual(false);
      expect(content.includes(`stage ('Check pod status')`)).toStrictEqual(false);
      done();
    });
  });

  it('should generate files and docker related files if docker option is present', done => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const baseTree: Tree = Tree.empty();
    baseTree.create('pom.xml', '<artifactId>devon4j</artifactId></project>');
    const tree: Observable<UnitTestTree> = runner.runSchematicAsync(
      'devon4j',
      { docker: true, registryurl: 'registryurl', dockerurl: 'docker' },
      baseTree,
    );
    tree.subscribe(value => {
      const content = value.readContent('/Jenkinsfile');
      expect(value.files).toStrictEqual(['/pom.xml', '/Jenkinsfile', '/Dockerfile', '/Dockerfile.ci', '/.gitignore']);
      expect(content.includes('office365ConnectorWebhooks')).toStrictEqual(false);
      expect(content.includes('oc "OpenShiftv3.11.0"')).toStrictEqual(false);
      expect(content.includes('dockerFileName = ')).toStrictEqual(true);
      expect(content.includes(`dockerDaemonUrl = 'docker'`)).toStrictEqual(true);
      expect(content.includes('openshiftClusterName =')).toStrictEqual(false);
      expect(content.includes('tool dockerTool')).toStrictEqual(true);
      expect(content.includes(`stage ('Create the Docker image')`)).toStrictEqual(true);
      expect(content.includes(`stage ('Deploy the new image')`)).toStrictEqual(true);
      expect(content.includes(`stage ('Check pod status')`)).toStrictEqual(false);
      done();
    });
  });

  it('should generate files and docker related files if openshift option is present', done => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const baseTree: Tree = Tree.empty();
    baseTree.create('pom.xml', '<artifactId>devon4j</artifactId></project>');
    const tree: Observable<UnitTestTree> = runner.runSchematicAsync(
      'devon4j',
      { openshift: true, registryurl: 'registryurl', ocname: 'oc' },
      baseTree,
    );
    tree.subscribe(value => {
      const content = value.readContent('/Jenkinsfile');
      expect(value.files).toStrictEqual(['/pom.xml', '/Jenkinsfile', '/Dockerfile', '/Dockerfile.ci', '/.gitignore']);
      expect(content.includes('office365ConnectorWebhooks')).toStrictEqual(false);
      expect(content.includes('oc "OpenShiftv3.11.0"')).toStrictEqual(true);
      expect(content.includes('dockerFileName = ')).toStrictEqual(true);
      expect(content.includes('dockerDaemonUrl =')).toStrictEqual(false);
      expect(content.includes(`openshiftClusterName = 'oc'`)).toStrictEqual(true);
      expect(content.includes('tool dockerTool')).toStrictEqual(false);
      expect(content.includes(`stage ('Create the Docker image')`)).toStrictEqual(true);
      expect(content.includes(`stage ('Deploy the new image')`)).toStrictEqual(true);
      expect(content.includes(`stage ('Check pod status')`)).toStrictEqual(true);
      done();
    });
  });
});
