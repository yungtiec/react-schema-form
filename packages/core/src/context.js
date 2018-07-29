import React from 'react';

const initContext = prop => {
  const contextName = prop.charAt(0).toUpperCase() + prop.substring(1);
  const withContextName = `with${contextName}`;
  const Context = React.createContext();
  const withContext = WrappedComponent => {
    const WrapComponent = props => (
      <Context.Consumer>
        {value => {
          const withValue = { [prop]: value };
          return <WrappedComponent {...props} {...withValue} />;
        }}
      </Context.Consumer>
    );

    WrapComponent.displayName = `With${contextName}`;

    return WrapComponent;
  };

  return {
    [contextName]: Context,
    [withContextName]: withContext
  };
};

export const { Registry, withRegistry } = initContext('registry');
export const { Resolvers, withResolvers } = initContext('resolvers');
export const { FormContext, withFormContext } = initContext('formContext');
export const { Values, withValues } = initContext('values');

export const compose = (...enhancers) => WrappedComponent =>
  enhancers.reduce((Comp, enhance) => enhance(Comp), WrappedComponent);
