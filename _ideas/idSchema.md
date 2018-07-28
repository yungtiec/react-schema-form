# idSchema extended with the path to the value

The `idSchema` could include path to the related value so we can subscribe the `SchemaField` only to the directly related value.

### Examples

**Primitive**

```js
const schema = {
  type: 'string'
};

const idSchema = {
  $id: 'root',
  $path: []
};
```

**Object**

```js
const schema = {
  type: 'object',
  properties: {
    foo: {
      type: 'string'
    }
  }
};

const idSchema = {
  $id: 'root',
  $path: [],
  foo: {
    $id: 'root_foo',
    $path: ['foo']
  }
};

// roughly in SchemaField.js:
const get = (path, initialObject) =>
  path.reduce((object, key) => object[key], initialObject);
const mapValues = (values, ownProps) => {
  return {
    values: get(ownProps.idSchema.$path, values)
  };
};
export default connect(mapValues);
```

**Array with primitives**

```js
const schema = {
  type: 'array',
  items: {
    type: 'string'
  }
};

const idSchema = {
  $id: 'root',
  $path: []
};

// first item
const itemIdSchema = {
  $id: 'root_0',
  $path: ['#0']
};
```

**Array with objects**

```js
const schema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      foo: {
        type: 'string'
      }
    }
  }
};

const idSchema = {
  $id: 'root',
  $path: []
};

const itemIdSchema = {
  $id: 'root_0',
  $path: ['#0'],
  foo: {
    $id: 'root_0_foo',
    $path: ['#0', 'foo']
  }
};
```

**Array with fixed items**

```js
const schema = {
  type: 'array',
  items: [
    {
      type: 'string'
    },
    {
      type: 'object',
      properties: {
        foo: {
          type: 'boolean'
        }
      }
    }
  ],
  additionalItems: {
    type: 'number'
  }
};

const idSchema = {
  $id: 'root',
  $path: []
};

// first item
const itemIdSchema = {
  $id: 'root_0',
  $path: ['#0']
};

// second item
const itemIdSchema = {
  $id: 'root_1',
  $path: ['#1'],
  foo: {
    $id: 'root_1_foo',
    $path: ['#1', 'foo']
  }
};

// third item (and the others)
const itemIdSchema = {
  $id: 'root_2',
  $path: ['#2']
};
```
