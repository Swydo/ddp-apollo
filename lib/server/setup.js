import { Meteor } from 'meteor/meteor';
import { createGraphQLMethod } from './createGraphQLMethod';
import { createGraphQLPublication } from './createGraphQLPublication';
import {
  DEFAULT_METHOD,
  DEFAULT_CREATE_CONTEXT,
} from '../common/defaults';

export const DDP_APOLLO_SCHEMA_REQUIRED = 'DDP_APOLLO_SCHEMA_REQUIRED';

function contextToFunction(context) {
  switch (typeof context) {
    case 'object':
      return defaultContext => ({ ...defaultContext, ...context });
    case 'function':
      return context;
    default:
      return DEFAULT_CREATE_CONTEXT;
  }
}

export function setup({
  schema,
  method = DEFAULT_METHOD,
  publication,
  context,
} = {}) {
  if (!schema) {
    throw new Error(DDP_APOLLO_SCHEMA_REQUIRED);
  }

  const createContext = contextToFunction(context);

  Meteor.methods({
    [method]: createGraphQLMethod(schema, { createContext }),
  });

  createGraphQLPublication({
    schema,
    createContext,
    publication,
  });
}
