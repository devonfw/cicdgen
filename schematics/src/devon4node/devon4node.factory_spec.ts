import { join } from 'path';
import { Tree, SchematicsException } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const collectionPath = join(__dirname, '../collection.json');

describe('devon4node', () => {
  it('should throw an error if groupid is not present', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    expect(() => {
      runner.runSchematic('devon4node', {}, Tree.empty());
    }).toThrowError();
  });

  it('should throw an error if the current folder do not contains a devon4node project', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);

    expect(() => {
      runner.runSchematic('devon4node', { groupid: 'com.devonfw' }, Tree.empty());
    }).toThrowError(SchematicsException);
  });

  it('should validate the input options', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const baseTree: Tree = Tree.empty();
    baseTree.create('package.json', '@nestjs');

    expect(() => {
      runner.runSchematic('devon4node', { groupid: 'com.devonfw', docker: true }, baseTree);
    }).toThrowError(SchematicsException);
  });

  it('should generate files', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const baseTree: Tree = Tree.empty();
    baseTree.create('package.json', '@nestjs');
    const tree: UnitTestTree = runner.runSchematic('devon4node', { groupid: 'com.devonfw' }, baseTree);
    const content = tree.readContent('/Jenkinsfile');
    expect(tree.files).toStrictEqual(['/package.json', '/Jenkinsfile']);
    expect(content.includes('office365ConnectorWebhooks')).toStrictEqual(false);
    expect(content.includes('oc "OpenShiftv3.11.0"')).toStrictEqual(false);
    expect(content.includes('dockerFileName = ')).toStrictEqual(false);
    expect(content.includes('dockerDaemonUrl =')).toStrictEqual(false);
    expect(content.includes('openshiftClusterName =')).toStrictEqual(false);
    expect(content.includes('tool dockerTool')).toStrictEqual(false);
    expect(content.includes(`stage ('Create the Docker image')`)).toStrictEqual(false);
    expect(content.includes(`stage ('Deploy the new image')`)).toStrictEqual(false);
    expect(content.includes(`stage ('Check pod status')`)).toStrictEqual(false);
  });

  it('should generate office365ConnectorWebhooks if teams option is present', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const baseTree: Tree = Tree.empty();
    baseTree.create('package.json', '@nestjs');
    const tree: UnitTestTree = runner.runSchematic(
      'devon4node',
      { groupid: 'com.devonfw', teams: true, teamsname: 'jenkins', teamsurl: 'msteams.com' },
      baseTree,
    );
    const content = tree.readContent('/Jenkinsfile');
    expect(tree.files).toStrictEqual(['/package.json', '/Jenkinsfile']);
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
  });

  it('should generate files and docker related files if docker option is present', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const baseTree: Tree = Tree.empty();
    baseTree.create('package.json', '@nestjs');
    const tree: UnitTestTree = runner.runSchematic(
      'devon4node',
      { groupid: 'com.devonfw', docker: true, registryurl: 'registryurl', dockerurl: 'docker' },
      baseTree,
    );
    const content = tree.readContent('/Jenkinsfile');
    expect(tree.files).toStrictEqual([
      '/package.json',
      '/Jenkinsfile',
      '/.dockerignore',
      '/.dockerignore.ci',
      '/Dockerfile',
      '/Dockerfile.ci',
    ]);
    expect(content.includes('office365ConnectorWebhooks')).toStrictEqual(false);
    expect(content.includes('oc "OpenShiftv3.11.0"')).toStrictEqual(false);
    expect(content.includes('dockerFileName = ')).toStrictEqual(true);
    expect(content.includes(`dockerDaemonUrl = 'docker'`)).toStrictEqual(true);
    expect(content.includes('openshiftClusterName =')).toStrictEqual(false);
    expect(content.includes('tool dockerTool')).toStrictEqual(true);
    expect(content.includes(`stage ('Create the Docker image')`)).toStrictEqual(true);
    expect(content.includes(`stage ('Deploy the new image')`)).toStrictEqual(true);
    expect(content.includes(`stage ('Check pod status')`)).toStrictEqual(false);
  });

  it('should generate files and docker related files if openshift option is present', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const baseTree: Tree = Tree.empty();
    baseTree.create('package.json', '@nestjs');
    const tree: UnitTestTree = runner.runSchematic(
      'devon4node',
      { groupid: 'com.devonfw', openshift: true, registryurl: 'registryurl', ocname: 'oc' },
      baseTree,
    );
    const content = tree.readContent('/Jenkinsfile');
    expect(tree.files).toStrictEqual([
      '/package.json',
      '/Jenkinsfile',
      '/.dockerignore',
      '/.dockerignore.ci',
      '/Dockerfile',
      '/Dockerfile.ci',
    ]);
    expect(content.includes('office365ConnectorWebhooks')).toStrictEqual(false);
    expect(content.includes('oc "OpenShiftv3.11.0"')).toStrictEqual(true);
    expect(content.includes('dockerFileName = ')).toStrictEqual(true);
    expect(content.includes('dockerDaemonUrl =')).toStrictEqual(false);
    expect(content.includes(`openshiftClusterName = 'oc'`)).toStrictEqual(true);
    expect(content.includes('tool dockerTool')).toStrictEqual(false);
    expect(content.includes(`stage ('Create the Docker image')`)).toStrictEqual(true);
    expect(content.includes(`stage ('Deploy the new image')`)).toStrictEqual(true);
    expect(content.includes(`stage ('Check pod status')`)).toStrictEqual(true);
  });
});
