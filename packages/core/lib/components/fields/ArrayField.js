'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _UnsupportedField = require('./UnsupportedField');

var _UnsupportedField2 = _interopRequireDefault(_UnsupportedField);

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ArrayField = function (_Component) {
  _inherits(ArrayField, _Component);

  function ArrayField() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, ArrayField);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ArrayField.__proto__ || Object.getPrototypeOf(ArrayField)).call.apply(_ref, [this].concat(args))), _this), _this.onAddClick = function (event) {
      event.preventDefault();
      var _this$props = _this.props,
          schema = _this$props.schema,
          formData = _this$props.formData,
          registry = _this$props.registry;
      var definitions = registry.definitions;

      var itemSchema = schema.items;
      if ((0, _utils.isFixedItems)(schema) && (0, _utils.allowAdditionalItems)(schema)) {
        itemSchema = schema.additionalItems;
      }
      _this.props.onChange([].concat(_toConsumableArray(formData), [(0, _utils.getDefaultFormState)(itemSchema, undefined, definitions)]));
    }, _this.onDropIndexClick = function (index) {
      return function (event) {
        if (event) {
          event.preventDefault();
        }
        var _this$props2 = _this.props,
            formData = _this$props2.formData,
            onChange = _this$props2.onChange;
        // refs #195: revalidate to ensure properly reindexing errors

        var newErrorSchema = void 0;
        if (_this.props.errorSchema) {
          newErrorSchema = {};
          var errorSchema = _this.props.errorSchema;
          for (var i in errorSchema) {
            i = parseInt(i);
            if (i < index) {
              newErrorSchema[i] = errorSchema[i];
            } else if (i > index) {
              newErrorSchema[i - 1] = errorSchema[i];
            }
          }
        }
        onChange(formData.filter(function (_, i) {
          return i !== index;
        }), newErrorSchema);
      };
    }, _this.onReorderClick = function (index, newIndex) {
      return function (event) {
        if (event) {
          event.preventDefault();
          event.target.blur();
        }
        var _this$props3 = _this.props,
            formData = _this$props3.formData,
            onChange = _this$props3.onChange;

        var newErrorSchema = void 0;
        if (_this.props.errorSchema) {
          newErrorSchema = {};
          var errorSchema = _this.props.errorSchema;
          for (var i in errorSchema) {
            if (i == index) {
              newErrorSchema[newIndex] = errorSchema[index];
            } else if (i == newIndex) {
              newErrorSchema[index] = errorSchema[newIndex];
            } else {
              newErrorSchema[i] = errorSchema[i];
            }
          }
        }
        onChange(formData.map(function (item, i) {
          // i is string, index and newIndex are numbers,
          // so using "==" to compare
          if (i == newIndex) {
            return formData[index];
          } else if (i == index) {
            return formData[newIndex];
          } else {
            return item;
          }
        }), newErrorSchema);
      };
    }, _this.onChangeForIndex = function (index) {
      return function (value, errorSchema) {
        var _this$props4 = _this.props,
            formData = _this$props4.formData,
            onChange = _this$props4.onChange;

        var newFormData = formData.map(function (item, i) {
          // We need to treat undefined items as nulls to have validation.
          // See https://github.com/tdegrunt/jsonschema/issues/206
          var jsonValue = typeof value === 'undefined' ? null : value;
          return index === i ? jsonValue : item;
        });
        onChange(newFormData, errorSchema && _this.props.errorSchema && _extends({}, _this.props.errorSchema, _defineProperty({}, index, errorSchema)));
      };
    }, _this.onSelectChange = function (value) {
      _this.props.onChange(value);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(ArrayField, [{
    key: 'isItemRequired',
    value: function isItemRequired(itemSchema) {
      if (Array.isArray(itemSchema.type)) {
        // While we don't yet support composite/nullable jsonschema types, it's
        // future-proof to check for requirement against these.
        return !itemSchema.type.includes('null');
      }
      // All non-null array item types are inherently required by design
      return itemSchema.type !== 'null';
    }
  }, {
    key: 'canAddItem',
    value: function canAddItem(formItems) {
      var _props = this.props,
          schema = _props.schema,
          uiSchema = _props.uiSchema;

      var _getUiOptions = (0, _utils.getUiOptions)(uiSchema),
          addable = _getUiOptions.addable;

      if (addable !== false) {
        // if ui:options.addable was not explicitly set to false, we can add
        // another item if we have not exceeded maxItems yet
        if (schema.maxItems !== undefined) {
          addable = formItems.length < schema.maxItems;
        } else {
          addable = true;
        }
      }
      return addable;
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          schema = _props2.schema,
          uiSchema = _props2.uiSchema,
          idSchema = _props2.idSchema,
          registry = _props2.registry;
      var definitions = registry.definitions;

      if (!schema.hasOwnProperty('items')) {
        return _react2.default.createElement(_UnsupportedField2.default, {
          schema: schema,
          idSchema: idSchema,
          reason: 'Missing items definition'
        });
      }
      if ((0, _utils.isFixedItems)(schema)) {
        return this.renderFixedArray();
      }
      if ((0, _utils.isFilesArray)(schema, uiSchema, definitions)) {
        return this.renderFiles();
      }
      if ((0, _utils.isMultiSelect)(schema, definitions)) {
        return this.renderMultiSelect();
      }
      return this.renderNormalArray();
    }
  }, {
    key: 'renderNormalArray',
    value: function renderNormalArray() {
      var _this2 = this;

      var _props3 = this.props,
          schema = _props3.schema,
          uiSchema = _props3.uiSchema,
          formData = _props3.formData,
          errorSchema = _props3.errorSchema,
          idSchema = _props3.idSchema,
          name = _props3.name,
          required = _props3.required,
          disabled = _props3.disabled,
          readonly = _props3.readonly,
          autofocus = _props3.autofocus,
          registry = _props3.registry,
          onBlur = _props3.onBlur,
          onFocus = _props3.onFocus,
          idPrefix = _props3.idPrefix,
          rawErrors = _props3.rawErrors;

      var title = schema.title === undefined ? name : schema.title;
      var definitions = registry.definitions,
          templates = registry.templates,
          formContext = registry.formContext;
      var ArrayFieldTemplate = templates.ArrayFieldTemplate,
          TitleTemplate = templates.TitleTemplate,
          DescriptionTemplate = templates.DescriptionTemplate;

      var itemsSchema = (0, _utils.retrieveSchema)(schema.items, definitions);
      var arrayProps = {
        canAdd: this.canAddItem(formData),
        items: formData.map(function (item, index) {
          var itemSchema = (0, _utils.retrieveSchema)(schema.items, definitions, item);
          var itemErrorSchema = errorSchema ? errorSchema[index] : undefined;
          var itemIdPrefix = idSchema.$id + '_' + index;
          var itemIdSchema = (0, _utils.toIdSchema)(itemSchema, itemIdPrefix, definitions, item, idPrefix);
          return _this2.renderArrayFieldItem({
            index: index,
            canMoveUp: index > 0,
            canMoveDown: index < formData.length - 1,
            itemSchema: itemSchema,
            itemIdSchema: itemIdSchema,
            itemErrorSchema: itemErrorSchema,
            itemData: item,
            itemUiSchema: uiSchema.items,
            autofocus: autofocus && index === 0,
            onBlur: onBlur,
            onFocus: onFocus
          });
        }),
        className: 'field field-array field-array-of-' + itemsSchema.type,
        DescriptionTemplate: DescriptionTemplate,
        disabled: disabled,
        idSchema: idSchema,
        uiSchema: uiSchema,
        onAddClick: this.onAddClick,
        readonly: readonly,
        required: required,
        schema: schema,
        title: title,
        TitleTemplate: TitleTemplate,
        formContext: formContext,
        formData: formData,
        rawErrors: rawErrors
      };

      // Check if a custom render function was passed in
      var Component = ArrayFieldTemplate;
      return _react2.default.createElement(Component, arrayProps);
    }
  }, {
    key: 'renderMultiSelect',
    value: function renderMultiSelect() {
      var _props4 = this.props,
          schema = _props4.schema,
          idSchema = _props4.idSchema,
          uiSchema = _props4.uiSchema,
          formData = _props4.formData,
          disabled = _props4.disabled,
          readonly = _props4.readonly,
          autofocus = _props4.autofocus,
          onBlur = _props4.onBlur,
          onFocus = _props4.onFocus,
          registry = _props4.registry,
          rawErrors = _props4.rawErrors;

      var items = this.props.formData;
      var widgets = registry.widgets,
          definitions = registry.definitions,
          formContext = registry.formContext;

      var itemsSchema = (0, _utils.retrieveSchema)(schema.items, definitions, formData);
      var enumOptions = (0, _utils.optionsList)(itemsSchema);

      var _getUiOptions$enumOpt = _extends({}, (0, _utils.getUiOptions)(uiSchema), {
        enumOptions: enumOptions
      }),
          _getUiOptions$enumOpt2 = _getUiOptions$enumOpt.widget,
          widget = _getUiOptions$enumOpt2 === undefined ? 'select' : _getUiOptions$enumOpt2,
          options = _objectWithoutProperties(_getUiOptions$enumOpt, ['widget']);

      var Widget = (0, _utils.getWidget)(schema, widget, widgets);
      return _react2.default.createElement(Widget, {
        id: idSchema && idSchema.$id,
        multiple: true,
        onChange: this.onSelectChange,
        onBlur: onBlur,
        onFocus: onFocus,
        options: options,
        schema: schema,
        value: items,
        disabled: disabled,
        readonly: readonly,
        formContext: formContext,
        autofocus: autofocus,
        rawErrors: rawErrors
      });
    }
  }, {
    key: 'renderFiles',
    value: function renderFiles() {
      var _props5 = this.props,
          schema = _props5.schema,
          uiSchema = _props5.uiSchema,
          idSchema = _props5.idSchema,
          name = _props5.name,
          disabled = _props5.disabled,
          readonly = _props5.readonly,
          autofocus = _props5.autofocus,
          onBlur = _props5.onBlur,
          onFocus = _props5.onFocus,
          registry = _props5.registry,
          rawErrors = _props5.rawErrors;

      var title = schema.title || name;
      var items = this.props.formData;
      var widgets = registry.widgets,
          formContext = registry.formContext;

      var _getUiOptions2 = (0, _utils.getUiOptions)(uiSchema),
          _getUiOptions2$widget = _getUiOptions2.widget,
          widget = _getUiOptions2$widget === undefined ? 'files' : _getUiOptions2$widget,
          options = _objectWithoutProperties(_getUiOptions2, ['widget']);

      var Widget = (0, _utils.getWidget)(schema, widget, widgets);
      return _react2.default.createElement(Widget, {
        options: options,
        id: idSchema && idSchema.$id,
        multiple: true,
        onChange: this.onSelectChange,
        onBlur: onBlur,
        onFocus: onFocus,
        schema: schema,
        title: title,
        value: items,
        disabled: disabled,
        readonly: readonly,
        formContext: formContext,
        autofocus: autofocus,
        rawErrors: rawErrors
      });
    }
  }, {
    key: 'renderFixedArray',
    value: function renderFixedArray() {
      var _this3 = this;

      var _props6 = this.props,
          schema = _props6.schema,
          uiSchema = _props6.uiSchema,
          formData = _props6.formData,
          errorSchema = _props6.errorSchema,
          idPrefix = _props6.idPrefix,
          idSchema = _props6.idSchema,
          name = _props6.name,
          required = _props6.required,
          disabled = _props6.disabled,
          readonly = _props6.readonly,
          autofocus = _props6.autofocus,
          registry = _props6.registry,
          onBlur = _props6.onBlur,
          onFocus = _props6.onFocus,
          rawErrors = _props6.rawErrors;

      var title = schema.title || name;
      var items = this.props.formData;
      var definitions = registry.definitions,
          templates = registry.templates,
          formContext = registry.formContext;
      var Template = templates.ArrayFieldTemplate,
          TitleTemplate = templates.TitleTemplate;

      var itemSchemas = schema.items.map(function (item, index) {
        return (0, _utils.retrieveSchema)(item, definitions, formData[index]);
      });
      var additionalSchema = (0, _utils.allowAdditionalItems)(schema) ? (0, _utils.retrieveSchema)(schema.additionalItems, definitions, formData) : null;

      if (!items || items.length < itemSchemas.length) {
        // to make sure at least all fixed items are generated
        items = items || [];
        items = items.concat(new Array(itemSchemas.length - items.length));
      }

      // These are the props passed into the render function
      var arrayProps = {
        canAdd: this.canAddItem(items) && additionalSchema,
        className: 'field field-array field-array-fixed-items',
        disabled: disabled,
        idSchema: idSchema,
        formData: formData,
        items: items.map(function (item, index) {
          var additional = index >= itemSchemas.length;
          var itemSchema = additional ? (0, _utils.retrieveSchema)(schema.additionalItems, definitions, item) : itemSchemas[index];
          var itemIdPrefix = idSchema.$id + '_' + index;
          var itemIdSchema = (0, _utils.toIdSchema)(itemSchema, itemIdPrefix, definitions, item, idPrefix);
          var itemUiSchema = additional ? uiSchema.additionalItems || {} : Array.isArray(uiSchema.items) ? uiSchema.items[index] : uiSchema.items || {};
          var itemErrorSchema = errorSchema ? errorSchema[index] : undefined;

          return _this3.renderArrayFieldItem({
            index: index,
            canRemove: additional,
            canMoveUp: index >= itemSchemas.length + 1,
            canMoveDown: additional && index < items.length - 1,
            itemSchema: itemSchema,
            itemData: item,
            itemUiSchema: itemUiSchema,
            itemIdSchema: itemIdSchema,
            itemErrorSchema: itemErrorSchema,
            autofocus: autofocus && index === 0,
            onBlur: onBlur,
            onFocus: onFocus
          });
        }),
        onAddClick: this.onAddClick,
        readonly: readonly,
        required: required,
        schema: schema,
        uiSchema: uiSchema,
        title: title,
        TitleTemplate: TitleTemplate,
        formContext: formContext,
        rawErrors: rawErrors
      };

      return _react2.default.createElement(Template, arrayProps);
    }
  }, {
    key: 'renderArrayFieldItem',
    value: function renderArrayFieldItem(props) {
      var index = props.index,
          _props$canRemove = props.canRemove,
          canRemove = _props$canRemove === undefined ? true : _props$canRemove,
          _props$canMoveUp = props.canMoveUp,
          canMoveUp = _props$canMoveUp === undefined ? true : _props$canMoveUp,
          _props$canMoveDown = props.canMoveDown,
          canMoveDown = _props$canMoveDown === undefined ? true : _props$canMoveDown,
          itemSchema = props.itemSchema,
          itemData = props.itemData,
          itemUiSchema = props.itemUiSchema,
          itemIdSchema = props.itemIdSchema,
          itemErrorSchema = props.itemErrorSchema,
          autofocus = props.autofocus,
          onBlur = props.onBlur,
          onFocus = props.onFocus,
          rawErrors = props.rawErrors;
      var _props7 = this.props,
          disabled = _props7.disabled,
          readonly = _props7.readonly,
          uiSchema = _props7.uiSchema,
          registry = _props7.registry;
      var SchemaField = registry.fields.SchemaField;

      var _orderable$removable$ = _extends({
        orderable: true,
        removable: true
      }, uiSchema['ui:options']),
          orderable = _orderable$removable$.orderable,
          removable = _orderable$removable$.removable;

      var has = {
        moveUp: orderable && canMoveUp,
        moveDown: orderable && canMoveDown,
        remove: removable && canRemove
      };
      has.toolbar = Object.keys(has).some(function (key) {
        return has[key];
      });

      return {
        children: _react2.default.createElement(SchemaField, {
          schema: itemSchema,
          uiSchema: itemUiSchema,
          formData: itemData,
          errorSchema: itemErrorSchema,
          idSchema: itemIdSchema,
          required: this.isItemRequired(itemSchema),
          onChange: this.onChangeForIndex(index),
          onBlur: onBlur,
          onFocus: onFocus,
          registry: this.props.registry,
          disabled: this.props.disabled,
          readonly: this.props.readonly,
          autofocus: autofocus,
          rawErrors: rawErrors
        }),
        className: 'array-item',
        disabled: disabled,
        hasToolbar: has.toolbar,
        hasMoveUp: has.moveUp,
        hasMoveDown: has.moveDown,
        hasRemove: has.remove,
        index: index,
        onDropIndexClick: this.onDropIndexClick,
        onReorderClick: this.onReorderClick,
        readonly: readonly
      };
    }
  }, {
    key: 'itemTitle',
    get: function get() {
      var schema = this.props.schema;

      return schema.items.title || schema.items.description || 'Item';
    }
  }]);

  return ArrayField;
}(_react.Component);

