import React from 'react';
import { render } from 'react-testing-library';

/**
 * Tests each testCase.
 *
 * Every testCase must have a title prop (string)!
 */
export const testEach = testFn => {
  return _test;

  function _test(testCases) {
    testCases.forEach(testCase => {
      const _test = testCase.only
        ? test.only
        : testCase.skip
          ? test.skip
          : test;
      _test(testCase.title, () => testFn(testCase));
    });
  }
};

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
