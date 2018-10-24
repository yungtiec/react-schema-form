'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.REQUIRED_FIELD_SYMBOL = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var REQUIRED_FIELD_SYMBOL = exports.REQUIRED_FIELD_SYMBOL = '*';

function Label(props) {
  var label = props.label,
      required = props.required,
      id = props.id;

  if (!label) {
    // See #312: Ensure compatibility with old versions of React.
    return _react2.default.createElement('div', null);
  }
  return _react2.default.createElement(
    'label',
    { className: 'col-form-label', htmlFor: id },
    label,
    required && _react2.default.createElement(
      'span',
      { className: 'required' },
      REQUIRED_FIELD_SYMBOL
    )
  );
}

function Help(props) {
  var help = props.help;

  if (!help) {
    // See #312: Ensure compatibility with old versions of React.
    return _react2.default.createElement('div', null);
  }
  if (typeof help === 'string') {
    return _react2.default.createElement(
      'p',
      { className: 'text-muted', 'data-testid': 'help-text' },
      _react2.default.createElement(
        'small',
        null,
        help
      )
    );
  }
  return _react2.default.createElement(
    'div',
    { className: 'form-text', 'data-testid': 'help-block' },
    help
  );
}

function ErrorList(props) {
  var _props$errors = props.errors,
      errors = _props$errors === undefined ? [] : _props$errors;

  if (errors.length === 0) {
    return _react2.default.createElement('div', null);
  }
  return _react2.default.createElement(
    _react.Fragment,
    null,
    errors.map(function (error, index) {
      return _react2.default.createElement(
        'div',
        {
          className: 'invalid-feedback d-block',
          key: index,
          'data-testid': 'error-detail__item'
        },
        error
      );
    })
  );
}

function FieldTemplate(props) {
  var id = props.id,
      testId = props.testId,
      label = props.label,
      children = props.children,
      errors = props.errors,
      help = props.help,
      description = props.description,
      hidden = props.hidden,
      required = props.required,
      displayLabel = props.displayLabel;

  if (hidden) {
    return children;
  }
  var classNames = [props.classNames, 'form-group'].join(' ').trim();

  return _react2.default.createElement(
    'div',
    { className: classNames, 'data-testid': testId },
    displayLabel && _react2.default.createElement(Label, { label: label, required: required, id: id }),
    displayLabel && description ? description : null,
    children,
    _react2.default.createElement(ErrorList, { errors: errors }),
    _react2.default.createElement(Help, { help: help })
  );
}

if (process.env.NODE_ENV !== 'production') {
  FieldTemplate.propTypes = {
    id: _propTypes2.default.string,
    classNames: _propTypes2.default.string,
    label: _propTypes2.default.string,
    children: _propTypes2.default.node.isRequired,
    errors: _propTypes2.default.arrayOf(_propTypes2.default.string),
    help: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.element]),
    description: _propTypes2.default.element,
    rawDescription: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.element]),
    hidden: _propTypes2.default.bool,
    required: _propTypes2.default.bool,
    readonly: _propTypes2.default.bool,
    displayLabel: _propTypes2.default.bool,
    fields: _propTypes2.default.object,
    formContext: _propTypes2.default.object
  };
}

FieldTemplate.defaultProps = {
  hidden: false,
  readonly: false,
  required: false,
  displayLabel: true
};

exports.default = FieldTemplate;