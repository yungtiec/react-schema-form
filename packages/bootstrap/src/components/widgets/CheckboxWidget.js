import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

function CheckboxWidget(props) {
  const {
    schema,
    id,
    value,
    required,
    disabled,
    readonly,
    label,
    autofocus,
    onChange
  } = props;
  return (
    <Fragment>
      {schema.description && (
        <p className="mb-2 font-weight-light">{schema.description}</p>
      )}
      <div
        className={`form-group form-check${
          disabled || readonly ? ' disabled' : ''
        }`}
      >
        <input
          type="checkbox"
          id={id}
          checked={typeof value === 'undefined' ? false : value}
          required={required}
          disabled={disabled || readonly}
          autoFocus={autofocus}
          onChange={event => onChange(event.target.checked)}
          className="form-check-input"
        />
        <label className="form-check-label" htmlFor={id}>
          {label}
        </label>
      </div>
    </Fragment>
  );
}

CheckboxWidget.defaultProps = {
  autofocus: false
};

if (process.env.NODE_ENV !== 'production') {
  CheckboxWidget.propTypes = {
    schema: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    value: PropTypes.bool,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    readonly: PropTypes.bool,
    autofocus: PropTypes.bool,
    onChange: PropTypes.func
  };
}

export default CheckboxWidget;
