'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ColorWidget(props) {
  var disabled = props.disabled,
      readonly = props.readonly,
      BaseInput = props.registry.widgets.BaseInput;

  var style = {
    height: '2.4rem'
  };

  return _react2.default.createElement(BaseInput, _extends({
    type: 'color',
    style: style
  }, props, {
    disabled: disabled || readonly
  }));
}

if (process.env.NODE_ENV !== 'production') {
  ColorWidget.propTypes = {
    schema: _propTypes2.default.object.isRequired,
    id: _propTypes2.default.string.isRequired,
    value: _propTypes2.default.string,
    required: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    readonly: _propTypes2.default.bool,
    autofocus: _propTypes2.default.bool,
    onChange: _propTypes2.default.func
  };
}

exports.default = ColorWidget;