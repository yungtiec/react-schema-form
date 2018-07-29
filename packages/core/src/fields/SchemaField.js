import React, { Component } from 'react';
import { createSelector } from 'reselect';

import { getValue } from '../utils';
import {
  compose,
  withRegistry,
  withResolvers,
  withFormContext,
  withValues
} from '../context';

class SchemaField extends Component {}

const getResolver = (schemaResolver, resolvers) =>
  typeof schemaResolver === 'string'
    ? resolvers[schemaResolver]
    : schemaResolver;

const makeResolveSchema = props => {
  if (props.schema.resolver) {
    const resolver = getResolver(props.schema.resolver, props.resolvers);

    if (resolver.schema) {
      const resolveSchema = (...args) => {
        const resolved = resolver.schema(...args);

        if (resolved) {
          return {
            ...props.schema,
            ...resolved
          };
        }
        return props.schema;
      };
      return createSelector(resolver.selectors, resolveSchema);
    }
  }

  return () => props.schema;
};

const makeResolveValueResolver = props =>
  createSelector(
    schema => schema.resolver,
    _resolver => {
      const resolver = getResolver(_resolver, props.resolvers);
      if (resolver && resolver.value) {
        return getResolver(resolver, props.resolvers);
      }
    }
  );

const makeResolveValues = props => {
  if (props.schema.type !== 'object') {
    return createSelector(
      [
        resolver => resolver,
        (r, values) => values,
        (r, v, path) => path,
        (r, v, p, formContext) => formContext
      ],
      (resolver, values, ...args) => {
        if (resolver && resolver.value) {
          return createSelector(resolver.selectors, resolver.value)(
            values,
            ...args
          );
        }

        return getValue(props.idSchema.$path, values);
      }
    );
  }
  return () => undefined;
};

export const createMap = _props => {
  /**
   * each instance of the component needs
   * its own private copy of selectors
   */
  const resolveSchema = makeResolveSchema(_props);
  /**
   * the value resolver can be returned from the resolveSchema
   * so we need to memoize the value resolver which then will
   * be passed into the resolveValues
   */
  const resolveValueResolver = makeResolveValueResolver(_props);
  const resolveValues = makeResolveValues(_props);

  return props => {
    const schema = resolveSchema(
      props.values,
      props.idSchema.$path,
      props.formContext
    );
    const resolver = resolveValueResolver(schema);

    return {
      schema,
      values: resolveValues(
        resolver,
        props.values,
        props.idSchema.$path,
        props.formContext
      )
    };
  };
};

const resolve = WrappedComponent => {
  class Resolved extends Component {
    map = createMap(this.props);

    render() {
      const mapped = this.map(this.props);
      return <WrappedComponent {...this.props} {...mapped} />;
    }
  }

  return Resolved;
};

export default compose(
  withRegistry,
  withResolvers,
  withFormContext,
  withValues,
  resolve
)(SchemaField);
