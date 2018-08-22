import React, { Component } from 'react';

import examples from '../examples';
import Dropdown from './Dropdown';
import Example from '../Example';

class Page extends Component {
  render() {
    const example = examples.find(item => item.path === this.props.example);
    return (
      <div>
        <Dropdown list={examples}>{example.title}</Dropdown>
        <Example key={example.title} {...example.formProps} />
      </div>
    );
  }
}

export default Page;
