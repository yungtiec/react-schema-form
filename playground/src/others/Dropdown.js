import React from 'react';
import Downshift from 'downshift';
import { Link } from '@reach/router';

function Dropdown({ list, children: actual }) {
  return (
    <Downshift>
      {({ getLabelProps, getItemProps, isOpen, toggleMenu }) => (
        <div className="mt-1 mb-3 text-right">
          <label
            {...getLabelProps({
              htmlFor: 'my-select',
              className: 'd-block mb-1'
            })}
          >
            <small>Select an example</small>
          </label>
          <div className="btn-group">
            <button
              id="my-select"
              type="button"
              className="btn btn-sm btn-primary dropdown-toggle"
              onClick={toggleMenu}
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded={isOpen}
            >
              {actual}
            </button>
            {isOpen ? (
              <div
                style={{ display: 'block' }}
                className="dropdown-menu dropdown-menu-right"
              >
                {list.map(item => (
                  <Link
                    {...getItemProps({ item: item.title })}
                    key={item.path}
                    className="dropdown-item"
                    style={{ cursor: 'pointer' }}
                    to={`../${item.path}`}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </Downshift>
  );
}

export default Dropdown;
