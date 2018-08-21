import React, { Component } from 'react';

import fields from './fields';

function withTheme(name, components) {
  return WrappedForm => {
    class WithTheme extends Component {
      static defaultProps = {
        fields: {},
        widgets: {},
        templates: {}
      };

      constructor(props) {
        super(props);

        this.state = {
          cached: {
            fields: props.fields,
            widgets: props.widgets,
            templates: props.templates
          },
          fields: {
            ...fields,
            ...props.fields
          },
          widgets: {
            ...components.widgets,
            ...props.widgets
          },
          templates: {
            ...components.templates,
            ...props.templates
          }
        };
      }

      static getDerivedStateFromProps(props, state) {
        if (
          props.fields !== state.cached.fields ||
          props.widgets !== state.cached.widgets ||
          props.templates !== state.cached.templates
        ) {
          return {
            cached: {
              fields: props.fields,
              widgets: props.widgets,
              templates: props.templates
            },
            fields: {
              ...fields,
              ...props.fields
            },
            widgets: {
              ...components.widgets,
              ...props.widgets
            },
            templates: {
              ...components.templates,
              ...props.templates
            }
          };
        }
        return null;
      }

      render() {
        return (
          <WrappedForm
            {...this.props}
            fields={this.state.fields}
            widgets={this.state.widgets}
            templates={this.state.templates}
          />
        );
      }
    }

    WithTheme.displayName = `WithTheme(${name})`;

    return WithTheme;
  };
}

export default withTheme;
