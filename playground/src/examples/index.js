import arrays from './arrays';
import nested from './nested';
import numbers from './numbers';
import simple from './simple';
import widgets from './widgets';
import ordering from './ordering';
import references from './references';
import custom from './custom';
import errors from './errors';
import large from './large';
import date from './date';
import validation from './validation';
import files from './files';
import single from './single';
import customArray from './customArray';
import customObject from './customObject';
import alternatives from './alternatives';
import propertyDependencies from './propertyDependencies';
import schemaDependencies from './schemaDependencies';

export default [
  {
    path: 'simple',
    title: 'Simple',
    formProps: simple
  },
  {
    path: 'nested',
    title: 'Nested',
    formProps: nested
  },
  {
    path: 'arrays',
    title: 'Arrays',
    formProps: arrays
  },
  {
    path: 'numbers',
    title: 'Numbers',
    formProps: numbers
  },
  {
    path: 'widgets',
    title: 'Widgets',
    formProps: widgets
  },
  {
    path: 'ordering',
    title: 'Ordering',
    formProps: ordering
  },
  {
    path: 'references',
    title: 'References',
    formProps: references
  },
  {
    path: 'custom',
    title: 'Custom',
    formProps: custom
  },
  {
    path: 'errors',
    title: 'Errors',
    formProps: errors
  },
  {
    path: 'large',
    title: 'Large',
    formProps: large
  },
  {
    path: 'datetime',
    title: 'Date & time',
    formProps: date
  },
  {
    path: 'validation',
    title: 'Validation',
    formProps: validation
  },
  {
    path: 'files',
    title: 'Files',
    formProps: files
  },
  {
    path: 'single',
    title: 'Single',
    formProps: single
  },
  {
    path: 'custom-array',
    title: 'Custom array',
    formProps: customArray
  },
  {
    path: 'custom-object',
    title: 'Custom object',
    formProps: customObject
  },
  {
    path: 'alternatives',
    title: 'Alternatives',
    formProps: alternatives
  },
  {
    path: 'property-dependencies',
    title: 'Property dependencies',
    formProps: propertyDependencies
  },
  {
    path: 'schema-dependencies',
    title: 'Schema dependencies',
    formProps: schemaDependencies
  }
];
