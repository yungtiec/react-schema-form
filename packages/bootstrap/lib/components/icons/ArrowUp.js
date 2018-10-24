"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ArrowUp = function ArrowUp(props) {
  return _react2.default.createElement(
    "svg",
    _extends({
      viewBox: "0 0 32 32",
      fill: "currentColor",
      width: "1em",
      height: "1em"
    }, props),
    _react2.default.createElement("path", { d: "M16 1L1 16h9v16h12V16h9z" })
  );
};

exports.default = ArrowUp;