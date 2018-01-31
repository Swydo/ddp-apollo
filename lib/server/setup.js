import { Meteor } from 'meteor/meteor';
import { createGraphQLMethod } from './createGraphQLMethod';
import { createGraphQLPublication } from './createGraphQLPublication';
import {
  DEFAULT_METHOD,
  DEFAULT_CREATE_CONTEXT,
} from '../common/defaults';

export const DDP_APOLLO_SCHEMA_REQUIRED = 'DDP_APOLLO_SCHEMA_REQUIRED';

export function setup({
  schema,
  method = DEFAULT_METHOD,
  publication,
  context,
} = {}) {
  if (!schema) {
    throw new Error(DDP_APOLLO_SCHEMA_REQUIRED);
  }

  let createContext;

  switch (typeof context) {
    case 'object':
      createContext = defaultContext => ({ ...defaultContext, ...context });
      break;
    case 'function':
      createContext = context;
      break;
    default:
      createContext = DEFAULT_CREATE_CONTEXT;
  }

  Meteor.methods({
    [method]: createGraphQLMethod(schema, { createContext }),
  });

  createGraphQLPublication({
    schema,
    createContext,
    publication,
  });
}
