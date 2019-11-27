import { IBaseOptions } from './index';
import { Tree, SchematicsException } from '@angular-devkit/schematics';

/**
 * This function perform some validations that the CLI can't do.
 *
 * @param options The options passed as arguments
 */
export function validateOptions(options: IBaseOptions) {
  if (options.docker && (!options.registryurl || !options.dockerurl)) {
    throw new SchematicsException('When docker is true, registryurl and dockerurl are required.');
  }

  if (options.openshift && (!options.registryurl || !options.ocname)) {
    throw new SchematicsException('When openshift is true, registryurl and ocname parameters are required.');
  }

  if (options.teams && (!options.teamsname || !options.teamsurl)) {
    throw new SchematicsException('When teams is true, teamsname and teamsurl parameters are required.');
  }
}

/**
 * This funciton validate that the current folder contains a devon4node project.
 * If not, it stop the execution.
 *
 * @param tree the schematics tree that represents the current folder.
 */
export function validateDevon4nodeProject(tree: Tree) {
  const packageJson = tree.read('package.json');
  if (!packageJson?.toString().includes('@nestjs')) {
    throw new SchematicsException(
      'You are not inside a devon4node folder. Please change to a devon4node folder and execute the command again.',
    );
  }
}

/**
 * This funciton validate that the current folder contains a devon4ng project.
 * If not, it stop the execution.
 *
 * @param tree the schematics tree that represents the current folder.
 */
export function validateDevon4ngProject(tree: Tree) {
  const packageJson = tree.read('package.json');
  if (!packageJson?.toString().includes('@angular')) {
    throw new SchematicsException(
      'You are not inside a devon4ng folder. Please change to a devon4ng folder and execute the command again.',
    );
  }
}

/**
 * This funciton validate that the current folder contains a devon4net project.
 * If not, it stop the execution.
 *
 * @param tree the schematics tree that represents the current folder.
 */
export function validateDevon4netProject(tree: Tree) {
  if (!tree.exists('devon4net.sln')) {
    throw new SchematicsException(
      'You are not inside a devon4net folder. Please change to a devon4net folder and execute the command again.',
    );
  }
}

/**
 * This funciton validate that the current folder contains a devon4j project.
 * If not, it stop the execution.
 *
 * @param tree the schematics tree that represents the current folder.
 */
export function validateDevon4jProject(tree: Tree) {
  if (!tree.exists('pom.xml')) {
    throw new SchematicsException(
      'You are not inside a devon4j folder. Please change to a devon4j folder and execute the command again.',
    );
  }
}
