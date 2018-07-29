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

export { Form };

export { compose, withRegistry, withResolvers, withFormContext, withValues };

export const withTheme = (name, theme) => WrappedForm => {
  class WithTheme extends Component {
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
      ...theme.widgets,
      ...this.props.widgets
    };

    templates = {
      ...theme.templates,
      ...this.props.templates
    };

    render() {
      return (
        <WrappedForm
          {...this.props}
          fields={this.fields}
          widgets={this.widgets}
          templates={this.templates}
        />
      );
    }
  }

  WithTheme.displayName = `WithTheme(${name})`;

  return props => <WithTheme {...props} />;
};
