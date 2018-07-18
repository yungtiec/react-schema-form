# React Schema Form

A React library for building forms with schema based on [JSON Schema](http://json-schema.org/).

## Examples

**Simple example**

```js
import React, { Component } from 'react';
import Form from '@react-schema-form/core';
import theme from '@react-schema-form/bootstrap';

class App extends Component {
  schema: {
    title: 'Login',
    type: 'object',
    properties: {
      name: { title: 'Name', type: 'string' },
      email: { title: 'Email', type: 'string' },
      password: { title: 'Password', type: 'string' }
    }
  };

  state = {
    formKey: 0,
    values: {}
  };

  handleSubmit = values => {
    this.setState(prevState => ({ formKey: prevState.formKey + 1, values }));
  };

  render() {
    return (
      <Form
        key={this.state.formKey}
        theme={theme}
        schema={this.schema}
        onSubmit={this.handleSubmit}
      />
    );
  }
}
```

**Example: form with derived fields**

```js
import React, { Component } from 'react';
import Form from '@react-schema-form/core';
import theme from '@react-schema-form/bootstrap';

class App extends Component {
  schema = {
    title: 'Calcs',
    type: 'object',
    properties: {
      a: { type: 'number' },
      b: { type: 'number' },
      sum: { type: 'number', resolver: 'sum' }
    }
  };
  resolvers = {
    sum: {
      arguments: ['a', 'b'],
      resolver: (a, b) => a + b
    }
  };
  state = {
    formKey: 0,
    values: {}
  };

  handleSubmit = values => {...};

  render() {
    return (
      <Form
        key={this.state.formKey}
        theme={theme}
        schema={this.schema}
        resolvers={this.resolvers}
        onSubmit={this.handleSubmit}
      />
    );
  }
}
```

**Example: conditional fields**

```js
import React, { Component } from 'react';
import Form from '@react-schema-form/core';
import theme from '@react-schema-form/bootstrap';

import resolveSchema from './resolveSchema';

class App extends Component {
  state = {
    formKey: 0,
    schema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          enum: ['cs', 'en']
        }
      })
    },
    values: {}
  };

  handleChange = values => {
    this.setState({ values });
  };

  handleBlur = name => {
    /**
     * This is only one of the many solutions
     */
    const { schema: prevSchema, values } = this.state;
    const schema = resolveSchema(prevSchema, values, name);

    if (schema !== prevSchema) {
      this.setState({ schema });
    }
  };

  handleSubmit = () => {
    this.setState(prevState => ({ key: prevState.key + 1 }));
  };

  render() {
    const { formKey, schema, values } = this.state;

    return (
      <Form
        key={formKey}
        theme={theme}
        schema={schema}
        values={values}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        onSubmit={this.handleSubmit}
      />
    );
  }
}
```

## API

**`props.key: any` (required)**

This is the same key as is described in React docs. Here is important if you want to reset the form and call the new instance.

**`props.theme: object` (required)**

This is an object of default UI components (widgets and templates). You can use one of the existing themes like Bootstrap theme.

The core structure of object looks like this:

```js
const theme = {
  widgets: {
    ...
  },
  templates: {
    ...
  }
};
```

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

**`props.values: any`** (optional)

If you use `props.values` then `Form` uses it as the source of values so you must use `onChange` callback too which will save values in a propriate state.

**`props.onChange: (values: any) => void`** (optional)

The handler called on an input event 'change'. It gets all form values.

**`props.onBlur: (entity: { name: string }) => void`** (optional)

The handler called on an input event 'blur'. It gets object describing blurred input.

**`props.onFocus: (entity: { name: string }) => void`** (optional)

The handler called on an input event 'focus'. It gets object describing focused input.

**`props.onSubmit: (values: any) => void`** (optional)

The handler called on an form event 'submit'. It gets all form values.
