import { makeExecutableSchema } from 'graphql-tools';
import { pubsub } from '../data/pubsub';
import { setup } from '../../lib/server/setup';
import {
  DEFAULT_METHOD,
  DEFAULT_PUBLICATION,
} from '../../lib/common/defaults';

import { typeDefs } from '../data/typeDefs';
import { resolvers } from '../data/resolvers';

export function reset() {
  delete Meteor.server.publish_handlers[DEFAULT_PUBLICATION];
  delete Meteor.server.method_handlers[DEFAULT_METHOD];
}

Meteor.methods({
  'ddp-apollo/setup': function setupDdpApollo() {
    reset();

    const schema = makeExecutableSchema({
      resolvers,
      typeDefs,
    });

    setup(schema);
  },

  'ddp-apollo/publish': function publish(topic, data) {
    pubsub.publish(topic, data);
  },
});
