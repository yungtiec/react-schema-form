'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.templates = exports.widgets = undefined;

var _src = require('@react-schema-form/core/src');

var _templates = require('./components/templates');

var _templates2 = _interopRequireDefault(_templates);

var _widgets = require('./components/widgets');

var _widgets2 = _interopRequireDefault(_widgets);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.widgets = _widgets2.default;
exports.templates = _templates2.default;
exports.default = (0, _src.withTheme)('Bootstrap', { widgets: _widgets2.default, templates: _templates2.default })(_src.Form);