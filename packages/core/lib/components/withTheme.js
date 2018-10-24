'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _fields = require('./fields');

var _fields2 = _interopRequireDefault(_fields);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function withTheme(name, components) {
  return function (WrappedForm) {
    var WithTheme = function (_Component) {
      _inherits(WithTheme, _Component);

      function WithTheme(props) {
        _classCallCheck(this, WithTheme);

        var _this = _possibleConstructorReturn(this, (WithTheme.__proto__ || Object.getPrototypeOf(WithTheme)).call(this, props));

        _this.state = {
          cached: {
            fields: props.fields,
            widgets: props.widgets,
            templates: props.templates
          },
          fields: _extends({}, _fields2.default, props.fields),
          widgets: _extends({}, components.widgets, props.widgets),
          templates: _extends({}, components.templates, props.templates)
        };
        return _this;
      }

      _createClass(WithTheme, [{
        key: 'render',
        value: function render() {
          return _react2.default.createElement(WrappedForm, _extends({}, this.props, {
            fields: this.state.fields,
            widgets: this.state.widgets,
            templates: this.state.templates
          }));
        }
      }], [{
        key: 'getDerivedStateFromProps',
        value: function getDerivedStateFromProps(props, state) {
          if (props.fields !== state.cached.fields || props.widgets !== state.cached.widgets || props.templates !== state.cached.templates) {
            return {
              cached: {
                fields: props.fields,
                widgets: props.widgets,
                templates: props.templates
              },
              fields: _extends({}, _fields2.default, props.fields),
              widgets: _extends({}, components.widgets, props.widgets),
              templates: _extends({}, components.templates, props.templates)
            };
          }
          return null;
        }
      }]);

      return WithTheme;
    }(_react.Component);

    WithTheme.defaultProps = {
      fields: {},
      widgets: {},
      templates: {}
    };


    WithTheme.displayName = 'WithTheme(' + name + ')';

    return WithTheme;
  };
}

exports.default = withTheme;