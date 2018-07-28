import { toIdSchema } from '../src/utils';

describe('utils', () => {
  describe('toIdSchema', () => {
    const testCases = [
      {
        title: 'primitive (string)',
        param: {
          schema: {
            type: 'string'
          }
        },
        expected: {
          idSchema: {
            $id: 'root',
            $path: []
          }
        }
      },
      {
        title: 'idPrefix (primitive)',
        param: {
          schema: {
            type: 'string'
          },
          idPrefix: 'foo'
        },
        expected: {
          idSchema: {
            $id: 'foo',
            $path: []
          }
        }
      },
      {
        title: 'object',
        param: {
          schema: {
            type: 'object',
            properties: {
              foo: {
                type: 'string'
              }
            }
          }
        },
        expected: {
          idSchema: {
            $id: 'root',
            $path: [],
            foo: {
              $id: 'root_foo',
              $path: ['foo']
            }
          }
        }
      },
      {
        title: 'array with primitives',
        param: {
          schema: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        },
        expected: {
          idSchema: {
            $id: 'root',
            $path: []
          }
        }
      },
      {
        title: 'array item (primitive)',
        param: {
          schema: {
            type: 'string'
          },
          parentIdSchema: {
            $id: 'root',
            $path: []
          },
          index: 0
        },
        expected: {
          idSchema: {
            $id: 'root_0',
            $path: ['#0']
          }
        }
      },
      {
        title: 'array with objects',
        param: {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                foo: {
                  type: 'string'
                }
              }
            }
          }
        },
        expected: {
          idSchema: {
            $id: 'root',
            $path: []
          }
        }
      },
      {
        title: 'array item (object)',
        param: {
          schema: {
            type: 'object',
            properties: {
              foo: {
                type: 'string'
              }
            }
          },
          parentIdSchema: {
            $id: 'root',
            $path: []
          },
          index: 0
        },
        expected: {
          idSchema: {
            $id: 'root_0',
            $path: ['#0'],
            foo: {
              $id: 'root_0_foo',
              $path: ['#0', 'foo']
            }
          }
        }
      },
      {
        title: 'array with fixed items',
        param: {
          schema: {
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
          }
        },
        expected: {
          idSchema: {
            $id: 'root',
            $path: []
          }
        }
      }
    ];

    testCases.forEach(testCase => {
      const _test = testCase.skip
        ? test.skip
        : testCase.only
          ? test.only
          : test;
      _test(testCase.title, () => {
        const actual = toIdSchema(testCase.param);
        expect(actual).toEqual(testCase.expected.idSchema);
      });
    });
  });
});
