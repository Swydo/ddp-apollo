import { runQuery } from 'graphql-server-core';
import { DEFAULT_METHOD } from './common';
import * as DEFAULT_OPTICS from './optics';

export const DDP_APOLLO_SCHEMA_REQUIERD = 'DDP_APOLLO_SCHEMA_REQUIERD';

export function createGraphQlMethod(schema, {
  disableOptics,
  optics = DEFAULT_OPTICS,
}) {
  // By setting disableOptics to true it can be disabled
  // Else, just check if the schema was instrumented
  const hasOptics = Boolean(!disableOptics && schema && schema._opticsInstrumented);

  return function graphQlMethod({ query, variables, operationName } = {}) {
    this.unblock && this.unblock();

    const { userId } = this;
    const opticsContext = hasOptics && optics.createContext();

    const data = runQuery({
      schema,
      query,
      variables,
      operationName,
      context: {
        userId,
        opticsContext,
      },
    }).await();

    hasOptics && Meteor.defer(() => optics.reportContext(
      optics.finishContext(opticsContext),
    ));

    return data;
  };
}

export function setup(schema, {
  method = DEFAULT_METHOD,
  disableOptics = false,
} = {}) {
  if (!schema) {
    throw new Error(DDP_APOLLO_SCHEMA_REQUIERD);
  }

  const methods = {};

  methods[method] = createGraphQlMethod(schema, { disableOptics });

  // Maybe this should be done by the consumer of this package
  Meteor.methods(methods);
}
