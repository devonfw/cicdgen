#!/bin/bash

# currentDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
for Dir in $PWD/src/*/; do
  cd $Dir
  rm -f $Dir*.js
  rm -f $Dir*.js.map
  rm -f $Dir*.d.ts
done