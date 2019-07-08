import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

// TODO: Implement this test properly
describe('@devonfw/cicd-schematics', () => {
  it('works', () => {
    // const runner = new SchematicTestRunner('schematics', collectionPath);
    // const tree = runner.runSchematic(
    //   '@devonfw/cicd-schematics',
    //   {},
    //   Tree.empty(),
    // );

    expect(true).toEqual(true);
  });
});
