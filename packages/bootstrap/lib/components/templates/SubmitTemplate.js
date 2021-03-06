"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function SubmitTemplate() {
  return _react2.default.createElement(
    "p",
    null,
    _react2.default.createElement(
      "button",
      { type: "submit", className: "btn btn-info" },
      "Submit"
    )
  );
}

exports.default = SubmitTemplate;