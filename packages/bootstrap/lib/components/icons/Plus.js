"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Plus = function Plus(props) {
  return _react2.default.createElement(
    "svg",
    _extends({
      viewBox: "0 0 32 32",
      fill: "currentColor",
      width: "1em",
      height: "1em"
    }, props),
    _react2.default.createElement("path", { d: "M31 12H20V1a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v11H1a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h11v11a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V20h11a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1z" })
  );
};

exports.default = Plus;