# Normalize, denormalize and resolve structures (canceled)

The JSON Schema is not the proper data structure for manipulation with data. With it you need to update deeply nested object which is bad for performance.
So if we flatten all data structures then we should get better performance on updates. And in the same time we'll get the chance to compare schema, uiSchema and values for the actual resolved component so if we use React context for subscribing to data then we can update only the related components even without the updating all the components above them.

## `schema`: JSON Schema

JSON Schema is nested only if the property `type` is "object" or "array".
If it's an object then we need to look into the property `properties`.
If it's an array then we need to look into the properties: `items` and `additionalItems`.

### Normalize: examples

**Primitive**

```js
const initialSchema = {
  type: 'string'
};

const normalizedSchema = {
  root: { type: 'string' }
};

const normalizedValues = {
  root: 'bar'
};
```

**Object**

```js
const initialSchema = {
  type: 'object',
  properties: {
    foo: {
      type: 'string'
    }
  }
};

const normalizedSchema = {
  root: {
    type: 'object',
    properties: {
      foo: 'root.properties.foo'
    }
  },
  'root.properties.foo': {
    type: 'string'
  }
};

const normalizedValues = {
  'root.foo': 'bar'
};
```

**Array with primitives**

```js
const initialSchema = {
  type: 'array',
  items: {
    type: 'string'
  }
};

const normalizedSchema = {
  root: {
    type: 'array',
    items: 'root.items'
  },
  'root.items': {
    type: 'string'
  }
};

const normalizedValues = {
  root: ['root.id0', 'root.id1'],
  'root.id0': 'foo',
  'root.id1': 'bar'
};
```

**Array with objects**

```js
const initialSchema = {
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

const normalizedSchema = {
  root: {
    type: 'array',
    items: 'root.items'
  },
  'root.items': {
    type: 'object',
    properties: {
      foo: 'root.items.properties.foo'
    }
  },
  'root.items.properties.foo': {
    type: 'string'
  }
};

const normalizedValues = {
  root: ['root.id0', 'root.id1'],
  'root.id0.foo': 'bar',
  'root.id1.foo': 'boo'
};
```

**Array with fixed items**

```js
const initialSchema = {
  type: 'array',
  items: [
    {
      type: 'boolean'
    },
    {
      type: 'object',
      properties: {
        foo: {
          type: 'number'
        }
      }
    }
  ],
  additionalItems: {
    type: 'string'
  }
};

const normalizedSchema = {
  root: {
    type: 'array',
    items: ['root.items.#0', 'root.items.#1'],
    additionalItems: 'root.additionalItems'
  },
  'root.items.#0': {
    type: 'boolean'
  },
  'root.items.#1': {
    type: 'object',
    properties: {
      foo: 'root.items.#1.properties.foo'
    }
  },
  'root.items.#1.properties.foo': {
    type: 'number'
  },
  'root.additionalItems': {
    type: 'string'
  }
};

const normalizedValues = {
  root: ['root.id0', 'root.id1', 'root.id2', 'root.id3'],
  'root.id0': true,
  'root.id1.foo': 5,
  'root.id2': 'bar',
  'root.id3': 'boo'
};
```
