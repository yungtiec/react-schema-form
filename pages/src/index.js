import React from 'react';
import { render } from 'react-dom';

import Form from '@react-schema-form/bootstrap';

const schema = {
  type: 'object',
  properties: {
    foo: {
      type: 'string'
    }
  }
};

const uiSchema = {
  foo: {
    'ui:help': <p>This is a paragraph</p>
  }
};

class App extends React.Component {
  state = {
    values: {}
  };

  handleSubmit = values => {
    this.setState({ values });
  };

  render() {
    return (
      <Form schema={schema} uiSchema={uiSchema} onSubmit={this.handleSubmit} />
    );
  }
}

render(<App />, document.getElementById('app'));
