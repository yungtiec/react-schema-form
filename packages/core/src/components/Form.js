import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import {
  getDefaultFormState,
  retrieveSchema,
  toIdSchema,
  setState
} from '../utils';
import validateFormData, { toErrorList } from '../validate';

export default class Form extends PureComponent {
  static defaultProps = {
    uiSchema: {},
    noValidate: false,
    liveValidate: false,
    safeRenderCompletion: false,
    noHtml5Validate: false
  };

  state = getStateFromProps(this.props);

  static getDerivedStateFromProps(props, state) {
    const keys = Object.keys(state.cachedProps);
    const changed = keys.some(key => props[key] !== state.cachedProps[key]);
    if (changed) {
      return getStateFromProps(props, state);
    }
    return null;
  }

  validate(formData) {
    const { schema } = this.props;
    const retrievedSchema = retrieveSchema(
      schema,
      schema.definitions,
      formData
    );
    return validateFormData(
      formData,
      retrievedSchema,
      this.props.validate,
      this.props.transformErrors
    );
  }

  renderErrors(ErrorListTemplate) {
    const { errors, errorSchema } = this.state;
    const { schema, uiSchema, showErrorList, formContext } = this.props;

    if (errors.length && showErrorList != false) {
      return (
        <ErrorListTemplate
          errors={errors}
          errorSchema={errorSchema}
          schema={schema}
          uiSchema={uiSchema}
          formContext={formContext}
        />
      );
    }
    return null;
  }

  onChange = (formData, newErrorSchema) => {
    const mustValidate = !this.props.noValidate && this.props.liveValidate;
    let state = { formData };
    if (mustValidate) {
      const { errors, errorSchema } = this.validate(formData);
      state = { ...state, errors, errorSchema };
    } else if (!this.props.noValidate && newErrorSchema) {
      state = {
        ...state,
        errorSchema: newErrorSchema,
        errors: toErrorList(newErrorSchema)
      };
    }
    setState(this, state, () => {
      if (this.props.onChange) {
        this.props.onChange(this.state);
      }
    });
  };

  onBlur = (...args) => {
    if (this.props.onBlur) {
      this.props.onBlur(...args);
    }
  };

  onFocus = (...args) => {
    if (this.props.onFocus) {
      this.props.onFocus(...args);
    }
  };

  onSubmit = event => {
    event.preventDefault();

    if (!this.props.noValidate) {
      const { errors, errorSchema } = this.validate(this.state.formData);
      if (Object.keys(errors).length > 0) {
        setState(this, { errors, errorSchema }, () => {
          if (this.props.onError) {
            this.props.onError(errors);
          } else {
            /*eslint-disable-next-line*/
            console.error('Form validation failed', errors);
          }
        });
        return;
      }
    }

    setState(this, { errors: [], errorSchema: {} }, () => {
      if (this.props.onSubmit) {
        this.props.onSubmit({
          ...this.state,
          status: 'submitted'
        });
      }
    });
  };

  getRegistry() {
    return {
      fields: this.props.fields,
      templates: this.props.templates,
      widgets: this.props.widgets,
      definitions: this.props.schema.definitions || {},
      formContext: this.props.formContext || {}
    };
  }

  render() {
    const {
      schema,
      uiSchema,
      children,
      safeRenderCompletion,
      id,
      idPrefix,
      className = 'rjsf',
      name,
      method,
      target,
      action,
      autocomplete,
      enctype,
      acceptcharset,
      noHtml5Validate
    } = this.props;

    const { formData, errorSchema, idSchema } = this.state;
    const registry = this.getRegistry();
    const _SchemaField = registry.fields.SchemaField;
    const { ErrorListTemplate, SubmitTemplate } = registry.templates;

    return (
      <form
        className={className}
        id={id}
        name={name}
        method={method}
        target={target}
        action={action}
        autoComplete={autocomplete}
        encType={enctype}
        acceptCharset={acceptcharset}
        noValidate={noHtml5Validate}
        onSubmit={this.onSubmit}
      >
        {this.renderErrors(ErrorListTemplate)}
        <_SchemaField
          schema={schema}
          uiSchema={uiSchema}
          errorSchema={errorSchema}
          idSchema={idSchema}
          idPrefix={idPrefix}
          formData={formData}
          onChange={this.onChange}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
          registry={registry}
          safeRenderCompletion={safeRenderCompletion}
        />
        {children ? children : <SubmitTemplate />}
      </form>
    );
  }
}

function getStateFromProps(props, state = {}) {
  const { schema, uiSchema, liveValidate, noValidate } = props;
  const edit = typeof props.formData !== 'undefined';
  const mustValidate = edit && !noValidate && liveValidate;
  const { definitions } = schema;
  const formData = getDefaultFormState(schema, props.formData, definitions);
  const retrievedSchema = retrieveSchema(schema, definitions, formData);

  let errors, errorSchema;
  if (mustValidate) {
    const fromValidation = validateFormData(
      formData,
      retrievedSchema,
      props.validate,
      props.transformErrors
    );
    errors = fromValidation.errors;
    errorSchema = fromValidation.errorSchema;
  } else {
    errors = state.errors || [];
    errorSchema = state.errorSchema || {};
  }

  const idSchema = toIdSchema(
    retrievedSchema,
    uiSchema['ui:rootFieldId'],
    definitions,
    formData,
    props.idPrefix
  );
  return {
    cachedProps: {
      schema,
      uiSchema,
      formData: props.formData,
      liveValidate,
      noValidate,
      validate: props.validate,
      transformErrors: props.transformErrors,
      idPrefix: props.idPrefix
    },
    idSchema,
    formData,
    edit,
    errors,
    errorSchema
  };
}

if (process.env.NODE_ENV !== 'production') {
  Form.propTypes = {
    schema: PropTypes.object.isRequired,
    uiSchema: PropTypes.object,
    formData: PropTypes.any,
    templates: PropTypes.objectOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object])
    ),
    widgets: PropTypes.objectOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object])
    ),
    fields: PropTypes.objectOf(PropTypes.func),
    ArrayFieldTemplate: PropTypes.func,
    ObjectFieldTemplate: PropTypes.func,
    FieldTemplate: PropTypes.func,
    ErrorList: PropTypes.func,
    onChange: PropTypes.func,
    onError: PropTypes.func,
    showErrorList: PropTypes.bool,
    onSubmit: PropTypes.func,
    id: PropTypes.string,
    className: PropTypes.string,
    name: PropTypes.string,
    method: PropTypes.string,
    target: PropTypes.string,
    action: PropTypes.string,
    autocomplete: PropTypes.string,
    enctype: PropTypes.string,
    acceptcharset: PropTypes.string,
    noValidate: PropTypes.bool,
    noHtml5Validate: PropTypes.bool,
    liveValidate: PropTypes.bool,
    validate: PropTypes.func,
    transformErrors: PropTypes.func,
    safeRenderCompletion: PropTypes.bool,
    formContext: PropTypes.object
  };
}
