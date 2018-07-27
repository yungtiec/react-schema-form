import React from 'react';
import { render } from 'react-testing-library';

export const initForm = (Form, initProps) => {
  return props => {
    const utils = render(<Form {...initProps} {...props} />);

    return { ...utils, rerender };

    /**
     * extends rerender from the `react-testing-library`
     * so you don't need to include the previous props
     */
    function rerender(newProps) {
      utils.rerender(<Form {...initProps} {...props} {...newProps} />);
    }
  };
};
