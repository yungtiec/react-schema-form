# refSchema: references to schema, uiSchema and values (canceled)

We could connect schema, uiSchema and values through the redux-like `connect` but we would need selectors and selectors needs paths.

### Examples

**Primitive**

```js
const schema = {
  type: 'string'
};

const refSchema = {
  $values: '',
  $schema: '',
  $uiSchema: ''
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

const refSchema = {
  $values: '',
  $schema: '',
  $uiSchema: '',
  foo: {
    $values: 'foo',
    $schema: 'properties.foo',
    $uiSchema: 'foo'
  }
};
```

**Array with primitives**

Arrays should memoize the previous itemRefSchemas so it's not expensive on performance.

```js
const schema = {
  type: 'array',
  items: {
    type: 'string'
  }
};

const uiSchema = {
  'ui:options': {
    addable: false
  },
  items: {
    'ui:widget': 'file'
  }
};

const values = ['foo', 'bar'];

const refSchema = {
  $values: '',
  $schema: '',
  $uiSchema: ''
  // array items create the refSchema inside of the ArrayField
};

// array itemRefSchema for the first item:
const itemRefSchema = {
  $values: '#0',
  $schema: 'items',
  $uiSchema: 'items'
};
```

**Array with object**

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

const values = [
  {
    foo: 'bar'
  },
  {
    foo: 'boo'
  }
];

const refSchema = {
  $values: '',
  $schema: '',
  $uiSchema: ''
};

// for the second array item
const itemRefSchema = {
  $values: '#1',
  $schema: 'items',
  $uiSchema: 'items',
  foo: {
    $values: '#1.foo',
    $schema: 'items.properties.foo',
    $uiSchema: 'items.foo'
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
        foo: 'boolean'
      }
    }
  ],
  additionalItems: {
    type: 'number'
  }
};

const uiSchema = {
  'ui:options': {},
  items: [
    {
      'ui:widget': 'textarea'
    },
    {
      'ui:options': {}
    }
  ],
  additionalItems: {
    'ui:options': {}
  }
};

const values = [
  'Dolor sit amet...',
  {
    foo: true
  },
  5,
  100
];

const refSchema = {
  $values: '',
  $schema: '',
  $uiSchema: ''
};

// first item
const itemRefSchema = {
  $values: '#0',
  $schema: 'items.#0',
  $uiSchema: 'items.#0'
};

// second item
const itemRefSchema = {
  $values: '#1',
  $schema: 'items.#1',
  $uiSchema: 'items.#1',
  foo: {
    $values: '#1.foo',
    $schema: 'items.#1.properties.foo',
    $uiSchema: 'items.#1.foo'
  }
};

// third item (and the others)
const itemRefSchema = {
  $values: '#2',
  $schema: 'additionalItems',
  $uiSchema: 'additionalItems'
};
```
