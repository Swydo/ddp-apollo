import { Meteor } from 'meteor/meteor';
import { createGraphQLMethod } from './createGraphQLMethod';
import { createGraphQLPublication } from './createGraphQLPublication';
import {
  DEFAULT_METHOD,
} from '../common/defaults';

export const DDP_APOLLO_SCHEMA_REQUIRED = 'DDP_APOLLO_SCHEMA_REQUIRED';

export function setup({
  schema,
  method = DEFAULT_METHOD,
  publication,
  disableOptics = false,
} = {}) {
  if (!schema) {
    throw new Error(DDP_APOLLO_SCHEMA_REQUIRED);
  }

  Meteor.methods({
    [method]: createGraphQLMethod(schema, { disableOptics }),
  });

  createGraphQLPublication({
    schema,
    publication,
  });
}
