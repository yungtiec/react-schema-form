# Resolvers: extends schemas or resolves derived values

A resolver should solve the dependent schema or derived values. And it should support memoization.

### Examples

**Primitive: dependent schema**

```js
// variant: inside of the schema
const schema = {
  type: 'string',
  resolver: {
    selectors: [
      value => value,
      (value, formContext) => formContext.secretEnabled
    ],
    schema: (value, secretEnabled) => {
      if (secretEnabled && value === 'show me the secret title!') {
        return { title: 'This is the secret title!' };
      }
      return;
    }
  }
};

// variant: outside in the `resolvers` object
const schema = {
  type: 'string',
  resolvers: 'showTitle'
};

const resolvers = {
  showTitle: {
    selectors: [
      value => value,
      (value, formContext) => formContext.secretEnabled
    ],
    schema: (value, secretEnabled) => {
      if (secretEnabled && value === 'show me the secret title!') {
        return { title: 'This is the secret title!' };
      }
      return;
    }
  }
};
```

**Object: derived value**

```js
const schema = {
  type: 'object',
  properties: {
    a: {
      type: 'number'
    },
    b: {
      type: 'number'
    },
    sum: {
      type: 'number',
      resolver: 'sum'
    }
  }
};

const resolvers = {
  sum: {
    selectors: [
      values => values.a,
      values => values.b
    ],
    value: (a, b) => isNumber(a) && isNumber(b) && a + b;
  }
};
```

**Array with objects: index**

```js
const schema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        default: 'sum',
        enums: ['sum', 'max']
      },
      a: {
        type: 'number'
      },
      b: {
        type: 'number'
      },
      result: {
        type: 'number',
        resolver: 'calc'
      }
    }
  }
};

const getValue = name => (values, path) => {
  /*returns the value*/
};
const resolvers = {
  calc: {
    selectors: [getValue('operation'), getValue('a'), getValue('b')],
    value: (operation, a, b) => {
      if (isNumber(a) && isNumber(b)) {
        switch (operation) {
          case 'sum':
            return a + b;
          case 'max':
            return Math.max(a, b);
          default:
            return new Error(`operation ${operation} doesn't exist`);
        }
      }
    }
  }
};
```

### Relative selectors

I don't know if this should be possible by default or you should build your own helper..

#### part of the lib

```js
const schema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      foo: {
        type: 'boolean'
      },
      bar: {
        type: 'string',
        resolver: 'setBar'
      }
    }
  }
};
const resolvers = {
  setBar: {
    selectors: ['../foo'],
    resolver: foo => (foo ? 'cool' : 'hmm')
  }
};
```

#### custom helper

```js
import { createSelector } from './helpers';

const schema = {}; // the same as above
const resolvers = {
  setBar: {
    selectors: [createSelector('../foo')],
    resolver: foo => (foo ? 'cool' : 'hmm')
  }
};
```

**`createSelector`:**

```js
import { getValue } from '@react-schema-form/core';

const getPath = (relativePath, actualPath) => {
  const parts = relativePath.split('/');
  return parts.reduce((path, part) => {
    if (part !== '') {
      if (part === '..') {
        path.pop();
      } else {
        path.push(part);
      }
    }
    return path;
  }, actualPath);
};

export const createSelector = relativePath => (values, actualPath) => {
  const path = getPath(relativePath, actualPath);
  return getValue(path, values);
};
```

**tests:**

```js
import { testEach } from 'test-utils';

describe('getPath', () => {
  const testCases = [
    {
      title: 'should return the parent (nested object)',
      relativePath: '../',
      actualPath: ['boo', 'foo'],
      expected: ['boo']
    },
    {
      title: 'should return the sibling (object type)',
      relativePath: '../bar',
      actualPath: ['foo'],
      expected: ['bar']
    },
    {
      title: 'should return the sibling (array item)',
      relativePath: '../bar',
      actualPath: ['#0', 'foo'],
      expected: ['#0', 'bar']
    },
    {
      title: "should return the sibling's property",
      relativePath: '../boo/bar',
      actualPath: ['boss', 'foo'],
      expected: ['boss', 'boo', 'bar']
    }
  ];

  testEach(testCase => {
    const actual = getPath(testCase.relativePath, testCase.actualPath);
    expect(actual).toEqual(testCase.expected);
  })(testCases);
});
```
