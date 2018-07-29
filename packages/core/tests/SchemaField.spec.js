import { testEach } from '../../../tests/test-utils';

import { getValue, isNumber, toIdSchema } from '../src/utils';
import { createMap } from '../src/fields/SchemaField';

describe('resolve', () => {
  describe('a primitive type: dependent schema', () => {
    const resolver = {
      selectors: [
        value => value,
        (values, path, formContext) => formContext.secretEnabled
      ],
      schema: (value, secretEnabled) => {
        if (secretEnabled && value === 'show me the secret title!') {
          return { title: 'This is the secret title!' };
        }
      }
    };
    const schema = {
      type: 'string',
      resolver
    };
    const idSchema = toIdSchema({ schema });

    const testCases = [
      {
        title: 'should return the untouched schema with undefined value',
        values: undefined,
        formContext: { secretEnabled: true },
        expected: {
          schema,
          values: undefined
        }
      },
      {
        title: 'should return the untouched schema with non matching value',
        values: 'foo',
        formContext: { secretEnabled: true },
        expected: {
          schema,
          values: 'foo'
        }
      },
      {
        title: 'should access the formContext',
        values: 'show me the secret title!',
        formContext: { secretEnabled: false },
        expected: {
          schema,
          values: 'show me the secret title!'
        }
      },
      {
        title: 'should return the extended schema with matching value',
        values: 'show me the secret title!',
        formContext: { secretEnabled: true },
        expected: {
          schema: {
            title: 'This is the secret title!',
            type: 'string',
            resolver
          },
          values: 'show me the secret title!'
        }
      }
    ];

    testEach(testCase => {
      const props = {
        schema,
        idSchema,
        values: testCase.values,
        formContext: testCase.formContext
      };
      const map = createMap(props);
      const actual = map(props);
      expect(actual).toEqual(testCase.expected);
    })(testCases);

    it('should work with external resolvers (formProps.resolvers)', () => {
      const initialSchema = { type: 'string', resolver: 'secret' };
      const values = 'show me the secret title!';
      const props = {
        schema: initialSchema,
        idSchema,
        values,
        resolvers: { secret: resolver },
        formContext: { secretEnabled: true }
      };
      const map = createMap(props);
      const actual = map({
        ...props,
        values: 'show me the secret title!'
      });
      expect(actual).toEqual({
        schema: { ...initialSchema, title: 'This is the secret title!' },
        values
      });
    });

    test('performance (memoization)', () => {
      const spyResolver = jest.fn();
      const props = {
        values: 'foo',
        schema: { ...schema, resolver: { ...resolver, schema: spyResolver } },
        idSchema,
        formContext: { secretEnabled: true }
      };
      const map = createMap(props);

      expect(spyResolver).not.toHaveBeenCalled();

      map(props);
      expect(spyResolver).toHaveBeenCalledTimes(1);

      // memoized result
      map(props);
      expect(spyResolver).toHaveBeenCalledTimes(1);

      map({ ...props, values: 'bar' });
      expect(spyResolver).toHaveBeenCalledTimes(2);
    });
  });

  describe('an object type: derived value', () => {
    const resolvers = {
      sum: {
        selectors: [values => values.a, values => values.b],
        value: (a, b) => isNumber(a) && isNumber(b) && a + b
      }
    };
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
    const idSchema = toIdSchema({ schema });

    it('should not load values for an object entity', () => {
      const values = { a: 1, b: 2 };
      const props = { schema, idSchema, values, resolvers };
      const map = createMap(props);
      const actual = map(props);
      const expected = { schema, values: undefined };

      expect(actual).toEqual(expected);
    });

    it('should resolve the derived value', () => {
      const values = { a: 1, b: 2 };
      const props = {
        schema: schema.properties.sum,
        idSchema: idSchema.sum,
        values,
        resolvers
      };
      const map = createMap(props);
      const actual = map(props);
      const expected = {
        schema: props.schema,
        values: 3
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('an array item of an object type: derived value', () => {
    const createSelector = name => (values, actualPath) => {
      const path = [...actualPath];
      path[path.length - 1] = name;
      return getValue(path, values);
    };
    const resolvers = {
      calc: {
        selectors: [
          createSelector('operation'),
          createSelector('a'),
          createSelector('b')
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
    const parentSchema = {
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
    const parentIdSchema = toIdSchema({ schema: parentSchema });
    const itemIdSchema = toIdSchema({
      schema: parentSchema.items,
      parentIdSchema,
      index: 0
    });

    it('should resolve the derived value', () => {
      const values = [{ operation: 'max', a: 1, b: 2 }];
      const schema = parentSchema.items.properties.result;
      const props = {
        schema,
        idSchema: itemIdSchema.result,
        values,
        resolvers
      };
      const map = createMap(props);
      const actual = map(props);
      const expected = {
        schema,
        values: 2
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('dependent schema returning resolver for derived value', () => {
    const parentSchema = {
      type: 'object',
      properties: {
        useDefault: {
          type: 'boolean'
        },
        constant: {
          type: 'number'
        },
        value: {
          type: 'number',
          resolver: {
            selectors: [values => values.useDefault],
            schema: useDefault => useDefault && { resolver: 'calcDefaultValue' }
          }
        }
      }
    };
    const idSchema = toIdSchema({ schema: parentSchema });
    const resolvers = {
      calcDefaultValue: {
        selectors: [values => values.constant],
        value: constant => constant + 5
      }
    };
    const schema = parentSchema.properties.value;

    const testCases = [
      {
        title: 'should use the default value',
        values: { useDefault: true, constant: 2 },
        expected: {
          schema: {
            type: 'number',
            resolver: 'calcDefaultValue'
          },
          values: 7
        }
      },
      {
        title: 'should leave the undefined value',
        values: { useDefault: false, constant: 2 },
        expected: {
          schema,
          values: undefined
        }
      }
    ];

    testEach(testCase => {
      const props = {
        schema,
        idSchema: idSchema.value,
        values: testCase.values,
        resolvers
      };
      const map = createMap(props);
      const actual = map(props);

      expect(actual).toEqual(testCase.expected);
    })(testCases);

    test('performance (memoization)', () => {
      const spySchemaResolver = jest.fn(schema.resolver.schema);
      const spyValueResolver = jest.fn();
      const initProps = values => ({
        schema: {
          ...schema,
          resolver: {
            ...schema.resolver,
            schema: spySchemaResolver
          }
        },
        idSchema,
        resolvers: {
          calcDefaultValue: {
            ...resolvers.calcDefaultValue,
            value: spyValueResolver
          }
        },
        values
      });
      const props = initProps({ useDefault: false });
      const map = createMap(props);

      expect(spySchemaResolver).not.toHaveBeenCalled();
      expect(spyValueResolver).not.toHaveBeenCalled();

      map(props);
      expect(spySchemaResolver).toHaveBeenCalledTimes(1);
      expect(spyValueResolver).not.toHaveBeenCalled();

      // memoize
      map(props);
      expect(spySchemaResolver).toHaveBeenCalledTimes(1);

      const newProps = initProps({ useDefault: true, constant: 5 });
      map(newProps);
      expect(spySchemaResolver).toHaveBeenCalledTimes(2);
      expect(spyValueResolver).toHaveBeenCalledTimes(1);

      // memoize
      map(newProps);
      expect(spySchemaResolver).toHaveBeenCalledTimes(2);
      expect(spyValueResolver).toHaveBeenCalledTimes(1);
    });
  });
});
