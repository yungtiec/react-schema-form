import { createSelector } from 'reselect';

import { get } from '../utils';

const getResolver = (schema, formProps) =>
  typeof schema.resolver === 'string'
    ? formProps.resolvers[schema.resolver]
    : schema.resolver;

const makeResolveSchema = (ownProps, formProps) => {
  if (ownProps.schema.resolver) {
    const resolver = getResolver(ownProps.schema, formProps);

    if (resolver.schema) {
      return createSelector(resolver.selectors, resolver.schema);
    }
  }

  return () => undefined;
};

const makeResolveValues = (ownProps, formProps, index) => {
  if (ownProps.schema.type !== 'object') {
    if (ownProps.schema.resolver) {
      const resolver = getResolver(ownProps.schema, formProps);

      if (resolver.value) {
        return createSelector(resolver.selectors, resolver.value);
      }
    }

    const path = [...ownProps.idSchema.$path];

    if (index) {
      path[path.length - 1] = index;
    }

    return values => get(path, values);
  }

  return () => undefined;
};

export const map = (values, ownProps, formProps) => {
  const path = ownProps.idSchema.$path;
  /**
   * each instance of the component needs
   * its own private copy of the selector
   */
  const resolveSchema = makeResolveSchema(ownProps, formProps);
  const resolveValues = makeResolveValues(ownProps, formProps, path);

  return (values, baseOwnProps, formProps) => {
    const schemaExtension = resolveSchema(values, path, formProps);
    const schema = schemaExtension
      ? { ...baseOwnProps.schema, ...schemaExtension }
      : baseOwnProps.schema;

    return {
      schema,
      values: resolveValues(values, path, formProps)
    };
  };
};
