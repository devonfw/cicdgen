import { Path } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { mergeOverride, combineFiles, mergeCombine } from './merge';

// mergeFiles(tree: Tree, mergeStrategy: mergeStrategies): Rule

describe('merge', () => {
  describe('mergeOverride', () => {
    it('should keep the actual if there are no conflicts', () => {
      const baseTree: Tree = Tree.empty();
      baseTree.create('package.json', 'this is the content');

      const result = mergeOverride(baseTree, {
        path: 'package-lock.json' as Path,
        content: Buffer.from('this is another content'),
      });

      expect(result).toStrictEqual({
        path: 'package-lock.json' as Path,
        content: Buffer.from('this is another content'),
      });
      expect(baseTree.read('package.json')?.toString()).toStrictEqual('this is the content');
    });

    it('should keep the override if there are conflicts', () => {
      const baseTree: Tree = Tree.empty();
      baseTree.create('package.json', 'this is the content');
      baseTree.create('package-lock.json', 'fake content');

      const result = mergeOverride(baseTree, {
        path: 'package.json' as Path,
        content: Buffer.from('this is another content'),
      });

      expect(result).toStrictEqual(null);
      expect(baseTree.read('package.json')?.toString()).toStrictEqual('this is another content');
      expect(baseTree.read('package-lock.json')?.toString()).toStrictEqual('fake content');
    });
  });

  describe('combineFiles', () => {
    it('should return the combination of two text by applying a diff like gits do when there is a conflict.', () => {
      let oldText = `
        Line 1
        Line 2
        Line 3
      `;

      let newText = `
        Line 4
        Line 2
        Line 3
        Line 5
      `;

      expect(combineFiles(oldText, newText)).toStrictEqual(`
<<<<<<< HEAD
        Line 1
=======
        Line 4
>>>>>>> new_content
        Line 2
        Line 3
<<<<<<< HEAD
=======
        Line 5
>>>>>>> new_content
      `);

      oldText = `
      Line 1
      `;

      newText = `
      `;

      expect(combineFiles(oldText, newText)).toStrictEqual(`
<<<<<<< HEAD
      Line 1
=======
>>>>>>> new_content
      `);
    });
  });

  describe('mergeCombine', () => {
    it('should do nothing if there is no conflict', () => {
      const baseTree: Tree = Tree.empty();
      baseTree.create('package.json', 'this is the content');

      const result = mergeCombine(baseTree, {
        path: 'package-lock.json' as Path,
        content: Buffer.from('this is another content'),
      });

      expect(result).toStrictEqual({
        path: 'package-lock.json' as Path,
        content: Buffer.from('this is another content'),
      });
      expect(baseTree.read('package.json')?.toString()).toStrictEqual('this is the content');
    });

    it('should combine files if there is a conflict', () => {
      const baseTree: Tree = Tree.empty();
      baseTree.create('package.json', 'this is the content');
      baseTree.create('package-lock.json', '');
      baseTree.create('package-lock2.json', '');
      baseTree.create('yarn.lock', 'this is another content');
      baseTree.create('yarn2.lock', 'this is another content\n');
      baseTree.create('yarn.log', '');

      let result = mergeCombine(baseTree, {
        path: 'package.json' as Path,
        content: Buffer.from('this is another content'),
      });

      expect(result).toStrictEqual(null);
      expect(baseTree.read('package.json')?.toString()).toStrictEqual(`<<<<<<< HEAD
this is the content
=======
this is another content
>>>>>>> new_content
`);

      result = mergeCombine(baseTree, {
        path: 'package-lock.json' as Path,
        content: Buffer.from('this is another content'),
      });

      expect(result).toStrictEqual(null);
      expect(baseTree.read('package-lock.json')?.toString()).toStrictEqual(`<<<<<<< HEAD
=======
this is another content
>>>>>>> new_content
`);

      result = mergeCombine(baseTree, {
        path: 'package-lock2.json' as Path,
        content: Buffer.from('this is another content\n'),
      });

      expect(result).toStrictEqual(null);
      expect(baseTree.read('package-lock.json')?.toString()).toStrictEqual(`<<<<<<< HEAD
=======
this is another content
>>>>>>> new_content
`);

      result = mergeCombine(baseTree, {
        path: 'package-lock2.json' as Path,
        content: Buffer.from('this is another content'),
      });

      expect(result).toStrictEqual(null);
      expect(baseTree.read('package-lock.json')?.toString()).toStrictEqual(`<<<<<<< HEAD
=======
this is another content
>>>>>>> new_content
`);

      result = mergeCombine(baseTree, {
        path: 'yarn.lock' as Path,
        content: Buffer.from(''),
      });

      expect(result).toStrictEqual(null);
      expect(baseTree.read('yarn.lock')?.toString()).toStrictEqual(`<<<<<<< HEAD
this is another content
=======
>>>>>>> new_content
`);

      result = mergeCombine(baseTree, {
        path: 'yarn2.lock' as Path,
        content: Buffer.from(''),
      });

      expect(result).toStrictEqual(null);
      expect(baseTree.read('yarn.lock')?.toString()).toStrictEqual(`<<<<<<< HEAD
this is another content
=======
>>>>>>> new_content
`);

      result = mergeCombine(baseTree, {
        path: 'yarn.log' as Path,
        content: Buffer.from(''),
      });

      expect(result).toStrictEqual(null);
      expect(baseTree.read('yarn.log')?.toString()).toStrictEqual('');
    });
  });
});
