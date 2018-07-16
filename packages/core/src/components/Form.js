import React from 'react';
import PropTypes from 'prop-types';

import RawForm from './RawForm';
import defaultFields from './fields';

const Form = ({
  theme,
  fields = {},
  widgets = {},
  templates = {},
  ...props
}) => {
  const registry = {
    fields: { ...defaultFields, ...fields },
    widgets: { ...theme.widgets, ...widgets },
    templates: { ...theme.templates, ...templates }
  };

  return <RawForm {...registry} {...props} />;
};

Form.propTypes = {
  theme: PropTypes.shape({
    widgets: PropTypes.objectOf(PropTypes.func).isRequired,
    templates: PropTypes.objectOf(PropTypes.func).isRequired
  }),
  fields: PropTypes.objectOf(PropTypes.func),
  widgets: PropTypes.objectOf(PropTypes.func),
  templates: PropTypes.objectOf(PropTypes.func)
};

export default Form;
