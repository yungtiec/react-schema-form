describe('Form.test', () => {
  describe('Schema definitions', () => {
    it('should use a single schema definition reference', () => {
      const schema = {
        definitions: {
          testdef: { title: 'TestDef', type: 'string' }
        },
        $ref: '#/definitions/testdef'
      };

      const { queryByText } = createFormComponent({ schema });

      expect(queryByText('TestDef')).toBeInTheDocument();
    });

    it('should handle multiple schema definition references', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string' }
        },
        type: 'object',
        properties: {
          foo: { $ref: '#/definitions/testdef' },
          bar: { $ref: '#/definitions/testdef' }
        }
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll('input[type=text]')).toHaveLength(2);
    });

    it('should handle deeply referenced schema definitions', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string' }
        },
        type: 'object',
        properties: {
          foo: {
            type: 'object',
            properties: {
              bar: { $ref: '#/definitions/testdef' }
            }
          }
        }
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll('input[type=text]')).toHaveLength(1);
    });

    it('should handle references to deep schema definitions', () => {
      const schema = {
        definitions: {
          testdef: {
            type: 'object',
            properties: {
              bar: { title: 'Bar', type: 'string' }
            }
          }
        },
        type: 'object',
        properties: {
          foo: { $ref: '#/definitions/testdef/properties/bar' }
        }
      };

      const { queryByText } = createFormComponent({ schema });

      expect(queryByText('Bar')).toBeInTheDocument();
    });

    it('should handle referenced definitions for array items', () => {
      const schema = {
        definitions: {
          testdef: { title: 'TestDef', type: 'string' }
        },
        type: 'object',
        properties: {
          foo: {
            type: 'array',
            items: { $ref: '#/definitions/testdef' }
          }
        }
      };

      const { queryByText } = createFormComponent({
        schema,
        formData: {
          foo: ['blah']
        }
      });

      expect(queryByText(/^TestDef/)).toBeInTheDocument();
    });

    it('should raise for non-existent definitions referenced', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { $ref: '#/definitions/nonexistent' }
        }
      };

      suppressLogs('error', () => {
        expect(() => createFormComponent({ schema })).toThrowError(Error);
      });
    });

    it('should propagate referenced definition defaults', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string', default: 'hello' }
        },
        $ref: '#/definitions/testdef'
      };

      const { getByValue } = createFormComponent({ schema });

      expect(getByValue('hello')).toBeInTheDocument();
    });

    it('should propagate nested referenced definition defaults', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string', default: 'hello' }
        },
        type: 'object',
        properties: {
          foo: { $ref: '#/definitions/testdef' }
        }
      };

      const { getByValue } = createFormComponent({ schema });

      expect(getByValue('hello')).toBeInTheDocument();
    });

    it('should propagate referenced definition defaults for array items', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string', default: 'hello' }
        },
        type: 'array',
        items: {
          $ref: '#/definitions/testdef'
        }
      };

      const { getByTestId, queryByValue } = createFormComponent({ schema });

      expect(queryByValue('hello')).not.toBeInTheDocument();

      fireEvent.click(getByTestId('add-array-item'));

      expect(queryByValue('hello')).toBeInTheDocument();
    });

    it('should recursively handle referenced definitions', () => {
      const schema = {
        $ref: '#/definitions/node',
        definitions: {
          node: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              children: {
                type: 'array',
                items: {
                  $ref: '#/definitions/node'
                }
              }
            }
          }
        }
      };

      const { queryById, getByTestId } = createFormComponent({ schema });

      expect(queryById('children.0.name')).not.toBeInTheDocument();

      fireEvent.click(getByTestId('add-array-item'));

      expect(queryById('children.0.name')).toBeInTheDocument();
    });

    it('should priorize definition over schema type property', () => {
      // Refs bug #140
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          childObj: {
            type: 'object',
            $ref: '#/definitions/childObj'
          }
        },
        definitions: {
          childObj: {
            title: 'Child Obj',
            type: 'object',
            properties: {
              otherName: { type: 'string' }
            }
          }
        }
      };

      const { queryByText } = createFormComponent({ schema });

      expect(queryByText('Child Obj')).toBeInTheDocument();
    });

    it('should priorize local properties over definition ones', () => {
      // Refs bug #140
      const schema = {
        type: 'object',
        properties: {
          foo: {
            title: 'custom title',
            $ref: '#/definitions/objectDef'
          }
        },
        definitions: {
          objectDef: {
            type: 'object',
            title: 'definition title',
            properties: {
              field: { type: 'string' }
            }
          }
        }
      };

      const { queryByText } = createFormComponent({ schema });

      expect(queryByText('custom title')).toBeInTheDocument();
    });

    it('should propagate and handle a resolved schema definition', () => {
      const schema = {
        definitions: {
          enumDef: { type: 'string', enum: ['a', 'b'] }
        },
        type: 'object',
        properties: {
          name: { $ref: '#/definitions/enumDef' }
        }
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll('option')).toHaveLength(3);
    });
  });

  describe('Changing idPrefix', function() {
    it('should work with oneOf', function() {
      const schema = {
        $schema: 'http://json-schema.org/draft-06/schema#',
        type: 'object',
        properties: {
          connector: {
            type: 'string',
            enum: ['aws', 'gcp'],
            title: 'Provider',
            default: 'aws'
          }
        },
        dependencies: {
          connector: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  connector: {
                    type: 'string',
                    enum: ['aws']
                  },
                  key_aws: {
                    title: 'Key AWS',
                    type: 'string'
                  }
                }
              },
              {
                type: 'object',
                properties: {
                  connector: {
                    type: 'string',
                    enum: ['gcp']
                  },
                  key_gcp: {
                    type: 'string'
                  }
                }
              }
            ]
          }
        }
      };
      const { getByLabelText } = render(
        <Form schema={schema} idPrefix="rjsf" />
      );

      expect(getByLabelText('Key AWS').getAttribute('id')).toBe('rjsf_key_aws');
    });
  });

  describe('schema dependencies', () => {
    const schema = {
      type: 'object',
      properties: {
        branch: {
          type: 'number',
          enum: [1, 2, 3],
          default: 1
        }
      },
      required: ['branch'],
      dependencies: {
        branch: {
          oneOf: [
            {
              properties: {
                branch: {
                  enum: [1]
                },
                field1: {
                  type: 'number'
                }
              },
              required: ['field1']
            },
            {
              properties: {
                branch: {
                  enum: [2]
                },
                field1: {
                  type: 'number'
                },
                field2: {
                  type: 'number'
                }
              },
              required: ['field1', 'field2']
            }
          ]
        }
      }
    };

    it.skip('should only show error for property in selected branch', () => {
      const { getInstance, node } = createFormComponent({
        schema,
        liveValidate: true
      });

      fireEvent.change(node.querySelector('input[type=text]'), {
        target: { value: 'not a number' }
      });

      expect(getInstance().state.errorSchema).toEqual({
        field1: {
          __errors: ['should be number']
        }
      });
    });

    it.skip('should only show errors for properties in selected branch', () => {
      const { getInstance, node } = createFormComponent({
        schema,
        liveValidate: true,
        formData: { branch: 2 }
      });

      fireEvent.change(node.querySelector('input[type=text]'), {
        target: { value: 'not a number' }
      });

      expect(getInstance().state.errorSchema).toEqual({
        field1: {
          __errors: ['should be number']
        },
        field2: {
          __errors: ['is a required property']
        }
      });
    });

    it('should not show any errors when branch is empty', () => {
      suppressLogs('warn', () => {
        const { getInstance, node } = createFormComponent({
          schema,
          liveValidate: true,
          formData: { branch: 3 }
        });
        const select = node.querySelector('select');

        select.value = 3;
        fireEvent.change(select);

        expect(getInstance().state.errorSchema).toEqual({});
      });
    });
  });

  describe('idSchema updates based on formData', () => {
    const schema = {
      type: 'object',
      properties: {
        a: { type: 'string', enum: ['int', 'bool'] }
      },
      dependencies: {
        a: {
          oneOf: [
            {
              properties: {
                a: { enum: ['int'] }
              }
            },
            {
              properties: {
                a: { enum: ['bool'] },
                b: { type: 'boolean' }
              }
            }
          ]
        }
      }
    };

    it('should not update idSchema for a falsey value', () => {
      const formData = { a: 'int' };
      const { rerender, getInstance } = createFormComponent({
        schema,
        formData
      });

      rerender({
        schema: {
          type: 'object',
          properties: {
            a: { type: 'string', enum: ['int', 'bool'] }
          },
          dependencies: {
            a: {
              oneOf: [
                {
                  properties: {
                    a: { enum: ['int'] }
                  }
                },
                {
                  properties: {
                    a: { enum: ['bool'] },
                    b: { type: 'boolean' }
                  }
                }
              ]
            }
          }
        },
        formData: { a: 'int' }
      });

      expect(getInstance().state.idSchema).toEqual({
        $id: 'root',
        a: { $id: 'root_a' }
      });
    });

    it('should update idSchema based on truthy value', () => {
      const formData = {
        a: 'int'
      };
      const { rerender, getInstance } = createFormComponent({
        schema,
        formData
      });
      rerender({
        schema: {
          type: 'object',
          properties: {
            a: { type: 'string', enum: ['int', 'bool'] }
          },
          dependencies: {
            a: {
              oneOf: [
                {
                  properties: {
                    a: { enum: ['int'] }
                  }
                },
                {
                  properties: {
                    a: { enum: ['bool'] },
                    b: { type: 'boolean' }
                  }
                }
              ]
            }
          }
        },
        formData: { a: 'bool' }
      });
      expect(getInstance().state.idSchema).toEqual({
        $id: 'root',
        a: { $id: 'root_a' },
        b: { $id: 'root_b' }
      });
    });
  });
});

