# React Schema Form

A React library for building forms based on schema.
It's inspired by this article where React core developers explain how you should solve state in components -> the solution can be controlled components. So rather then storing state inside of the `Form` component you just use this component same as the controlled inputs:

```js
// controlled input
<input value={value} onChange={handleChange} />

// controlled form
<Form values={values} onChange={handleChange} />
```

### Example

```js
import React from 'react';
import Form from '@react-schema-form/core';
import theme from '@react-schema-form/bootstrap';

class App extends React.Component {
  state = {
    schema: {...},
    uiSchema: {...},
    values: {...},
    errors: []
  }

  handleChange = data => {
    this.setState({ data })
  }

  handleError = error => {
    ...WIP
  }

  validate = (data, errors) => {
    ...WIP
  }

  render() {
    const { schema, uiSchema, data } = this.state;

    return (
      <Form
        theme={theme}
        schema={schema}
        uiSchema={uiSchema}
        values={values}
        onChange={this.handleChange}
      />
    );
  }
}
```

### Inspiration

- [`react-jsonschema-form`](https://github.com/mozilla-services/react-jsonschema-form)
