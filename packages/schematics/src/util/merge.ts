import { Tree, Rule, FileEntry, forEach } from '@angular-devkit/schematics';
import { diffLines } from 'diff';

export enum mergeStrategies {
  error,
  keep,
  override,
  combine,
}

export function mergeOverride(tree: Tree, fileEntry: FileEntry): FileEntry | null {
  if (!tree.exists(fileEntry.path)) {
    return fileEntry;
  }

  tree.overwrite(fileEntry.path, fileEntry.content);

  return null;
}

export function combineFiles(oldFile: string, newFile: string): string {
  // Check that files are not empty. If empty return the correct combination.
  if (oldFile === '' && newFile === '') {
    return '';
  }
  if (oldFile === '') {
    return '<<<<<<< HEAD\n=======\n' + newFile + (newFile.endsWith('\n') ? '' : '\n') + '>>>>>>> new_content\n';
  }
  if (newFile === '') {
    return '<<<<<<< HEAD\n' + oldFile + (oldFile.endsWith('\n') ? '' : '\n') + '=======\n>>>>>>> new_content\n';
  }

  const changes = diffLines(oldFile, newFile, { newlineIsToken: false });

  let str = '';
  changes.forEach((elem, idx, arr) => {
    if (elem.removed || (elem.added && idx - 1 >= 0 && !arr[idx - 1].removed)) {
      str += '<<<<<<< HEAD\n';
    }
    if (elem.added) {
      if (!str.endsWith('\n')) {
        str += '\n';
      }
      str += '=======\n';
    }
    str += elem.value;
    if (elem.removed && idx + 1 < arr.length && !arr[idx + 1].added) {
      str += '=======\n';
      str += '>>>>>>> new_content\n';
    }
    if (elem.added) {
      if (!str.endsWith('\n')) {
        str += '\n';
      }
      str += '>>>>>>> new_content\n';
    }
  });

  return str;
}

export function mergeCombine(tree: Tree, fileEntry: FileEntry): FileEntry | null {
  if (!tree.exists(fileEntry.path)) {
    return fileEntry;
  }

  const combination: string = combineFiles(
    tree.read(fileEntry.path)!.toString('UTF-8'),
    fileEntry.content.toString('UTF-8'),
  );

  tree.overwrite(fileEntry.path, combination);

  return null;
}

export function mergeFiles(tree: Tree, mergeStrategy: mergeStrategies): Rule {
  return forEach((fileEntry: FileEntry) => {
    if (!tree.exists(fileEntry.path)) {
      return fileEntry;
    }

    if (mergeStrategy === mergeStrategies.keep) {
      return null;
    }

    if (mergeStrategy === mergeStrategies.override) {
      return mergeOverride(tree, fileEntry);
    }

    if (mergeStrategy === mergeStrategies.combine) {
      return mergeCombine(tree, fileEntry);
    }

    return fileEntry;
  });
}
