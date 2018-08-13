# NOT WORKING YET (it's under development)

# React Schema Form

A React library for building forms based on [JSON Schema](http://json-schema.org/).

## Features

- The core is UI agnostic but you can use themed packages (e.g. `@react-schema-form/bootstrap`)
- derived values
- conditional fields
- debounce fields (timeout, update on Enter or on blur)

## Comparison with [rjsf](https://github.com/mozilla-services/react-jsonschema-form)

_(checkbox indicates the current status: completed/in development, related issue: [Roadmap v1.0.0](https://github.com/MatejMazur/react-schema-form/issues/2))_

- [ ] removed `props.formContext` (user can use custom)
- [ ] registry is an object with only components
- [ ] form instance management is done via [`props.key`](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key)
- [ ] removed support for JSON schema definitions (you can use JavaScript variables)
- [ ] removed support for JSON schema conditionals (oneOf, anyOf,...) (you can use resolvers)
- [ ] added support for resolvers in JSON based schema
- [ ] added `props.resolvers` (conditional fields, derived values)
- [ ] internal formData renamed to values
- [ ] removed `props.formData`
- [ ] added `props.initialValues`
- [ ] UI agnostic (multiple packages with different themes or you can build your custom)
- [ ] removed `props.FieldTemplate`
- [ ] added `props.templates.FieldTemplate`
- [ ] removed `props.ArrayFieldTemplate`
- [ ] added `props.templates.ArrayFieldTemplate`
- [ ] removed `props.ObjectFieldTemplate`
- [ ] added `props.templates.ObjectFieldTemplate`
- [ ] removed `props.ErrorList`
- [ ] added `props.templates.ErrorListTemplate`
- [ ] removed `props.fields.TitleField`
- [ ] added `props.templates.TitleTemplate`
- [ ] removed `props.fields.DescriptionField`
- [ ] added `props.templates.DescriptionTemplate`
- [ ] removed `props.children`
- [ ] added `props.templates.SubmitTemplate`
- [ ] internal merge of `NormalArrayFieldTemplate` with `FixedArrayFieldTemplate`
- [ ] internal change of `rawErrors` to `errors`
- [ ] internal change of `rawHelp` to `help`
- [ ] uiSchema:
  - [ ] added `ui:FieldTemplate`
  - [ ] added `ui:ArrayFieldTemplate`
  - [ ] added `ui:ObjectFieldTemplate`
- [ ] removed `safeRenderCompletion` (this was an ugly heck! we should find out a better approach)

## Examples

### Simple example

```js
import React, { Component } from 'react';
import Form from '@react-schema-form/bootstrap';

const schema = {
  title: 'Login',
  type: 'object',
  properties: {
    name: { title: 'Name', type: 'string' },
    email: { title: 'Email', type: 'string' },
    password: { title: 'Password', type: 'string' }
  }
};

class App extends Component {
  state = {
    formKey: 0
  };

  handleSubmit = values => {
    // print values
    console.log(values);
    // reset the form
    this.setState(prevState => ({ formKey: prevState.formKey + 1 }));
  };

  render() {
    return (
      <Form
        key={this.state.formKey}
        schema={schema}
        onSubmit={this.handleSubmit}
      />
    );
  }
}
```

### Example: form with derived fields

**Solution with an external resolver:**

```js
import React, { Component } from 'react';
import Form from '@react-schema-form/bootstrap';

const schema = {
  title: 'Calcs',
  type: 'object',
  properties: {
    a: { type: 'number' },
    b: { type: 'number' },
    sum: {
      type: 'number',
      resolver: 'sum'
    }
  }
};

const resolvers = {
  sum: {
    selectors: [values => values.a, values => values.b],
    values: (a, b) => a + b
  }
};

class App extends Component {
  state = {
    formKey: 0,
    values: {}
  };

  handleSubmit = values => {
    console.log(values);
    this.setState(prevState => ({
      formKey: prevState.formKey + 1
    }));
  };

  render() {
    return (
      <Form
        key={this.state.formKey}
        schema={schema}
        resolvers={resolvers}
        onSubmit={this.handleSubmit}
      />
    );
  }
}
```

**Solution with an internal resolver:**

```js
import React, { Component } from 'react';
import Form from '@react-schema-form/bootstrap';

const schema = {
  title: 'Calcs',
  type: 'object',
  properties: {
    a: { type: 'number' },
    b: { type: 'number' },
    sum: {
      type: 'number',
      resolver: {
        selectors: [values => values.a, values => values.b],
        values: (a, b) => a + b
      }
    }
  }
};

class App extends Component {
  state = {
    formKey: 0,
    values: {}
  };

  handleSubmit = values => {
    console.log(values);
    this.setState(prevState => ({
      formKey: prevState.formKey + 1
    }));
  };

  render() {
    return (
      <Form
        key={this.state.formKey}
        schema={schema}
        onSubmit={this.handleSubmit}
      />
    );
  }
}
```

### Example: conditional fields

```js
import React, { Component } from 'react';
import Form from '@react-schema-form/bootstrap';

const schema = {
  type: 'object',
  properties: {
    hasName: {
      title: 'Show name?',
      type: 'boolean'
    },
    name: {
      resolver: 'schema.name',
      title: 'Name',
      type: 'string'
    },
    locationCountry: {
      title: 'Where do you live?',
      type: 'string',
      enum: ['us', 'nordic', 'other'],
      enumNames: ['US', 'Nordic country', 'Other']
    },
    location: {
      title: 'Location',
      type: 'object',
      resolver: {
        selectors: [values => values.locationCountry],
        schema: locationCountry => {
          const city = {
            title: 'City',
            type: 'string'
          };
          const region = {
            title: 'Region',
            type: 'string'
          };
          return {
            properties: {
              us: {
                state: {
                  title: 'State',
                  type: 'string',
                  enum: ['AL', 'AK', 'AZ'],
                  enumNames: ['Alabama', 'Alaska', 'Arizona']
                },
                city,
                region
              },
              nordic: {
                country: {
                  title: 'Country',
                  type: 'string',
                  enum: ['de', 'fi', 'is', 'no', 'sv'],
                  enumNames: [
                    'Denmark',
                    'Finland',
                    'Iceland',
                    'Norway',
                    'Sweden'
                  ]
                },
                city,
                region
              },
              other: {
                country: {
                  title: 'Country',
                  type: 'string'
                },
                city,
                region
              }
            }[locationCountry]
          };
        }
      }
    }
  }
};

class App extends Component {
  state = {
    formKey: 0
  };

  handleSubmit = () => {
    console.log(this.state.values);
    this.setState(prevState => ({
      formKey: prevState.formKey + 1
    }));
  };

  render() {
    return (
      <Form
        key={this.state.formKey}
        schema={schema}
        resolvers={resolvers}
        onSubmit={this.handleSubmit}
      />
    );
  }
}
```

## Custom validation

```js
const schema = {
  title: 'sign in',
  type: 'object',
  properties: {
    username: {
      type: 'string'
    },
    pass1: {
      title: 'password',
      type: 'string',
      minLength: 3
    },
    pass2: {
      title: 'repeat password',
      type: 'string'
      minLength: 3,
      validate: {
        condition: (value, values) => value === values.pass1,
        error: `password don't match`
      }
    }
  }
};
```

## API

**`props.key: any` (required)**

This is the same key as is described in React docs. Here is important if you want to reset the form and call the new instance.

**`props.schema: object` (required)**

This is the form schema based on JSON Schema standard.

**`props.uiSchema: object`** (optional)

This schema describes UI specific properties of form entities.

**`props.fields: object`** (optional)

With this prop you can add new or rewrite existing fields in a form.

A _field_ usually wraps one or more widgets and most often handles internal field state; think of a field as a form row, including the labels.

The default fields included in `Form`:

```js
const coreFields = {
  ArrayField,
  BooleanField,
  ObjectField,
  NumberField,
  SchemaField,
  StringField
};
```

**`props.widgets: object`** (optional)

With this prop you can add new or rewrite existing widgets in a form.

A _widget_ represents a HTML tag for the user to enter data, eg. input, select, etc.

These are the widgets of Bootstrap grouped by types:

```js
const widgetMap = {
  boolean: {
    checkbox: 'CheckboxWidget',
    radio: 'RadioWidget',
    select: 'SelectWidget',
    hidden: 'HiddenWidget'
  },
  string: {
    text: 'TextWidget',
    password: 'PasswordWidget',
    email: 'EmailWidget',
    hostname: 'TextWidget',
    ipv4: 'TextWidget',
    ipv6: 'TextWidget',
    uri: 'URLWidget',
    'data-url': 'FileWidget',
    radio: 'RadioWidget',
    select: 'SelectWidget',
    textarea: 'TextareaWidget',
    hidden: 'HiddenWidget',
    date: 'DateWidget',
    datetime: 'DateTimeWidget',
    'date-time': 'DateTimeWidget',
    'alt-date': 'AltDateWidget',
    'alt-datetime': 'AltDateTimeWidget',
    color: 'ColorWidget',
    file: 'FileWidget'
  },
  number: {
    text: 'TextWidget',
    select: 'SelectWidget',
    updown: 'UpDownWidget',
    range: 'RangeWidget',
    radio: 'RadioWidget',
    hidden: 'HiddenWidget'
  },
  integer: {
    text: 'TextWidget',
    select: 'SelectWidget',
    updown: 'UpDownWidget',
    range: 'RangeWidget',
    radio: 'RadioWidget',
    hidden: 'HiddenWidget'
  },
  array: {
    select: 'SelectWidget',
    checkboxes: 'CheckboxesWidget',
    files: 'FileWidget'
  }
};
```

**`props.templates: object`** (optional)

With this prop you can add new or rewrite existing templates in a form.

A _template_ represents a HTML tags around the fields and all other UI components needed for a form.

These are the main templates:

```js
const templates = {
  ArrayFieldTemplate,
  DescriptionTemplate,
  ErrorListTemplate,
  FieldTemplate,
  ObjectFieldTemplate,
  SubmitTemplate,
  TitleTemplate
};
```

**`props.initialValues: any`** (optional)

It sets the initial values in a form.

**`props.onChange: (values: any) => void`** (optional)

The handler called on an input event 'change'. It gets all form values.

**`props.onBlur: (entity: { name: string }) => void`** (optional)

The handler called on an input event 'blur'. It gets object describing blurred input.

**`props.onFocus: (entity: { name: string }) => void`** (optional)

The handler called on an input event 'focus'. It gets object describing focused input.

**`props.onSubmit: (values: any) => void`** (optional)

The handler called on an form event 'submit'. It gets all form values.
