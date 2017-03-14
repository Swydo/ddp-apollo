import { makeExecutableSchema } from 'graphql-tools';
import { PubSub, SubscriptionManager } from 'graphql-subscriptions';
import { setup } from '../lib/setup';
import { typeDefs } from './data/typeDefs';
import { resolvers } from './data/resolvers';
import { DEFAULT_METHOD, DEFAULT_PUBLICATION } from '../lib/common';

export function reset() {
  delete Meteor.server.publish_handlers[DEFAULT_PUBLICATION];
  delete Meteor.server.method_handlers[DEFAULT_METHOD];
}

let pubsub;

Meteor.methods({
  'ddp-apollo/setup': function setupDdpApollo() {
    reset();

    const schema = makeExecutableSchema({
      resolvers,
      typeDefs,
    });

    pubsub = new PubSub();

    const subscriptionManager = new SubscriptionManager({
      schema,
      pubsub,
    });

    setup(schema, {
      subscriptionManager,
    });
  },

  'ddp-apollo/publish': function publish(name, data) {
    pubsub && pubsub.publish(name, data);
  },
});
