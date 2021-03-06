'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function RadioWidget(props) {
  var options = props.options,
      value = props.value,
      required = props.required,
      disabled = props.disabled,
      readonly = props.readonly,
      autofocus = props.autofocus,
      _onChange = props.onChange;
  // Generating a unique field name to identify this set of radio buttons

  var name = Math.random().toString();
  var enumOptions = options.enumOptions,
      inline = options.inline;
  // checked={checked} has been moved above name={name}, As mentioned in #349;
  // this is a temporary fix for radio button rendering bug in React, facebook/react#7630.

  return _react2.default.createElement(
    'div',
    { className: 'field-radio-group form-group' },
    enumOptions.map(function (option, i) {
      var checked = option.value === value;
      return _react2.default.createElement(
        'div',
        {
          key: i,
          className: 'form-check' + inline ? ' form-check-inline' : '',
          'data-testid': inline ? 'check-inline' : 'check'
        },
        _react2.default.createElement('label', { htmlFor: name, className: 'form-check-label' }),
        _react2.default.createElement('input', {
          type: 'radio',
          className: 'form-check-input',
          checked: checked,
          name: name,
          id: name,
          required: required,
          value: option.value,
          disabled: disabled || readonly,
          autoFocus: autofocus && i === 0,
          onChange: function onChange() {
            return _onChange(option.value);
          }
        }),
        option.label
      );
    })
  );
}

RadioWidget.defaultProps = {
  autofocus: false
};

if (process.env.NODE_ENV !== 'production') {
  RadioWidget.propTypes = {
    schema: _propTypes2.default.object.isRequired,
    id: _propTypes2.default.string.isRequired,
    options: _propTypes2.default.shape({
      enumOptions: _propTypes2.default.array,
      inline: _propTypes2.default.bool
    }).isRequired,
    value: _propTypes2.default.any,
    required: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    readonly: _propTypes2.default.bool,
    autofocus: _propTypes2.default.bool,
    onChange: _propTypes2.default.func
  };
}
exports.default = RadioWidget;