import { get, isNumber, toIdSchema } from '../src/utils';
import { map } from '../src/fields/SchemaField';

describe('resolvers', () => {
  describe('a primitive type: dependent schema', () => {
    const resolver = {
      selectors: [value => value],
      schema: value => {
        if (value === 'show me the secret title!') {
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
        expected: {
          schema,
          values: undefined
        }
      },
      {
        title: 'should return the untouched schema with non matching value',
        values: 'foo',
        expected: {
          schema,
          values: 'foo'
        }
      },
      {
        title: 'should return the extended schema with matching value',
        values: 'show me the secret title!',
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

    testCases.forEach(testCase =>
      test(testCase.title, () => {
        const ownProps = { schema, idSchema };
        const formProps = {};
        const closuredMap = map(testCase.values, ownProps, formProps);
        const actual = closuredMap(
          testCase.values,
          ownProps,
          testCase.formProps
        );
        expect(actual).toEqual(testCase.expected);
      })
    );

    it('should work with external resolvers (formProps.resolvers)', () => {
      const initialSchema = { type: 'string', resolver: 'secret' };
      const values = 'show me the secret title!';
      const ownProps = {
        schema: initialSchema,
        idSchema
      };
      const formProps = { resolvers: { secret: resolver } };
      const closuredMap = map(values, ownProps, formProps);
      const actual = closuredMap(
        'show me the secret title!',
        ownProps,
        formProps
      );
      expect(actual).toEqual({
        schema: { ...initialSchema, title: 'This is the secret title!' },
        values
      });
    });

    test('performance (memoization)', () => {
      const spyResolver = jest.fn();
      const values = 'foo';
      const ownProps = {
        schema: { ...schema, resolver: { ...resolver, schema: spyResolver } },
        idSchema
      };
      const formProps = {};
      const closuredMap = map(values, ownProps, formProps);

      expect(spyResolver).not.toHaveBeenCalled();

      closuredMap(values, ownProps, formProps);
      expect(spyResolver).toHaveBeenCalledTimes(1);

      // memoized result
      closuredMap(values, ownProps, formProps);
      expect(spyResolver).toHaveBeenCalledTimes(1);

      closuredMap('bar', ownProps, formProps);
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
      const ownProps = { schema, idSchema };
      const formProps = { resolvers };
      const closuredMap = map(values, ownProps, formProps);
      const actual = closuredMap(values, ownProps, formProps);
      const expected = { schema, values: undefined };

      expect(actual).toEqual(expected);
    });

    it('should resolve the derived value', () => {
      const values = { a: 1, b: 2 };
      const ownProps = {
        schema: schema.properties.sum,
        idSchema: idSchema.sum
      };
      const formProps = { resolvers };
      const closuredMap = map(values, ownProps, formProps);
      const actual = closuredMap(values, ownProps, formProps);
      const expected = {
        schema: ownProps.schema,
        values: 3
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('an array item of an object type: derived value', () => {
    const getValue = name => (values, resolvedPath) => {
      const path = [...resolvedPath];
      path[path.length - 1] = name;
      return get(path, values);
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
      const ownProps = {
        schema,
        idSchema: itemIdSchema.result
      };
      const formProps = { resolvers };
      const closuredMap = map(values, ownProps, formProps);
      const actual = closuredMap(values, ownProps, formProps);
      const expected = {
        schema,
        values: 2
      };

      expect(actual).toEqual(expected);
    });
  });
});
