import { Meteor } from 'meteor/meteor';
import { subscribe } from 'graphql';
import forAwaitEach from '../common/forAwaitEach';
import {
  DEFAULT_PUBLICATION,
} from '../common/defaults';

export function createGraphQLPublication({
  schema,
  publication = DEFAULT_PUBLICATION,
} = {}) {
  Meteor.publish(publication, function publishGraphQL({
    query,
    variables,
    operationName,
  } = {}) {
    const {
      userId,
      _subscriptionId: subId,
      _session: session,
    } = this;

    if (!query) {
      this.stop();
      return;
    }

    const context = { userId };

    const subscribeToQuery = async () => {
      const iterator = await subscribe(
        schema,
        query,
        {},
        context,
        variables,
        operationName,
      );

      return forAwaitEach(iterator, (graphqlData) => {
        // If this subscription has ended we should stop listening to the iterator
        const { _deactivated: done } = this;

        if (done) {
          return false;
        }

        session.socket.send(JSON.stringify({
          msg: 'pong',
          subId,
          graphqlData,
        }));

        return true;
      });
    };

    this.ready();

    subscribeToQuery();
  });
}
