jest.mock('node-fetch');

import fetch from 'node-fetch';
import { generateGitIgnore, generateGitIgnoreRule } from './utils';
import { Tree } from '@angular-devkit/schematics';
import { Observable } from 'rxjs';
const { Response } = jest.requireActual('node-fetch');

describe('utils', () => {
  beforeAll(() => {
    ((fetch as unknown) as jest.Mock<any, any>).mockImplementationOnce(() => new Response('mock gitignore content'));
    ((fetch as unknown) as jest.Mock<any, any>).mockImplementationOnce(() => new Response('mock gitignore content'));
    ((fetch as unknown) as jest.Mock<any, any>).mockImplementationOnce(() => {
      throw new Error();
    });
  });
  describe('generateGitIgnore', () => {
    it('should return the gitignore content from gitignore.io', () => {
      return expect(generateGitIgnore('fake')).resolves.toStrictEqual('mock gitignore content');
    });
  });

  describe('generateGitIgnoreRule', () => {
    it('should create a .gitignore file in the tree', done => {
      const testTree: Tree = Tree.empty();
      const rule = generateGitIgnoreRule('mock');

      (rule(testTree, undefined as any) as Observable<Tree>).subscribe(value => {
        expect(value.exists('.gitignore')).toStrictEqual(true);
        expect(value.read('.gitignore')?.toString()).toStrictEqual('mock gitignore content');
        done();
      });
    });

    it('should throw an error if fetch fails', done => {
      const testTree: Tree = Tree.empty();
      const rule = generateGitIgnoreRule('mock');

      (rule(testTree, undefined as any) as Observable<Tree>).subscribe(
        _value => {
          done();
        },
        error => {
          expect(error).toStrictEqual(new Error());
          done();
        },
      );
    });

    it('should do nothing if .gitignore already exists', () => {
      const testTree: Tree = Tree.empty();
      const rule = generateGitIgnoreRule('mock');

      testTree.create('.gitignore', 'fake gitignore');
      const tree: Tree = rule(testTree, undefined as any) as Tree;

      expect(tree.exists('.gitignore')).toStrictEqual(true);
      expect(tree.read('.gitignore')?.toString()).toStrictEqual('fake gitignore');
    });
  });
});
