import React from 'react';
import { Link, Router } from '@reach/router';
import { hot } from 'react-hot-loader';

import Page from './others/Page';

function App() {
  return (
    <div className="container">
      <Link to="/simple" className="h3 mt-4 float-sm-left">
        React Schema Form
      </Link>

      <Router>
        <Page path="/" example="simple" />
        <Page path=":example" />
      </Router>
    </div>
  );
}

export default hot(module)(App);
