import { runQuery } from 'graphql-server-core';

export function createGraphQlMethod(schema) {
  return function graphQlMethod({ query, variables, operationName } = {}) {
    this.unblock();

    const { userId } = this;

    return runQuery({
      schema,
      query,
      variables,
      operationName,
      context: { userId },
    }).await();
  };
}

export function setup(schema, { method = '/graphql' } = {}) {
  const methods = {};

  methods[method] = createGraphQlMethod(schema);

  // Maybe this should be done by the consumer of this package
  Meteor.methods(methods);
}
