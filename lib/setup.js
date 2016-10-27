import { runQuery } from 'graphql-server-core';

export function setup(schema, { method = '/graphql' } = {}) {
    const methods = {};

    function hanldeGraphQLRequest ({ query, variables }) {
        this.unblock();

        const { userId } = this;

        return runQuery({
            schema,
            query,
            variables,
            context: { userId }
        }).await();
    }

    methods[method] = hanldeGraphQLRequest;

    // Maybe this should be done by the consumer of this package
    Meteor.methods(methods);

    return methods;
}
