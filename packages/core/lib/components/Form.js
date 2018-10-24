"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _utils = require("../utils");

var _validate3 = require("../validate");

var _validate4 = _interopRequireDefault(_validate3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Form = function (_PureComponent) {
  _inherits(Form, _PureComponent);

  function Form() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Form);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Form.__proto__ || Object.getPrototypeOf(Form)).call.apply(_ref, [this].concat(args))), _this), _initialiseProps.call(_this), _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Form, [{
    key: "validate",
    value: function validate(formData) {
      var schema = this.props.schema;

      var retrievedSchema = (0, _utils.retrieveSchema)(schema, schema.definitions, formData);
      return (0, _validate4.default)(formData, retrievedSchema, this.props.validate, this.props.transformErrors);
    }
  }, {
    key: "renderErrors",
    value: function renderErrors(ErrorListTemplate) {
      var _state = this.state,
          errors = _state.errors,
          errorSchema = _state.errorSchema;
      var _props = this.props,
          schema = _props.schema,
          uiSchema = _props.uiSchema,
          showErrorList = _props.showErrorList,
          formContext = _props.formContext;


      if (errors.length && showErrorList != false) {
        return _react2.default.createElement(ErrorListTemplate, {
          errors: errors,
          errorSchema: errorSchema,
          schema: schema,
          uiSchema: uiSchema,
          formContext: formContext
        });
      }
      return null;
    }
  }, {
    key: "getRegistry",
    value: function getRegistry() {
      return {
        fields: this.props.fields,
        templates: this.props.templates,
        widgets: this.props.widgets,
        definitions: this.props.schema.definitions || {},
        formContext: this.props.formContext || {}
      };
    }
  }, {
    key: "render",
    value: function render() {
      var _props2 = this.props,
          schema = _props2.schema,
          uiSchema = _props2.uiSchema,
          children = _props2.children,
          safeRenderCompletion = _props2.safeRenderCompletion,
          id = _props2.id,
          idPrefix = _props2.idPrefix,
          _props2$className = _props2.className,
          className = _props2$className === undefined ? "rjsf" : _props2$className,
          name = _props2.name,
          method = _props2.method,
          target = _props2.target,
          action = _props2.action,
          autocomplete = _props2.autocomplete,
          enctype = _props2.enctype,
          acceptcharset = _props2.acceptcharset,
          noHtml5Validate = _props2.noHtml5Validate;
      var _state2 = this.state,
          formData = _state2.formData,
          errorSchema = _state2.errorSchema,
          idSchema = _state2.idSchema;

      var registry = this.getRegistry();
      var _SchemaField = registry.fields.SchemaField;
      var _registry$templates = registry.templates,
          ErrorListTemplate = _registry$templates.ErrorListTemplate,
          SubmitTemplate = _registry$templates.SubmitTemplate;


      return _react2.default.createElement(
        "form",
        {
          className: className,
          id: id,
          name: name,
          method: method,
          target: target,
          action: action,
          autoComplete: autocomplete,
          encType: enctype,
          acceptCharset: acceptcharset,
          noValidate: noHtml5Validate,
          onSubmit: this.onSubmit
        },
        this.renderErrors(ErrorListTemplate),
        _react2.default.createElement(_SchemaField, {
          schema: schema,
          uiSchema: uiSchema,
          errorSchema: errorSchema,
          idSchema: idSchema,
          idPrefix: idPrefix,
          formData: formData,
          onChange: this.onChange,
          onBlur: this.onBlur,
          onFocus: this.onFocus,
          registry: registry,
          safeRenderCompletion: safeRenderCompletion
        }),
        children ? children : _react2.default.createElement(SubmitTemplate, null)
      );
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(props, state) {
      var keys = Object.keys(state.cachedProps);
      var changed = keys.some(function (key) {
        return props[key] !== state.cachedProps[key];
      });
      if (changed) {
        return getStateFromProps(props, state);
      }
      return null;
    }
  }]);

  return Form;
}(_react.PureComponent);

