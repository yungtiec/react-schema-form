import React from 'react';
import { render } from 'react-dom';

const renderApp = () => {
  const App = require('./App').default;
  render(<App />, document.getElementById('app'));
};

renderApp();

module.hot.accept(renderApp);