describe('ObjectField.test', () => {
  describe('from: fields ordering', () => {
    it('should order referenced schema definitions', () => {
      const refSchema = {
        definitions: {
          testdef: { type: 'string' }
        },
        type: 'object',
        properties: {
          foo: { $ref: '#/definitions/testdef' },
          bar: { $ref: '#/definitions/testdef' }
        }
      };

      const { node } = createFormComponent({
        schema: refSchema,
        uiSchema: {
          'ui:order': ['bar', 'foo']
        }
      });
      const labels = [].map.call(
        node.querySelectorAll('.field > label'),
        l => l.textContent
      );

      expect(labels).toEqual(['bar', 'foo']);
    });

    it('should order referenced object schema definition properties', () => {
      const refSchema = {
        definitions: {
          testdef: {
            type: 'object',
            properties: {
              foo: { type: 'string' },
              bar: { type: 'string' }
            }
          }
        },
        type: 'object',
        properties: {
          root: { $ref: '#/definitions/testdef' }
        }
      };

      const { node } = createFormComponent({
        schema: refSchema,
        uiSchema: {
          root: {
            'ui:order': ['bar', 'foo']
          }
        }
      });
      const labels = [].map.call(
        node.querySelectorAll('.field > label'),
        l => l.textContent
      );

      expect(labels).toEqual(['bar', 'foo']);
    });
  });
});