Form.defaultProps = {
  uiSchema: {},
  noValidate: false,
  liveValidate: false,
  safeRenderCompletion: false,
  noHtml5Validate: false
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.state = getStateFromProps(this.props);

  this.onChange = function (formData, newErrorSchema) {
    var mustValidate = !_this2.props.noValidate && _this2.props.liveValidate;
    var state = { formData: formData };
    if (mustValidate) {
      var _validate = _this2.validate(formData),
          errors = _validate.errors,
          errorSchema = _validate.errorSchema;

      state = _extends({}, state, { errors: errors, errorSchema: errorSchema });
    } else if (!_this2.props.noValidate && newErrorSchema) {
      state = _extends({}, state, {
        errorSchema: newErrorSchema,
        errors: (0, _validate3.toErrorList)(newErrorSchema)
      });
    }
    (0, _utils.setState)(_this2, state, function () {
      if (_this2.props.onChange) {
        _this2.props.onChange(_this2.state);
      }
    });
  };

  this.onBlur = function () {
    if (_this2.props.onBlur) {
      var _props3;

      (_props3 = _this2.props).onBlur.apply(_props3, arguments);
    }
  };

  this.onFocus = function () {
    if (_this2.props.onFocus) {
      var _props4;

      (_props4 = _this2.props).onFocus.apply(_props4, arguments);
    }
  };

  this.onSubmit = function (event) {
    event.preventDefault();

    if (!_this2.props.noValidate) {
      var _validate2 = _this2.validate(_this2.state.formData),
          errors = _validate2.errors,
          errorSchema = _validate2.errorSchema;

      if (Object.keys(errors).length > 0) {
        (0, _utils.setState)(_this2, { errors: errors, errorSchema: errorSchema }, function () {
          if (_this2.props.onError) {
            _this2.props.onError(errors);
          } else {
            /*eslint-disable-next-line*/
            console.error("Form validation failed", errors);
          }
        });
        if (_this2.props.invalidCallback) _this2.props.invalidCallback();
        return;
      }
    }

    (0, _utils.setState)(_this2, { errors: [], errorSchema: {} }, function () {
      if (_this2.props.onSubmit) {
        _this2.props.onSubmit(_extends({}, _this2.state, {
          status: "submitted"
        }));
      }
    });
  };
};

exports.default = Form;


function getStateFromProps(props) {
  var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var schema = props.schema,
      uiSchema = props.uiSchema,
      liveValidate = props.liveValidate,
      noValidate = props.noValidate;

  var edit = typeof props.formData !== "undefined";
  var mustValidate = edit && !noValidate && liveValidate;
  var definitions = schema.definitions;

  var formData = (0, _utils.getDefaultFormState)(schema, props.formData, definitions);
  var retrievedSchema = (0, _utils.retrieveSchema)(schema, definitions, formData);

  var errors = void 0,
      errorSchema = void 0;
  if (mustValidate) {
    var fromValidation = (0, _validate4.default)(formData, retrievedSchema, props.validate, props.transformErrors);
    errors = fromValidation.errors;
    errorSchema = fromValidation.errorSchema;
  } else {
    errors = state.errors || [];
    errorSchema = state.errorSchema || {};
  }

  var idSchema = (0, _utils.toIdSchema)(retrievedSchema, uiSchema["ui:rootFieldId"], definitions, formData, props.idPrefix);
  return {
    cachedProps: {
      schema: schema,
      uiSchema: uiSchema,
      formData: props.formData,
      liveValidate: liveValidate,
      noValidate: noValidate,
      validate: props.validate,
      transformErrors: props.transformErrors,
      idPrefix: props.idPrefix
    },
    idSchema: idSchema,
    formData: formData,
    edit: edit,
    errors: errors,
    errorSchema: errorSchema
  };
}

if (process.env.NODE_ENV !== "production") {
  Form.propTypes = {
    schema: _propTypes2.default.object.isRequired,
    uiSchema: _propTypes2.default.object,
    formData: _propTypes2.default.any,
    templates: _propTypes2.default.objectOf(_propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.object])),
    widgets: _propTypes2.default.objectOf(_propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.object])),
    fields: _propTypes2.default.objectOf(_propTypes2.default.func),
    ArrayFieldTemplate: _propTypes2.default.func,
    ObjectFieldTemplate: _propTypes2.default.func,
    FieldTemplate: _propTypes2.default.func,
    ErrorList: _propTypes2.default.func,
    onChange: _propTypes2.default.func,
    onError: _propTypes2.default.func,
    showErrorList: _propTypes2.default.bool,
    onSubmit: _propTypes2.default.func,
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    name: _propTypes2.default.string,
    method: _propTypes2.default.string,
    target: _propTypes2.default.string,
    action: _propTypes2.default.string,
    autocomplete: _propTypes2.default.string,
    enctype: _propTypes2.default.string,
    acceptcharset: _propTypes2.default.string,
    noValidate: _propTypes2.default.bool,
    noHtml5Validate: _propTypes2.default.bool,
    liveValidate: _propTypes2.default.bool,
    invalidCallback: _propTypes2.default.func,
    validate: _propTypes2.default.func,
    transformErrors: _propTypes2.default.func,
    safeRenderCompletion: _propTypes2.default.bool,
    formContext: _propTypes2.default.object
  };
}