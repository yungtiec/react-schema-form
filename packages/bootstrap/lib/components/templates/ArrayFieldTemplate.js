'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ArrowUp = require('../icons/ArrowUp');

var _ArrowUp2 = _interopRequireDefault(_ArrowUp);

var _ArrowDown = require('../icons/ArrowDown');

var _ArrowDown2 = _interopRequireDefault(_ArrowDown);

var _Cross = require('../icons/Cross');

var _Cross2 = _interopRequireDefault(_Cross);

var _Plus = require('../icons/Plus');

var _Plus2 = _interopRequireDefault(_Plus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function ArrayFieldTitle(_ref) {
  var TitleTemplate = _ref.TitleTemplate,
      idSchema = _ref.idSchema,
      title = _ref.title,
      required = _ref.required;

  if (!title) {
    // See #312: Ensure compatibility with old versions of React.
    return _react2.default.createElement('div', null);
  }
  var id = idSchema.$id + '__title';
  return _react2.default.createElement(TitleTemplate, { id: id, title: title, required: required });
}

function ArrayFieldDescription(_ref2) {
  var DescriptionTemplate = _ref2.DescriptionTemplate,
      idSchema = _ref2.idSchema,
      description = _ref2.description;

  if (!description) {
    // See #312: Ensure compatibility with old versions of React.
    return _react2.default.createElement('div', null);
  }
  var id = idSchema.$id + '__description';
  return _react2.default.createElement(DescriptionTemplate, { id: id, description: description });
}

function IconBtn(props) {
  var _props$type = props.type,
      type = _props$type === undefined ? 'secondary' : _props$type,
      Icon = props.icon,
      className = props.className,
      otherProps = _objectWithoutProperties(props, ['type', 'icon', 'className']);

  return _react2.default.createElement(
    'button',
    _extends({
      type: 'button',
      className: 'btn btn-' + type + ' ' + className
    }, otherProps),
    _react2.default.createElement(Icon, null)
  );
}

function ArrayItem(props) {
  var btnStyle = {
    flex: 1,
    paddingLeft: 6,
    paddingRight: 6,
    fontWeight: 'bold'
  };
  var classNames = [props.className, 'row'].join(' ').trim();

  return _react2.default.createElement(
    'div',
    { key: props.index, className: classNames },
    _react2.default.createElement(
      'div',
      { className: props.hasToolbar ? 'col-md-9' : 'col-md-12' },
      props.children
    ),
    props.hasToolbar && _react2.default.createElement(
      'div',
      { className: 'col-md-3 array-item-toolbox' },
      _react2.default.createElement(
        'div',
        {
          className: 'btn-group',
          style: {
            display: 'flex',
            justifyContent: 'space-around'
          }
        },
        (props.hasMoveUp || props.hasMoveDown) && _react2.default.createElement(IconBtn, {
          icon: _ArrowUp2.default,
          className: 'array-item-move-up',
          tabIndex: '-1',
          style: btnStyle,
          disabled: props.disabled || props.readonly || !props.hasMoveUp,
          onClick: props.onReorderClick(props.index, props.index - 1)
        }),
        (props.hasMoveUp || props.hasMoveDown) && _react2.default.createElement(IconBtn, {
          icon: _ArrowDown2.default,
          className: 'array-item-move-down',
          tabIndex: '-1',
          style: btnStyle,
          disabled: props.disabled || props.readonly || !props.hasMoveDown,
          onClick: props.onReorderClick(props.index, props.index + 1)
        }),
        props.hasRemove && _react2.default.createElement(IconBtn, {
          type: 'danger',
          icon: _Cross2.default,
          className: 'array-item-remove',
          tabIndex: '-1',
          style: btnStyle,
          disabled: props.disabled || props.readonly,
          onClick: props.onDropIndexClick(props.index),
          'data-testid': 'remove-array-item'
        })
      )
    )
  );
}

function AddButton(_ref3) {
  var onClick = _ref3.onClick,
      disabled = _ref3.disabled;

  return _react2.default.createElement(
    'div',
    { className: 'row' },
    _react2.default.createElement(
      'p',
      { className: 'col-md-3 col-md-offset-9 array-item-add text-right' },
      _react2.default.createElement(IconBtn, {
        type: 'info',
        icon: _Plus2.default,
        className: 'btn-add col-md-12',
        tabIndex: '0',
        onClick: onClick,
        disabled: disabled,
        'data-testid': 'add-array-item'
      })
    )
  );
}

function ArrayFieldTemplate(props) {
  return _react2.default.createElement(
    'fieldset',
    { className: props.className },
    _react2.default.createElement(ArrayFieldTitle, {
      key: 'array-field-title-' + props.idSchema.$id,
      TitleTemplate: props.TitleTemplate,
      idSchema: props.idSchema,
      title: props.uiSchema['ui:title'] || props.title,
      required: props.required
    }),
    (props.uiSchema['ui:description'] || props.schema.description) && _react2.default.createElement(ArrayFieldDescription, {
      key: 'array-field-description-' + props.idSchema.$id,
      DescriptionTemplate: props.DescriptionTemplate,
      idSchema: props.idSchema,
      description: props.uiSchema['ui:description'] || props.schema.description
    }),
    _react2.default.createElement(
      'div',
      {
        className: 'array-item-list',
        key: 'array-item-list-' + props.idSchema.$id
      },
      props.items && props.items.map(function (p) {
        return ArrayItem(p);
      })
    ),
    props.canAdd && _react2.default.createElement(AddButton, {
      onClick: props.onAddClick,
      disabled: props.disabled || props.readonly
    })
  );
}

/**
 * TODO: PropTypes
 */

exports.default = ArrayFieldTemplate;