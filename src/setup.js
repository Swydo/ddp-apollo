import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import {
  DEFAULT_METHOD,
  DEFAULT_PATH,
} from 'apollo-link-ddp';
import { initSchema } from './initSchema';
import { createExecutor } from './createExecutor';
import { createGraphQLMethod } from './createGraphQLMethod';
import { createGraphQLPublication } from './createGraphQLPublication';
import { createGraphQLMiddleware } from './createGraphQLMiddleware';
import { meteorAuthMiddleware } from './meteorAuthMiddleware';

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

export async function setupHttpEndpoint({
  schema,
  gateway,
  path = DEFAULT_PATH,
  context,
  engine,
  jsonParser,
  authMiddleware = meteorAuthMiddleware,
} = {}) {
  const {
    schema: initializedSchema,
    executor: gatewayExecutor,
  } = await initSchema({
    schema,
    gateway,
  });

  const graphQLMiddleware = createGraphQLMiddleware({
    schema: initializedSchema,
    context,
    execute: createExecutor(gatewayExecutor),
  });

  if (engine && engine.expressMiddleware) {
    WebApp.connectHandlers.use(engine.expressMiddleware());
  }

  if (!jsonParser) {
    // Only require the body-parser for users who actually use the http version
    // eslint-disable-next-line global-require
    const bodyParser = require('body-parser');
    // eslint-disable-next-line no-param-reassign
    jsonParser = bodyParser.json();
  }

  WebApp.connectHandlers.use(path, jsonParser);

  if (authMiddleware) {
    WebApp.connectHandlers.use(path, authMiddleware);
  }

  WebApp.connectHandlers.use(path, (req, res, next) => graphQLMiddleware(req, res).catch(next));
}

export {
  createGraphQLPublication,
};
