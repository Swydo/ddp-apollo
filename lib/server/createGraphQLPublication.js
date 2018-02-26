import { Meteor } from 'meteor/meteor';
import { subscribe } from 'graphql';
import forAwaitEach from '../common/forAwaitEach';
import {
  DEFAULT_PUBLICATION,
  DEFAULT_CREATE_CONTEXT,
  GRAPHQL_SUBSCRIPTION_MESSAGE_TYPE,
} from '../common/defaults';

// The 'pong' message is the only messages that is ignored by the client-side DDP parser
const SUBSCRIPTION_MESSAGE_TYPE = 'pong';

export function createGraphQLPublication({
  schema,
  publication = DEFAULT_PUBLICATION,
  createContext = DEFAULT_CREATE_CONTEXT,
} = {}) {
  if (!subscribe) {
    console.warn('DDP-Apollo: You need graphl@0.11 or higher for subscription support');
    return;
  }

  Meteor.publish(publication, function publishGraphQL({
    query,
    variables,
    operationName,
  } = {}, clientContext) {
    const {
      userId,
      _subscriptionId: subId,
      _session: session,
    } = this;

    if (!query) {
      this.stop();
      return;
    }

    const subscribeToQuery = async () => {
      const context = await createContext({ userId }, clientContext);

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
          msg: SUBSCRIPTION_MESSAGE_TYPE,
          type: GRAPHQL_SUBSCRIPTION_MESSAGE_TYPE,
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