describe('SchemaField.test', () => {
  describe('from: ui:field support', () => {
    it('should handle referenced schema definitions', () => {
      const schema = {
        definitions: {
          foobar: {
            type: 'object',
            properties: {
              foo: { type: 'string' },
              bar: { type: 'string' }
            }
          }
        },
        $ref: '#/definitions/foobar'
      };
      const uiSchema = { 'ui:field': 'myobject' };
      const fields = { myobject: MyObject };

      const { node } = createFormComponent({ schema, uiSchema, fields });

      expect(node.querySelectorAll('#custom')).toHaveLength(1);
    });
  });

  describe('from: description support', () => {
    it('should render description if available from a referenced schema', () => {
      // Overriding.
      const schemaWithReference = {
        type: 'object',
        properties: {
          foo: { $ref: '#/definitions/foo' },
          bar: { type: 'string' }
        },
        definitions: {
          foo: {
            type: 'string',
            description: 'A Foo field'
          }
        }
      };
      const { node } = createFormComponent({
        schema: schemaWithReference
      });

      const matches = node.querySelectorAll('#root_foo__description');
      expect(matches).toHaveLength(1);
      expect(matches[0].textContent).toBe('A Foo field');
    });
  });
});

describe('utils.test', () => {
  describe('from: nested default', () => {
    it('should use schema default for referenced definitions', () => {
      const schema = {
        definitions: {
          testdef: {
            type: 'object',
            properties: {
              foo: { type: 'number' }
            }
          }
        },
        $ref: '#/definitions/testdef',
        default: { foo: 42 }
      };

      expect(
        getDefaultFormState(schema, undefined, schema.definitions)
      ).toEqual({
        foo: 42
      });
    });
  });

  describe('from: isMultiSelect > schema contains an enum array', () => {
    it('should retrieve reference schema definitions', () => {
      const schema = {
        items: { $ref: '#/definitions/FooItem' },
        uniqueItems: true
      };
      const definitions = {
        FooItem: { type: 'string', enum: ['foo'] }
      };
      expect(isMultiSelect(schema, definitions)).toBe(true);
    });
  });

  describe('from: retrieveSchema()', () => {
    it('should \'resolve\' a schema which contains definitions', () => {
      const schema = { $ref: '#/definitions/address' };
      const address = {
        type: 'object',
        properties: {
          street_address: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' }
        },
        required: ['street_address', 'city', 'state']
      };
      const definitions = { address };

      expect(retrieveSchema(schema, definitions)).toEqual(address);
    });

    it('should \'resolve\' escaped JSON Pointers', () => {
      const schema = { $ref: '#/definitions/a~0complex~1name' };
      const address = { type: 'string' };
      const definitions = { 'a~complex/name': address };

      expect(retrieveSchema(schema, definitions)).toEqual(address);
    });

    it('should priorize local definitions over foreign ones', () => {
      const schema = {
        $ref: '#/definitions/address',
        title: 'foo'
      };
      const address = {
        type: 'string',
        title: 'bar'
      };
      const definitions = { address };

      expect(retrieveSchema(schema, definitions)).toEqual({
        ...address,
        title: 'foo'
      });
    });

    describe('property dependencies', () => {
      describe('false condition', () => {
        it('should not add required properties', () => {
          const schema = {
            type: 'object',
            properties: {
              a: { type: 'string' },
              b: { type: 'integer' }
            },
            required: ['a'],
            dependencies: {
              a: ['b']
            }
          };
          const definitions = {};
          const formData = {};
          expect(retrieveSchema(schema, definitions, formData)).toEqual({
            type: 'object',
            properties: {
              a: { type: 'string' },
              b: { type: 'integer' }
            },
            required: ['a']
          });
        });
      });

      describe('true condition', () => {
        describe('when required is not defined', () => {
          it('should define required properties', () => {
            const schema = {
              type: 'object',
              properties: {
                a: { type: 'string' },
                b: { type: 'integer' }
              },
              dependencies: {
                a: ['b']
              }
            };
            const definitions = {};
            const formData = { a: '1' };
            expect(retrieveSchema(schema, definitions, formData)).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string' },
                b: { type: 'integer' }
              },
              required: ['b']
            });
          });
        });

        describe('when required is defined', () => {
          it('should concat required properties', () => {
            const schema = {
              type: 'object',
              properties: {
                a: { type: 'string' },
                b: { type: 'integer' }
              },
              required: ['a'],
              dependencies: {
                a: ['b']
              }
            };
            const definitions = {};
            const formData = { a: '1' };
            expect(retrieveSchema(schema, definitions, formData)).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string' },
                b: { type: 'integer' }
              },
              required: ['a', 'b']
            });
          });
        });
      });
    });

    describe('schema dependencies', () => {
      describe('conditional', () => {
        describe('false condition', () => {
          it('should not modify properties', () => {
            const schema = {
              type: 'object',
              properties: {
                a: { type: 'string' }
              },
              dependencies: {
                a: {
                  properties: {
                    b: { type: 'integer' }
                  }
                }
              }
            };
            const definitions = {};
            const formData = {};
            expect(retrieveSchema(schema, definitions, formData)).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string' }
              }
            });
          });
        });

        describe('true condition', () => {
          it('should add properties', () => {
            const schema = {
              type: 'object',
              properties: {
                a: { type: 'string' }
              },
              dependencies: {
                a: {
                  properties: {
                    b: { type: 'integer' }
                  }
                }
              }
            };
            const definitions = {};
            const formData = { a: '1' };
            expect(retrieveSchema(schema, definitions, formData)).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string' },
                b: { type: 'integer' }
              }
            });
          });
        });

        describe('with $ref in dependency', () => {
          it('should retrieve referenced schema', () => {
            const schema = {
              type: 'object',
              properties: {
                a: { type: 'string' }
              },
              dependencies: {
                a: {
                  $ref: '#/definitions/needsB'
                }
              }
            };
            const definitions = {
              needsB: {
                properties: {
                  b: { type: 'integer' }
                }
              }
            };
            const formData = { a: '1' };
            expect(retrieveSchema(schema, definitions, formData)).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string' },
                b: { type: 'integer' }
              }
            });
          });
        });
      });

      describe('dynamic', () => {
        describe('false condition', () => {
          it('should not modify properties', () => {
            const schema = {
              type: 'object',
              properties: {
                a: { type: 'string' }
              },
              dependencies: {
                a: {
                  oneOf: [
                    {
                      properties: {
                        a: { enum: ['int'] },
                        b: { type: 'integer' }
                      }
                    },
                    {
                      properties: {
                        a: { enum: ['bool'] },
                        b: { type: 'boolean' }
                      }
                    }
                  ]
                }
              }
            };
            const definitions = {};
            const formData = {};
            expect(retrieveSchema(schema, definitions, formData)).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string' }
              }
            });
          });
        });

        describe('true condition', () => {
          it.skip('should add \'first\' properties given \'first\' data', () => {
            const schema = {
              type: 'object',
              properties: {
                a: { type: 'string', enum: ['int', 'bool'] }
              },
              dependencies: {
                a: {
                  oneOf: [
                    {
                      properties: {
                        a: { enum: ['int'] },
                        b: { type: 'integer' }
                      }
                    },
                    {
                      properties: {
                        a: { enum: ['bool'] },
                        b: { type: 'boolean' }
                      }
                    }
                  ]
                }
              }
            };
            const definitions = {};
            const formData = { a: 'int' };
            expect(retrieveSchema(schema, definitions, formData)).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string', enum: ['int', 'bool'] },
                b: { type: 'integer' }
              }
            });
          });

          it.skip('should add \'second\' properties given \'second\' data', () => {
            const schema = {
              type: 'object',
              properties: {
                a: { type: 'string', enum: ['int', 'bool'] }
              },
              dependencies: {
                a: {
                  oneOf: [
                    {
                      properties: {
                        a: { enum: ['int'] },
                        b: { type: 'integer' }
                      }
                    },
                    {
                      properties: {
                        a: { enum: ['bool'] },
                        b: { type: 'boolean' }
                      }
                    }
                  ]
                }
              }
            };
            const definitions = {};
            const formData = { a: 'bool' };
            expect(retrieveSchema(schema, definitions, formData)).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string', enum: ['int', 'bool'] },
                b: { type: 'boolean' }
              }
            });
          });
        });

        describe('with $ref in dependency', () => {
          it.skip('should retrieve the referenced schema', () => {
            const schema = {
              type: 'object',
              properties: {
                a: { type: 'string', enum: ['int', 'bool'] }
              },
              dependencies: {
                a: {
                  $ref: '#/definitions/typedInput'
                }
              }
            };
            const definitions = {
              typedInput: {
                oneOf: [
                  {
                    properties: {
                      a: { enum: ['int'] },
                      b: { type: 'integer' }
                    }
                  },
                  {
                    properties: {
                      a: { enum: ['bool'] },
                      b: { type: 'boolean' }
                    }
                  }
                ]
              }
            };
            const formData = { a: 'bool' };
            expect(retrieveSchema(schema, definitions, formData)).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string', enum: ['int', 'bool'] },
                b: { type: 'boolean' }
              }
            });
          });
        });
      });
    });
  });

  describe('from: toIdSchema', () => {
    it('should retrieve referenced schema definitions', () => {
      const schema = {
        definitions: {
          testdef: {
            type: 'object',
            properties: {
              foo: { type: 'string' },
              bar: { type: 'string' }
            }
          }
        },
        $ref: '#/definitions/testdef'
      };

      expect(toIdSchema(schema, undefined, schema.definitions)).toEqual({
        $id: 'root',
        foo: { $id: 'root_foo' },
        bar: { $id: 'root_bar' }
      });
    });

    it('should handle idPrefix parameter', () => {
      const schema = {
        definitions: {
          testdef: {
            type: 'object',
            properties: {
              foo: { type: 'string' },
              bar: { type: 'string' }
            }
          }
        },
        $ref: '#/definitions/testdef'
      };

      expect(
        toIdSchema(schema, undefined, schema.definitions, {}, 'rjsf')
      ).toEqual({
        $id: 'rjsf',
        foo: { $id: 'rjsf_foo' },
        bar: { $id: 'rjsf_bar' }
      });
    });
  });
});

