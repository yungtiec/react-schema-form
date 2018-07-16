import { render, cleanup } from 'react-testing-library';
import React from 'react';
import Form from '../../packages/core/src';
import theme from '../../packages/bootstrap/src';

afterEach(cleanup);

describe('<Form />', () => {
  const renderForm = props => render(<Form theme={theme} {...props} />);

  it('should render', () => {
    expect(renderForm).not.toThrowError();
  });
});
