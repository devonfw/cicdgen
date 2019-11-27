/**
 * IBaseOptions interface
 * This interface contains all properties shared in all devonfw stacks
 */
export interface IBaseOptions {
  docker?: boolean;
  registryurl?: string;
  teams?: boolean;
  teamsname?: string;
  teamsurl?: string;
  dockercertid?: string;
  dockerurl?: string;
  openshift?: boolean;
  ocname?: string;
  ocn?: string;
}

/**
 * IExtendedOptions interface
 * This interface contains options shared for some devonfw stacks but not for all of them
 */
export interface IExtendedOptions extends IBaseOptions {
  groupid: string;
}

export * from './validations';
export * from './utils';
