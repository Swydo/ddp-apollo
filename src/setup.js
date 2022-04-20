import { Meteor } from 'meteor/meteor';
import {
  DEFAULT_METHOD,
} from '@swydo/apollo-link-ddp';
import { initSchema } from './initSchema';
import { createExecutor } from './createExecutor';
import { createGraphQLMethod } from './createGraphQLMethod';
import { createGraphQLPublication } from './createGraphQLPublication';
import { setupHttpEndpoint } from './setupHttpEndpoint';

export async function setup({
  schema,
  gateway,
  method = DEFAULT_METHOD,
  publication,
  context,
} = {}) {
  const {
    schema: initializedSchema,
    executor: gatewayExecutor,
  } = await initSchema({
    schema,
    gateway,
  });

  Meteor.methods({
    [method]: createGraphQLMethod({
      schema: initializedSchema,
      execute: createExecutor(gatewayExecutor),
      context,
    }),
  });

  if (!gateway) {
    createGraphQLPublication({
      schema: initializedSchema,
      publication,
      context,
    });
  }
}

export {
  createGraphQLPublication,
  setupHttpEndpoint,
};
