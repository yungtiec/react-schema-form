import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Form from './Form';
import fields from './fields';
import {
  compose,
  withRegistry,
  withResolvers,
  withFormContext,
  withValues
} from './context';

export { compose, withRegistry, withResolvers, withFormContext, withValues };

export default class WithTheme extends Component {
  static propTypes = {
    theme: PropTypes.shape({
      widgets: PropTypes.objectOf(PropTypes.func).isRequired,
      templates: PropTypes.objectOf(PropTypes.func).isRequired
    }).isRequired,
    fields: PropTypes.objectOf(PropTypes.func),
    widgets: PropTypes.objectOf(PropTypes.func),
    templates: PropTypes.objectOf(PropTypes.func)
  };

  static defaultProps = {
    fields: {},
    widgets: {},
    templates: {}
  };

  fields = {
    ...fields,
    ...this.props.fields
  };

  widgets = {
    ...this.props.theme.widgets,
    ...this.props.widgets
  };

  templates = {
    ...this.props.theme.templates,
    ...this.props.templates
  };

  render() {
    return (
      <Form
        {...this.props}
        fields={this.fields}
        widgets={this.widgets}
        templates={this.templates}
      />
    );
  }
}
