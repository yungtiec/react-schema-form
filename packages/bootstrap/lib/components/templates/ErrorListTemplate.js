"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ErrorListTemplate(props) {
  var errors = props.errors;

  return _react2.default.createElement(
    "div",
    { className: "card text-white bg-danger errors" },
    _react2.default.createElement(
      "div",
      { className: "card-header" },
      "Errors"
    ),
    _react2.default.createElement(
      "ul",
      { className: "list-group list-group-flush" },
      errors.map(function (error, i) {
        return _react2.default.createElement(
          "li",
          { key: i, className: "list-group-item text-danger" },
          error.stack
        );
      })
    )
  );
}

/**
 * TODO: PropTypes
 */

exports.default = ErrorListTemplate;