ArrayField.defaultProps = {
  uiSchema: {},
  formData: [],
  idSchema: {},
  required: false,
  disabled: false,
  readonly: false,
  autofocus: false
};


if (process.env.NODE_ENV !== 'production') {
  ArrayField.propTypes = {
    schema: _propTypes2.default.object.isRequired,
    uiSchema: _propTypes2.default.shape({
      'ui:options': _propTypes2.default.shape({
        addable: _propTypes2.default.bool,
        orderable: _propTypes2.default.bool,
        removable: _propTypes2.default.bool
      })
    }),
    idSchema: _propTypes2.default.object,
    errorSchema: _propTypes2.default.object,
    onChange: _propTypes2.default.func.isRequired,
    onBlur: _propTypes2.default.func,
    onFocus: _propTypes2.default.func,
    formData: _propTypes2.default.array,
    required: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    readonly: _propTypes2.default.bool,
    autofocus: _propTypes2.default.bool,
    registry: _propTypes2.default.shape({
      widgets: _propTypes2.default.objectOf(_propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.object])).isRequired,
      fields: _propTypes2.default.objectOf(_propTypes2.default.func).isRequired,
      definitions: _propTypes2.default.object.isRequired,
      formContext: _propTypes2.default.object.isRequired
    })
  };
}

exports.default = ArrayField;