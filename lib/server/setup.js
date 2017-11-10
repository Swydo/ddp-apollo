import { Meteor } from 'meteor/meteor';
import { createGraphQlMethod } from './createGraphQlMethod';
import { createGraphQLPublication } from './createGraphQLPublication';
import {
  DEFAULT_METHOD,
} from '../common/defaults';

export const DDP_APOLLO_SCHEMA_REQUIRED = 'DDP_APOLLO_SCHEMA_REQUIRED';

export function setup(schema, {
  method = DEFAULT_METHOD,
  disableOptics = false,
  publication,
} = {}) {
  if (!schema) {
    throw new Error(DDP_APOLLO_SCHEMA_REQUIRED);
  }

  const methods = {};

  methods[method] = createGraphQlMethod(schema, { disableOptics });

  // Maybe this should be done by the consumer of this package
  Meteor.methods(methods);

  createGraphQLPublication({
    schema,
    publication,
  });
}
