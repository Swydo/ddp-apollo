import { Meteor } from 'meteor/meteor';
import { subscribe } from 'graphql';
import { createAsyncIterator } from 'iterall';
import forAwaitEach from '../common/forAwaitEach';
import {
  DEFAULT_PUBLICATION,
} from '../common/defaults';

export function setupSubscriptions({
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
      return this.stop();
    }

    const context = { userId };

    const subscribeToQuery = async () => {
      const result = await subscribe(
        schema,
        query,
        {},
        context,
        variables,
        operationName,
      );

      const iterator = createAsyncIterator(result);

      return forAwaitEach(iterator, (data) => {
        // If this subscription has ended we should stop listening to the iterator
        const { _deactivated: done } = this;

        if (done) {
          return false;
        }

        session.socket.send(JSON.stringify({
          msg: 'pong',
          subId,
          graphqlData: data,
        }));

        return true;
      });
    };

    this.ready();

    subscribeToQuery();

    return undefined;
  });
}
