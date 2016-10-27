import { runQuery } from 'graphql-server-core';

export function graphQlMethod ({ query, variables }) {
    this.unblock();

    const { userId } = this;

    return runQuery({
        schema,
        query,
        variables,
        context: { userId }
    }).await();
}

export function setup(schema, { method = '/graphql' } = {}) {
    const methods = {};

    methods[method] = graphQlMethod;

    // Maybe this should be done by the consumer of this package
    Meteor.methods(methods);
}
