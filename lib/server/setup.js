import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { createGraphQLMethod } from './createGraphQLMethod';
import { createGraphQLPublication } from './createGraphQLPublication';
import { createGraphQLRequestHandler } from './createGraphQLRequestHandler';
import {
  DEFAULT_METHOD,
  DEFAULT_PATH,
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

  Meteor.methods({
    [method]: createGraphQLMethod({
      schema,
      context,
    }),
  });

  createGraphQLPublication({
    schema,
    publication,
    context,
  });
}

export function setupHttpEndpoint({
  schema,
  path = DEFAULT_PATH,
  context,
  engine,
} = {}) {
  // Only require the body-parser for users who actually use the http version
  // eslint-disable-next-line global-require
  const bodyParser = require('body-parser');
  const requestHandler = createGraphQLRequestHandler({ schema, context });

  if (engine && engine.expressMiddleware) {
    WebApp.connectHandlers.use(engine.expressMiddleware());
  }

  WebApp.connectHandlers.use(path, bodyParser.json());
  WebApp.connectHandlers.use(path, requestHandler);
}
