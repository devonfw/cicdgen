import { join } from 'path';
import { Tree, SchematicsException } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Observable } from 'rxjs';

const collectionPath = join(__dirname, '../collection.json');

describe('devon4net', () => {
  it('should throw an error if groupid is not present', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    expect(() => {
      runner.runSchematic('devon4net', { appname: 'devon4net' }, Tree.empty());
    }).toThrowError();
  });

  it('should throw an error if appname is not present', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    expect(() => {
      runner.runSchematic('devon4net', { groupid: 'com.devonfw' }, Tree.empty());
    }).toThrowError();
  });

  it('should throw an error if the current folder do not contains a devon4net project', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);

    expect(() => {
      runner.runSchematic('devon4net', { groupid: 'com.devonfw', appname: 'devon4net' }, Tree.empty());
    }).toThrowError(SchematicsException);
  });

  it('should validate the input options', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const baseTree: Tree = Tree.empty();
    baseTree.create('devon4net.sln', 'empty solution file');

    expect(() => {
      runner.runSchematic('devon4net', { groupid: 'com.devonfw', appname: 'devon4net', docker: true }, baseTree);
    }).toThrowError(SchematicsException);
  });

  it('should generate files', done => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const baseTree: Tree = Tree.empty();
    baseTree.create('devon4net.sln', 'empty solution file');
    const tree: Observable<UnitTestTree> = runner.runSchematicAsync(
      'devon4net',
      { groupid: 'com.devonfw', appname: 'devon4net' },
      baseTree,
    );

    tree.subscribe(value => {
      const content = value.readContent('/Jenkinsfile');
      expect(value.files).toStrictEqual(['/devon4net.sln', '/Jenkinsfile', '/.gitignore']);
      expect(content.includes(`appName = 'devon4net'`)).toStrictEqual(true);
      expect(content.includes(`appVersion = '0.0.1'`)).toStrictEqual(true);
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

  it('should generate office365ConnectorWebhooks if teams option is present', done => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const baseTree: Tree = Tree.empty();
    baseTree.create('devon4net.sln', 'empty solution file');
    const tree: Observable<UnitTestTree> = runner.runSchematicAsync(
      'devon4net',
      { groupid: 'com.devonfw', appname: 'devon4net', teams: true, teamsname: 'jenkins', teamsurl: 'msteams.com' },
      baseTree,
    );

    tree.subscribe(value => {
      const content = value.readContent('/Jenkinsfile');
      expect(value.files).toStrictEqual(['/devon4net.sln', '/Jenkinsfile', '/.gitignore']);
      expect(content.includes(`appName = 'devon4net'`)).toStrictEqual(true);
      expect(content.includes(`appVersion = '0.0.1'`)).toStrictEqual(true);
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
    baseTree.create('devon4net.sln', 'empty solution file');
    const tree: Observable<UnitTestTree> = runner.runSchematicAsync(
      'devon4net',
      { groupid: 'com.devonfw', appname: 'devon4net', docker: true, registryurl: 'registryurl', dockerurl: 'docker' },
      baseTree,
    );
    tree.subscribe(value => {
      const content = value.readContent('/Jenkinsfile');
      expect(value.files).toStrictEqual([
        '/devon4net.sln',
        '/Jenkinsfile',
        '/.dockerignore',
        '/Dockerfile',
        '/Dockerfile.ci',
        '/.gitignore',
      ]);
      expect(content.includes(`appName = 'devon4net'`)).toStrictEqual(true);
      expect(content.includes(`appVersion = '0.0.1'`)).toStrictEqual(true);
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
    baseTree.create('devon4net.sln', 'empty solution file');
    const tree: Observable<UnitTestTree> = runner.runSchematicAsync(
      'devon4net',
      { groupid: 'com.devonfw', appname: 'devon4net', openshift: true, registryurl: 'registryurl', ocname: 'oc' },
      baseTree,
    );
    tree.subscribe(value => {
      const content = value.readContent('/Jenkinsfile');
      expect(value.files).toStrictEqual([
        '/devon4net.sln',
        '/Jenkinsfile',
        '/.dockerignore',
        '/Dockerfile',
        '/Dockerfile.ci',
        '/.gitignore',
      ]);
      expect(content.includes(`appName = 'devon4net'`)).toStrictEqual(true);
      expect(content.includes(`appVersion = '0.0.1'`)).toStrictEqual(true);
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
