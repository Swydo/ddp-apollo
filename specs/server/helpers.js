import { makeExecutableSchema } from 'graphql-tools';
import {
  DEFAULT_METHOD,
  DEFAULT_PUBLICATION,
} from 'apollo-link-ddp';
import { pubsub } from '../data/pubsub';
import { setup, setupHttpEndpoint } from '../../src/setup';

import { typeDefs } from '../data/typeDefs';
import { resolvers } from '../data/resolvers';

export function reset() {
  delete Meteor.server.publish_handlers[DEFAULT_PUBLICATION];
  delete Meteor.server.method_handlers[DEFAULT_METHOD];
}

Meteor.methods({
  'ddp-apollo/setup': async function setupDdpApollo() {
    reset();

    const schema = makeExecutableSchema({
      resolvers,
      typeDefs,
    });

    // Add the client context to the previous context for testing
    const context = (previousContext, clientContext) => ({
      ...previousContext,
      ddpContext: clientContext,
    });

    await setup({
      schema,
      context,
    });

    await setupHttpEndpoint({
      schema,
      context,
    });
  },

  'ddp-apollo/publish': function publish(topic, data) {
    pubsub.publish(topic, data);
  },
});
