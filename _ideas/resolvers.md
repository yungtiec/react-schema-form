# Resolvers: extends schemas or resolves derived values

A resolver should solve the dependent schema or derived values. And it should support memoization.

### Examples

**Primitive: dependent schema**

```js
// variant: inside of the schema
const schema = {
  type: 'string',
  resolver: {
    selectors: [value => value, (value, formProps) => formProps.secretEnabled],
    schema: memoize((value, secretEnabled) => {
      if (secretEnabled && value === 'show me the secret title!') {
        return { title: 'This is the secret title!' };
      }
      return;
    })
  }
};

// variant: outside in the `resolvers` object
const schema = {
  type: 'string',
  resolvers: 'showTitle'
};

const resolvers = {
  showTitle: {
    selectors: [value => value, (value, formProps) => formProps.secretEnabled],
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

const resolvers = {
  calc: {
    selectors: index => [
      values => values[index].operation,
      values => values[index].a,
      values => values[index].b
    ],
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
      return;
    }
  }
};
```

### Internals

Resolvers could be solved in `connect()(SchemaField)`:

```js
import { get } from './utils-path';

const mapProps = (allValues, ownProps) => {
  let schema;
  let values;

  if (ownProps.schema.resolver) {
    const { resolver } = ownProps.schema;
    if (resolver.schema) {
      schema = {
        ...schema,
        ...resolver.schema(
          ...resolver.selectors.map(selector => selector(allValues))
        )
      };

      // resolver.schema can return resolver.value!
      if (schema.resolver) {
        values = schema.resolver.value(
          ...schema.resolver.selectors.map(selector => selector(allValues))
        );
      }
    } else {
      values = resolver.value(
        ...resolver.selectors.map(selector => selector(allValues))
      );
    }
  } else {
    schema = ownProps.schema;
    values = get(ownProps.idSchema.$values, values);
  }
  return { schema, values };
};

export default resolve(map)(SchemaField);
```

We could use the `reselect` for memoization:

```js
import { withRegistry } from '../RegistryContext';
import { connect } from '../FormContext';

const get = (path, initialObject) =>
  path.reduce((object, key) => object[key], initialObject);

const getIndex = path => {
  const last = path[path.length - 1];
  if (last.charAt(0) === '#') {
    return Number(last.substring(1));
  } else {
    return undefined;
  }
};

const resolve = (resolver, selectors, values, index, formProps) =>
  createSelector(
    selectors.map(selector => selector(values, index, formProps)),
    resolver
  );

const makeResolveSchema = () => {
  return (values, ownProps, formProps) => {
    if (ownProps.schema.resolver && ownProps.schema.resolver.schema) {
      const { selectors, schema: resolver } = ownProps.schema.resolver;
      return resolve(resolver, selectors, values, index, formProps);
    } else {
      return ownProps.schema;
    }
  };
};

const makeResolveValues = index => {
  return (values, ownProps, formProps) => {
    if (ownProps.schema.type !== 'object') {
      if (ownProps.schema.resolver && ownProps.schema.resolver.value) {
        const { selectors, value: resolver } = ownProps.schema.resolver;
        return resolve(resolver, selectors, values, index, formProps);
      } else {
        const path = [...ownProps.idSchema.$path];
        if (index) {
          path[path.length - 1] = index;
        }
        return get(path, values);
      }
    } else {
      return undefined;
    }
  };
};

export const map = (values, ownProps) => {
  const index = getIndex(ownProps.idSchema.$path);
  const resolveSchema = makeResolveSchema(index);
  const resolveValues = makeResolveValues(index);

  return (values, baseOwnProps, formProps) => {
    const schema = resolveSchema(values, ownProps, formProps);
    const ownProps =
      schema === baseOwnProps.schema
        ? baseOwnProps
        : { ...baseOwnProps, schema };

    return {
      schema,
      values: resolveValues(values, ownProps, formProps)
    };
  };
};

export default connect(map)(SchemaField);
```
