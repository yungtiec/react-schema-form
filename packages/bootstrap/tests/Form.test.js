import React from 'react';
import { render, fireEvent, wait, within } from 'react-testing-library';

import Form from '../src';
import { createFormComponent, suppressLogs } from './test_utils';

describe('Form', () => {
  describe('Empty schema', () => {
    it('should render a form tag', () => {
      const { node } = createFormComponent({ schema: {} });

      expect(node.tagName).toEqual('FORM');
    });

    it('should render a submit button', () => {
      const { queryByText } = createFormComponent({ schema: {} });

      expect(queryByText('Submit')).toBeInTheDocument();
    });

    it('should render children buttons', () => {
      const props = { schema: {} };
      const { queryByText } = render(
        <Form {...props}>
          <button type="submit">Submit</button>
          <button type="submit">Another submit</button>
        </Form>
      );

      expect(queryByText('Submit')).toBeInTheDocument();
      expect(queryByText('Another submit')).toBeInTheDocument();
    });
  });

  describe('Option idPrefix', function() {
    it('should change the rendered ids', function() {
      const schema = {
        type: 'object',
        title: 'root object',
        required: ['foo'],
        properties: {
          count: {
            title: 'Count',
            type: 'number'
          }
        }
      };
      const { getByLabelText } = render(
        <Form schema={schema} idPrefix="rjsf" />
      );

      expect(getByLabelText('Count').getAttribute('id')).toBe('rjsf_count');
    });
  });

  describe('Custom field template', () => {
    const schema = {
      type: 'object',
      title: 'root object',
      required: ['foo'],
      properties: {
        foo: {
          title: 'Foo',
          type: 'string',
          description: 'this is description',
          minLength: 32
        }
      }
    };

    const uiSchema = {
      foo: {
        'ui:help': 'this is help'
      }
    };

    const formData = { foo: 'invalid' };

    function FieldTemplate(props) {
      const {
        id,
        classNames,
        label,
        help,
        required,
        description,
        rawDescription,
        errors,
        children
      } = props;
      return (
        <div className={classNames} data-testid="my-template">
          <label htmlFor={id} className="my-template__label">
            {label}
            {required ? '*' : null}
          </label>
          {description}
          {children}
          <span data-testid="help">{help}</span>
          <span data-testid="raw-description">
            {`${rawDescription} rendered from the raw format`}
          </span>
          {errors ? (
            <ul>
              {errors.map((error, i) => (
                <li key={i} data-testid="error">
                  {error}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      );
    }
    const renderForm = () =>
      createFormComponent({
        schema,
        uiSchema,
        formData,
        templates: { FieldTemplate },
        liveValidate: true
      });

    it('should use the provided field template', () => {
      const { queryByTestId } = renderForm();
      expect(queryByTestId('my-template')).toBeInTheDocument();
    });

    it('should use the provided template for labels', () => {
      const { getByText } = renderForm();
      expect(getByText(/^root object/)).toHaveClass('my-template__label');
      expect(getByText(/^Foo/)).toHaveClass('my-template__label');
    });

    it('should pass description as the provided React element', () => {
      const { node } = renderForm();
      expect(node.querySelector('#root_foo__description')).toHaveTextContent(
        'this is description'
      );
    });

    it('should pass rawDescription as a string', () => {
      const { queryByTestId } = renderForm();
      expect(queryByTestId('raw-description')).toBeInTheDocument();
    });

    it('should pass rawErrors as an array of strings', () => {
      const { queryAllByTestId } = renderForm();
      expect(queryAllByTestId('error')).toHaveLength(1);
    });

    it('should pass help as the string', () => {
      const { getByText } = renderForm();
      expect(getByText('this is help')).toBeInTheDocument();
    });
  });

  describe('Custom submit buttons', () => {
    it('should submit the form when clicked', async () => {
      const onSubmit = jest.fn();
      const { getByText } = render(
        <Form onSubmit={onSubmit} schema={{}}>
          <button type="submit">Submit</button>
          <button type="submit">Another submit</button>
        </Form>
      );

      /**
       * From some of the reason this doesn't work with wait()
       */
      fireEvent.click(getByText('Submit'));
      fireEvent.click(getByText('Another submit'));

      await new Promise(setImmediate);

      expect(onSubmit).toHaveBeenCalledTimes(2);
    });
  });

  describe('Default value handling on clear', () => {
    const schema = {
      title: 'Foo',
      type: 'string',
      default: 'foo'
    };

    it('should not set default when a text field is cleared', () => {
      const { getByLabelText } = createFormComponent({
        schema,
        formData: 'bar'
      });
      const input = getByLabelText('Foo');

      input.value = '';
      fireEvent.change(input);

      expect(input.value).toBe('');
    });
  });

  describe('Defaults array items default propagation', () => {
    const schema = {
      type: 'object',
      title: 'lvl 1 obj',
      properties: {
        object: {
          type: 'object',
          title: 'lvl 2 obj',
          properties: {
            array: {
              type: 'array',
              items: {
                type: 'object',
                title: 'lvl 3 obj',
                properties: {
                  bool: {
                    type: 'boolean',
                    default: true
                  }
                }
              }
            }
          }
        }
      }
    };

    it('should propagate deeply nested defaults to form state', async () => {
      const { getInstance, node, getByTestId } = createFormComponent({
        schema
      });

      fireEvent.click(getByTestId('add-array-item'));

      await wait(() => {
        fireEvent.submit(node);
      });

      expect(getInstance().state.formData).toEqual({
        object: {
          array: [{ bool: true }]
        }
      });
    });
  });

  describe('Submit handler', () => {
    it('should call provided submit handler with form state', async () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' }
        }
      };
      const formData = {
        foo: 'bar'
      };
      const onSubmit = jest.fn();
      const { getInstance, node } = createFormComponent({
        schema,
        formData,
        onSubmit
      });

      await wait(() => {
        fireEvent.submit(node);
      });

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining(getInstance().state)
      );
    });

    it('should not call provided submit handler on validation errors', async () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
            minLength: 1
          }
        }
      };
      const formData = {
        foo: ''
      };
      const onSubmit = jest.fn();
      const onError = jest.fn();
      const { node } = createFormComponent({
        schema,
        formData,
        onSubmit,
        onError
      });

      await wait(() => {
        fireEvent.submit(node);
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Change handler', () => {
    it('should call provided change handler on form state change', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            title: 'Foo',
            type: 'string'
          }
        }
      };
      const formData = {
        foo: ''
      };
      const onChange = jest.fn();
      const { getByLabelText } = createFormComponent({
        schema,
        formData,
        onChange
      });
      const input = getByLabelText('Foo');

      fireEvent.change(input, { target: { value: 'new' } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ formData: { foo: 'new' } })
      );
    });
  });

  describe('Blur handler', () => {
    it('should call provided blur handler on form input blur event', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            title: 'Foo',
            type: 'string'
          }
        }
      };
      const formData = {
        foo: ''
      };
      const onBlur = jest.fn();
      const { getByLabelText } = createFormComponent({
        schema,
        formData,
        onBlur
      });

      const input = getByLabelText('Foo');

      input.value = 'new';
      fireEvent.blur(input);

      expect(onBlur).toHaveBeenCalledWith(input.id, 'new');
    });
  });

  describe('Focus handler', () => {
    it('should call provided focus handler on form input focus event', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            title: 'Foo',
            type: 'string'
          }
        }
      };
      const formData = {
        foo: ''
      };
      const onFocus = jest.fn();
      const { getByLabelText } = createFormComponent({
        schema,
        formData,
        onFocus
      });

      const input = getByLabelText('Foo');

      input.value = 'new';
      fireEvent.focus(input);

      expect(onFocus).toHaveBeenCalledWith(input.id, 'new');
    });
  });

  describe('Error handler', () => {
    it('should call provided error handler on validation errors', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            title: 'Foo',
            type: 'string',
            minLength: 1
          }
        }
      };
      const formData = {
        foo: ''
      };
      const onError = jest.fn();
      const { node } = createFormComponent({ schema, formData, onError });

      fireEvent.submit(node);

      expect(onError).toHaveBeenCalledTimes(1);
    });
  });

  describe('External formData updates', () => {
    describe('root level', () => {
      const formProps = {
        schema: { type: 'string' },
        liveValidate: true
      };

      it('should update form state from new formData prop value', () => {
        const { rerender, getInstance } = createFormComponent(formProps);

        rerender({ formData: 'yo' });
        // rerender({ formData: 'yo' });

        expect(getInstance().state.formData).toBe('yo');
      });

      it('should validate formData when the schema is updated', () => {
        const { rerender, getInstance } = createFormComponent(formProps);

        rerender({
          formData: 'yo',
          schema: { type: 'number' }
        });

        expect(getInstance().state.errors).toHaveLength(1);
        expect(getInstance().state.errors[0].stack).toEqual('should be number');
      });
    });

    describe('object level', () => {
      it('should update form state from new formData prop value', () => {
        const { rerender, getInstance } = createFormComponent({
          schema: {
            type: 'object',
            properties: {
              foo: {
                type: 'string'
              }
            }
          }
        });

        rerender({ formData: { foo: 'yo' } });

        expect(getInstance().state.formData).toEqual({ foo: 'yo' });
      });
    });

    describe('array level', () => {
      it('should update form state from new formData prop value', () => {
        const schema = {
          type: 'array',
          items: {
            type: 'string'
          }
        };
        const { rerender, getInstance } = createFormComponent({ schema });

        rerender({ formData: ['yo'] });

        expect(getInstance().state.formData).toEqual(['yo']);
      });
    });
  });

  describe('Error contextualization', () => {
    describe('on form state updated', () => {
      const schema = {
        title: 'Foo',
        type: 'string',
        minLength: 8
      };

      describe('Lazy validation', () => {
        it('should not update the errorSchema when the formData changes', () => {
          const { getInstance, getByLabelText } = createFormComponent({
            schema
          });
          const input = getByLabelText('Foo');

          input.value = 'short';
          fireEvent.change(input);

          expect(getInstance().state.errorSchema).toEqual({});
        });

        it('should not denote an error in the field', () => {
          const { getByLabelText, node } = createFormComponent({
            schema
          });
          const input = getByLabelText('Foo');

          input.value = 'short';
          fireEvent.change(input);

          expect(node.querySelectorAll('.field-error')).toHaveLength(0);
        });

        it('should clean contextualized errors up when they\'re fixed', () => {
          const altSchema = {
            type: 'object',
            properties: {
              field1: { title: 'Field 1', type: 'string', minLength: 8 },
              field2: { title: 'Field 2', type: 'string', minLength: 8 }
            }
          };
          const { node, getByLabelText } = createFormComponent({
            schema: altSchema,
            formData: {
              field1: 'short',
              field2: 'short'
            }
          });
          const form = node;
          const field1 = getByLabelText('Field 1');
          const field2 = getByLabelText('Field 2');

          function submit(node) {
            suppressLogs('error', () => {
              fireEvent.submit(node);
            });
          }

          submit(form);

          // Fix the first field
          fireEvent.change(field1, { target: { value: 'fixed error' } });
          submit(form);

          expect(node.querySelectorAll('.field-error')).toHaveLength(1);

          // Fix the second field
          fireEvent.change(field2, { target: { value: 'fixed error too' } });
          submit(form);

          // No error remaining, shouldn't throw.
          fireEvent.submit(form);

          expect(node.querySelectorAll('.field-error')).toHaveLength(0);
        });
      });

      describe('Live validation', () => {
        it('should update the errorSchema when the formData changes', () => {
          const { getInstance, getByLabelText } = createFormComponent({
            schema,
            liveValidate: true
          });
          const input = getByLabelText('Foo');

          fireEvent.change(input, { target: { value: 'short' } });

          expect(getInstance().state.errorSchema).toEqual({
            __errors: ['should NOT be shorter than 8 characters']
          });
        });

        it('should denote the new error in the field', () => {
          const {
            getByLabelText,
            queryAllByTestId,
            queryByText
          } = createFormComponent({
            schema,
            liveValidate: true
          });
          const input = getByLabelText('Foo');

          fireEvent.change(input, { target: { value: 'short' } });

          expect(queryAllByTestId('error-detail__item')).toHaveLength(1);
          expect(
            queryByText('should NOT be shorter than 8 characters')
          ).toBeInTheDocument();
        });
      });

      describe('Disable validation onChange event', () => {
        it('should not update errorSchema when the formData changes', () => {
          const { getInstance, getByLabelText } = createFormComponent({
            schema,
            noValidate: true,
            liveValidate: true
          });
          const input = getByLabelText('Foo');

          input.value = 'short';
          fireEvent.change(input);

          expect(getInstance().state.errorSchema).toEqual({});
        });
      });

      describe('Disable validation onSubmit event', () => {
        it('should not update errorSchema when the formData changes', () => {
          const { getInstance, getByLabelText, node } = createFormComponent({
            schema,
            noValidate: true
          });
          const input = getByLabelText('Foo');

          input.value = 'short';
          fireEvent.change(input);

          fireEvent.submit(node);

          expect(getInstance().state.errorSchema).toEqual({});
        });
      });
    });

    describe('on form submitted', () => {
      const schema = {
        title: 'Foo',
        type: 'string',
        minLength: 8
      };

      it('should update the errorSchema on form submission', () => {
        const { getInstance, getByLabelText, node } = createFormComponent({
          schema,
          onError: () => {}
        });
        const input = getByLabelText('Foo');

        fireEvent.change(input, { target: { value: 'short' } });

        fireEvent.submit(node);

        expect(getInstance().state.errorSchema).toEqual({
          __errors: ['should NOT be shorter than 8 characters']
        });
      });

      it('should call the onError handler', async () => {
        const onError = jest.fn();
        const { node, getByLabelText } = createFormComponent({
          schema,
          onError
        });
        const input = getByLabelText('Foo');

        fireEvent.change(input, { target: { value: 'short' } });

        fireEvent.submit(node);

        expect(onError).toHaveBeenCalledWith([
          expect.objectContaining({
            message: 'should NOT be shorter than 8 characters'
          })
        ]);
      });

      it('should reset errors and errorSchema state to initial state after correction and resubmission', () => {
        const onError = jest.fn();
        const { getInstance, node, getByLabelText } = createFormComponent({
          schema,
          onError
        });
        const input = getByLabelText('Foo');

        fireEvent.change(input, { target: { value: 'short' } });

        fireEvent.submit(node);

        expect(getInstance().state.errorSchema).toEqual({
          __errors: ['should NOT be shorter than 8 characters']
        });
        expect(getInstance().state.errors).toHaveLength(1);

        expect(onError).toHaveBeenCalledTimes(1);

        fireEvent.change(input, { target: { value: 'long enough' } });

        fireEvent.submit(node);

        expect(getInstance().state.errorSchema).toEqual({});
        expect(getInstance().state.errors).toEqual([]);

        expect(onError).toHaveBeenCalledTimes(1);
      });
    });

    describe('root level', () => {
      const formProps = {
        liveValidate: true,
        schema: {
          type: 'string',
          minLength: 8
        },
        formData: 'short'
      };

      it('should reflect the contextualized error in state', () => {
        const { getInstance } = createFormComponent(formProps);

        expect(getInstance().state.errorSchema).toEqual({
          __errors: ['should NOT be shorter than 8 characters']
        });
      });

      it('should denote the error in the field', () => {
        const { queryByText, queryAllByTestId } = createFormComponent(
          formProps
        );

        expect(queryAllByTestId('error-detail__item')).toHaveLength(1);
        expect(
          queryByText('should NOT be shorter than 8 characters')
        ).toBeInTheDocument();
      });
    });

    describe('root level with multiple errors', () => {
      const formProps = {
        liveValidate: true,
        schema: {
          type: 'string',
          minLength: 8,
          pattern: 'd+'
        },
        formData: 'short'
      };

      it('should reflect the contextualized error in state', () => {
        const { getInstance } = createFormComponent(formProps);
        expect(getInstance().state.errorSchema).toEqual({
          __errors: [
            'should NOT be shorter than 8 characters',
            'should match pattern "d+"'
          ]
        });
      });

      it('should denote the error in the field', () => {
        const { queryByText, queryAllByTestId } = createFormComponent(
          formProps
        );

        expect(queryAllByTestId('error-detail__item')).toHaveLength(2);
        expect(
          queryByText('should NOT be shorter than 8 characters')
        ).toBeInTheDocument();
        expect(queryByText('should match pattern "d+"')).toBeInTheDocument();
      });
    });

    describe('nested field level', () => {
      const schema = {
        type: 'object',
        properties: {
          level1: {
            type: 'object',
            properties: {
              level2: {
                type: 'string',
                minLength: 8
              }
            }
          }
        }
      };

      const formProps = {
        schema,
        liveValidate: true,
        formData: {
          level1: {
            level2: 'short'
          }
        }
      };

      it('should reflect the contextualized error in state', () => {
        const { getInstance } = createFormComponent(formProps);

        expect(getInstance().state.errorSchema).toEqual({
          level1: {
            level2: { __errors: ['should NOT be shorter than 8 characters'] }
          }
        });
      });

      it('should denote the error in the field', () => {
        const { queryByTitle } = createFormComponent(formProps);

        expect(
          within(queryByTitle('level2')).queryByText(
            'should NOT be shorter than 8 characters'
          )
        ).toBeInTheDocument();
      });
    });

    describe('array indices', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'string',
          minLength: 4
        }
      };

      const formProps = {
        schema,
        liveValidate: true,
        formData: ['good', 'bad', 'good']
      };

      it('should contextualize the error for array indices', () => {
        const { getInstance } = createFormComponent(formProps);

        expect(getInstance().state.errorSchema).toEqual({
          1: {
            __errors: ['should NOT be shorter than 4 characters']
          }
        });
      });

      it('should denote the error in the item field in error', () => {
        const { queryById } = createFormComponent(formProps);

        expect(
          within(queryById('1')).queryByText(
            'should NOT be shorter than 4 characters'
          )
        ).toBeInTheDocument();
      });

      it('should not denote errors on non impacted fields', () => {
        const { node } = createFormComponent(formProps);
        const fieldNodes = node.querySelectorAll('.field-string');

        expect(fieldNodes[0]).not.toHaveClass('field-error');
        expect(fieldNodes[2]).not.toHaveClass('field-error');
      });
    });

    describe('nested array indices', () => {
      const schema = {
        type: 'object',
        properties: {
          level1: {
            type: 'array',
            items: {
              type: 'string',
              minLength: 4
            }
          }
        }
      };

      const formProps = { schema, liveValidate: true };

      it('should contextualize the error for nested array indices', () => {
        const { getInstance } = createFormComponent({
          ...formProps,
          formData: {
            level1: ['good', 'bad', 'good', 'bad']
          }
        });

        expect(getInstance().state.errorSchema).toEqual({
          level1: {
            1: {
              __errors: ['should NOT be shorter than 4 characters']
            },
            3: {
              __errors: ['should NOT be shorter than 4 characters']
            }
          }
        });
      });

      it('should denote the error in the nested item field in error', () => {
        const { queryByText } = createFormComponent({
          ...formProps,
          formData: {
            level1: ['good', 'bad', 'good']
          }
        });

        expect(
          queryByText('should NOT be shorter than 4 characters')
        ).toBeInTheDocument();
      });
    });

    describe('nested arrays', () => {
      const schema = {
        type: 'object',
        properties: {
          outer: {
            type: 'array',
            items: {
              type: 'array',
              items: {
                type: 'string',
                minLength: 4
              }
            }
          }
        }
      };

      const formData = {
        outer: [['good', 'bad'], ['bad', 'good']]
      };

      const formProps = { schema, formData, liveValidate: true };

      it('should contextualize the error for nested array indices', () => {
        const { getInstance } = createFormComponent(formProps);

        expect(getInstance().state.errorSchema).toEqual({
          outer: {
            0: {
              1: {
                __errors: ['should NOT be shorter than 4 characters']
              }
            },
            1: {
              0: {
                __errors: ['should NOT be shorter than 4 characters']
              }
            }
          }
        });
      });

      it('should denote the error in the nested item field in error', () => {
        const { queryById } = createFormComponent(formProps);

        expect(
          within(queryById('outer.0.0')).queryByTestId('error-detail__item')
        ).not.toBeInTheDocument();
        expect(
          within(queryById('outer.0.1')).queryByText(
            'should NOT be shorter than 4 characters'
          )
        ).toBeInTheDocument();
        expect(
          within(queryById('outer.1.0')).queryByText(
            'should NOT be shorter than 4 characters'
          )
        ).toBeInTheDocument();
        expect(
          within(queryById('outer.1.1')).queryByTestId('error-detail__item')
        ).not.toBeInTheDocument();
      });
    });

    describe('array nested items', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            foo: {
              type: 'string',
              minLength: 4
            }
          }
        }
      };

      const formProps = {
        schema,
        liveValidate: true,
        formData: [{ foo: 'good' }, { foo: 'bad' }, { foo: 'good' }]
      };

      it('should contextualize the error for array nested items', () => {
        const { getInstance } = createFormComponent(formProps);

        expect(getInstance().state.errorSchema).toEqual({
          1: {
            foo: {
              __errors: ['should NOT be shorter than 4 characters']
            }
          }
        });
      });

      it('should denote the error in the array nested item', () => {
        const { queryById } = createFormComponent(formProps);

        expect(
          within(queryById('1.foo')).queryByText(
            'should NOT be shorter than 4 characters'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('Schema and formData updates', () => {
    // https://github.com/mozilla-services/react-jsonschema-form/issues/231
    const schema = {
      type: 'object',
      properties: {
        foo: { title: 'Foo', type: 'string' },
        bar: { title: 'Bar', type: 'string' }
      }
    };

    it('should replace state when formData have keys removed', () => {
      const formData = { foo: 'foo', bar: 'bar' };
      const { rerender, getInstance, getByLabelText } = createFormComponent({
        schema,
        formData
      });
      const inputBar = getByLabelText('Bar');

      rerender({
        schema: {
          type: 'object',
          properties: {
            bar: { title: 'Bar', type: 'string' }
          }
        },
        formData: { bar: 'bar' }
      });

      fireEvent.change(inputBar, { target: { value: 'baz' } });

      expect(getInstance().state.formData).toEqual({ bar: 'baz' });
    });

    it('should replace state when formData keys have changed', () => {
      const formData = { foo: 'foo', bar: 'bar' };
      const { rerender, getInstance, getByLabelText } = createFormComponent({
        schema,
        formData
      });

      rerender({
        schema: {
          type: 'object',
          properties: {
            foo: { type: 'string' },
            baz: { title: 'Baz', type: 'string' }
          }
        },
        formData: { foo: 'foo', baz: 'bar' }
      });
      const inputBaz = getByLabelText('Baz');

      fireEvent.change(inputBaz, { target: { value: 'baz' } });

      expect(getInstance().state.formData).toEqual({ foo: 'foo', baz: 'baz' });
    });
  });

  describe('Attributes', () => {
    const formProps = {
      schema: {},
      id: 'test-form',
      className: 'test-class other-class',
      name: 'testName',
      method: 'post',
      target: '_blank',
      action: '/users/list',
      autocomplete: 'off',
      enctype: 'multipart/form-data',
      acceptcharset: 'ISO-8859-1',
      noHtml5Validate: true
    };

    let form;

    beforeEach(() => {
      form = createFormComponent(formProps).node;
    });

    it('should set attr id of form', () => {
      expect(form.getAttribute('id')).toEqual(formProps.id);
    });

    it('should set attr class of form', () => {
      expect(form.getAttribute('class')).toEqual(formProps.className);
    });

    it('should set attr name of form', () => {
      expect(form.getAttribute('name')).toEqual(formProps.name);
    });

    it('should set attr method of form', () => {
      expect(form.getAttribute('method')).toEqual(formProps.method);
    });

    it('should set attr target of form', () => {
      expect(form.getAttribute('target')).toEqual(formProps.target);
    });

    it('should set attr action of form', () => {
      expect(form.getAttribute('action')).toEqual(formProps.action);
    });

    it('should set attr autoComplete of form', () => {
      expect(form.getAttribute('autocomplete')).toEqual(formProps.autocomplete);
    });

    it('should set attr enctype of form', () => {
      expect(form.getAttribute('enctype')).toEqual(formProps.enctype);
    });

    it('should set attr acceptcharset of form', () => {
      expect(form.getAttribute('accept-charset')).toEqual(
        formProps.acceptcharset
      );
    });

    it('should set attr novalidate of form', () => {
      expect(form.getAttribute('novalidate')).not.toBeNull();
    });
  });
});
