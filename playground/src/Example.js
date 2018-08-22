import React, { Component, Fragment } from 'react';
import Form from '@react-schema-form/bootstrap';
import Print from './others/Print';

class Example extends Component {
  state = { formData: undefined };

  handleChange = ({ formData }) => {
    this.setState({ formData });
  };

  render() {
    const { schema, uiSchema, ...example } = this.props;
    const formData = this.state.formData || example.formData || {};

    return (
      <Fragment>
        <Form
          {...example}
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
          onChange={this.handleChange}
        />
        <Print data={formData} />
      </Fragment>
    );
  }
}

export default Example;