describe('ArrayField.test', () => {
  describe('from: List of inputs', () => {
    it('should render enough inputs with proper defaults to match minItems in schema when no formData is set', () => {
      const complexSchema = {
        type: 'object',
        definitions: {
          Thing: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                default: 'Default name'
              }
            }
          }
        },
        properties: {
          foo: {
            type: 'array',
            minItems: 2,
            items: {
              $ref: '#/definitions/Thing'
            }
          }
        }
      };
      let form = createFormComponent({
        schema: complexSchema,
        formData: {}
      });
      let inputs = form.node.querySelectorAll('input[type=text]');
      expect(inputs[0].value).toEqual('Default name');
      expect(inputs[1].value).toEqual('Default name');
    });

    it('should honor given formData, even when it does not meet ths minItems-requirement', () => {
      const complexSchema = {
        type: 'object',
        definitions: {
          Thing: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                default: 'Default name'
              }
            }
          }
        },
        properties: {
          foo: {
            type: 'array',
            minItems: 2,
            items: {
              $ref: '#/definitions/Thing'
            }
          }
        }
      };
      const form = createFormComponent({
        schema: complexSchema,
        formData: { foo: [] }
      });
      const inputs = form.node.querySelectorAll('input[type=text]');
      expect(inputs.length).toEqual(0);
    });
  });
});
