import React, { Component } from 'react';

import { Registry, Resolvers, FormContext, Values } from './context';

class Form extends Component {
  state = {
    values: {}
  };

  registry = {
    fields: this.props.fields,
    widgets: this.props.widgets,
    templates: this.props.templates
  };

  render() {
    const { fields: SchemaField } = this.registry;

    return (
      <form>
        <Registry.Provider value={this.registry}>
          <Resolvers.Provider value={this.props.resolvers}>
            <FormContext.Provider value={this.props.formContext}>
              <Values.Provider value={this.state.values}>
                <SchemaField />
              </Values.Provider>
            </FormContext.Provider>
          </Resolvers.Provider>
        </Registry.Provider>
      </form>
    );
  }
}

export default Form;
