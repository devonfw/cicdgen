import fetch from 'node-fetch';
import { Rule, Tree } from '@angular-devkit/schematics';
import { Observable } from 'rxjs';

/**
 * Generate a gitignore file using the gitignore.io API
 * @param tools
 */
export async function generateGitIgnore(tools: string): Promise<string> {
  const url = `https://www.gitignore.io/api/${tools}`;

  const response = await fetch(url);
  return await response.text();
}

/**
 * Rule that will create a gitignore file using the gitignore.io API
 *
 * @param tools
 */
export function generateGitIgnoreRule(tools: string): Rule {
  return (host: Tree) => {
    if (host.exists('.gitignore')) {
      return host;
    }
    return new Observable<Tree>(observer => {
      generateGitIgnore(tools)
        .then(data => {
          host.create('.gitignore', data);
          observer.next(host);
          observer.complete();
        })
        .catch((err: any) => {
          observer.error(err);
        });
    });
  };
}
