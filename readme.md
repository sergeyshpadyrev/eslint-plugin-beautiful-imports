# Beautiful imports

[![npm version](https://img.shields.io/npm/v/eslint-plugin-beautiful-imports)](https://badge.fury.io/js/eslint-plugin-beautiful-imports)
[![License: MIT](https://img.shields.io/npm/l/eslint-plugin-beautiful-imports)](https://opensource.org/licenses/MIT)
![test](https://github.com/sergeyshpadyrev/eslint-plugin-beautiful-imports/workflows/test/badge.svg?branch=master)

This plugin sorts imports strictly in alphabetical order by first letter of import statement. It's based on [sort-imports](https://eslint.org/docs/rules/sort-imports) rule but it has a few differences.

It makes your imports look like this:

```js
import 'alice'
import 'bob'
import _ as Ant from 'ant'
import _ as Bear from 'bear'
import Adam from 'adam'
import { B as A, C } from 'letters'
import David from 'david'
import { E, F as H } from 'other-letters'

```

## Installation

You need [ESLint](https://www.github.com/eslint/eslint) to be installed for this plugin to work
Then install `eslint-plugin-beautiful-imports`

```
npm install --save eslint-plugin-beautiful-imports
```

or

```

yard add eslint-plugin-beautiful-imports

```

Add "beautiful-imports" to the plugins section

```

{
"plugins": ["beautiful-imports"]
}

```

Add `beautiful-imports/sort-imports` to eslint rules

## Parameters

This plugin has the following parameters:

-   <b>allowSeparatedGroups</b> (default: <i>false</i>) - When true the rule checks the sorting of import declaration statements only for those that appear on consecutive lines.
    In other words, a blank line or a comment line or line with any other statement after an import declaration statement will reset the sorting of import declaration statements.

```

```
