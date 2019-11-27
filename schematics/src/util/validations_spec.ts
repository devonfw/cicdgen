import {
  validateOptions,
  validateDevon4nodeProject,
  validateDevon4ngProject,
  validateDevon4netProject,
  validateDevon4jProject,
} from './validations';
import { IBaseOptions } from './index';
import { SchematicsException, Tree } from '@angular-devkit/schematics';

describe('validations', () => {
  describe('validateOptions', () => {
    it('should work if no options are passed', () => {
      expect(() => {
        validateOptions({});
      }).not.toThrow();
    });

    it('should work if docker, registryurl and dockerurl are passed', () => {
      const options: IBaseOptions = { docker: true, registryurl: 'fake url', dockerurl: 'fake docker url' };
      expect(() => {
        validateOptions(options);
      }).not.toThrow();
    });

    it('should return an error if docker is present but registryurl or dockerurl dont', () => {
      const options: IBaseOptions = { docker: true };
      expect(() => {
        validateOptions(options);
      }).toThrow(SchematicsException);

      options.registryurl = 'fake url';
      expect(() => {
        validateOptions(options);
      }).toThrow(SchematicsException);

      options.registryurl = undefined;
      options.dockerurl = 'fake docker url';
      expect(() => {
        validateOptions(options);
      }).toThrow(SchematicsException);
    });

    it('should work if openshift, registryurl and ocname are passed', () => {
      const options: IBaseOptions = { openshift: true, registryurl: 'fake url', ocname: 'fake oc name' };
      expect(() => {
        validateOptions(options);
      }).not.toThrow();
    });

    it('should return an error if openshift is present but registryurl or ocname dont', () => {
      const options: IBaseOptions = { openshift: true };
      expect(() => {
        validateOptions(options);
      }).toThrow(SchematicsException);

      options.registryurl = 'fake url';
      expect(() => {
        validateOptions(options);
      }).toThrow(SchematicsException);

      options.registryurl = undefined;
      options.ocname = 'fake oc name';
      expect(() => {
        validateOptions(options);
      }).toThrow(SchematicsException);
    });

    it('should work if teams, teamsname and teamsurl are passed', () => {
      const options: IBaseOptions = { teams: true, teamsurl: 'fake url', teamsname: 'fake name' };
      expect(() => {
        validateOptions(options);
      }).not.toThrow();
    });

    it('should return an error if teams is present but teamsname or teamsurl dont', () => {
      const options: IBaseOptions = { teams: true };
      expect(() => {
        validateOptions(options);
      }).toThrow(SchematicsException);

      options.teamsurl = 'fake url';
      expect(() => {
        validateOptions(options);
      }).toThrow(SchematicsException);

      options.teamsurl = undefined;
      options.teamsname = 'fake name';
      expect(() => {
        validateOptions(options);
      }).toThrow(SchematicsException);
    });
  });

  describe('validateDevon4nodeProject', () => {
    it('should return an error if the current folder do not contain a devon4node project', () => {
      const tree: Tree = Tree.empty();
      expect(() => {
        validateDevon4nodeProject(tree);
      }).toThrow(SchematicsException);

      tree.create('package.json', '{}');
      expect(() => {
        validateDevon4nodeProject(tree);
      }).toThrow(SchematicsException);
    });

    it('should work if the current folder contains a devon4node project', () => {
      const tree: Tree = Tree.empty();
      tree.create('package.json', '{"dependencies": {"@nestjs/core": "1.0.0"}}');
      expect(() => {
        validateDevon4nodeProject(tree);
      }).not.toThrow(SchematicsException);
    });
  });
  describe('validateDevon4ngProject', () => {
    it('should return an error if the current folder do not contain a devon4ng project', () => {
      const tree: Tree = Tree.empty();
      expect(() => {
        validateDevon4ngProject(tree);
      }).toThrow(SchematicsException);

      tree.create('package.json', '{}');
      expect(() => {
        validateDevon4ngProject(tree);
      }).toThrow(SchematicsException);
    });

    it('should work if the current folder contains a devon4ng project', () => {
      const tree: Tree = Tree.empty();
      tree.create('package.json', '{"dependencies": {"@angular/core": "1.0.0"}}');
      expect(() => {
        validateDevon4ngProject(tree);
      }).not.toThrow(SchematicsException);
    });
  });
  describe('validateDevon4netProject', () => {
    it('should return an error if the current folder do not contain a devon4net project', () => {
      const tree: Tree = Tree.empty();
      expect(() => {
        validateDevon4netProject(tree);
      }).toThrow(SchematicsException);
    });

    it('should work if the current folder contains a devon4net project', () => {
      const tree: Tree = Tree.empty();
      tree.create('devon4net.sln', 'any content');
      expect(() => {
        validateDevon4netProject(tree);
      }).not.toThrow(SchematicsException);
    });
  });
  describe('validateDevon4jProject', () => {
    it('should return an error if the current folder do not contain a devon4j project', () => {
      const tree: Tree = Tree.empty();
      expect(() => {
        validateDevon4jProject(tree);
      }).toThrow(SchematicsException);
    });

    it('should work if the current folder contains a devon4j project', () => {
      const tree: Tree = Tree.empty();
      tree.create('pom.xml', 'any content');
      expect(() => {
        validateDevon4jProject(tree);
      }).not.toThrow(SchematicsException);
    });
  });
});
