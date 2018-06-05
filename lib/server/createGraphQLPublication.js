import { Meteor } from 'meteor/meteor';
import { subscribe } from 'graphql';
import forAwaitEach from '../common/forAwaitEach';
import { contextToFunction } from './contextToFunction';
import {
  DEFAULT_PUBLICATION,
  GRAPHQL_SUBSCRIPTION_MESSAGE_TYPE,
} from '../common/defaults';

// The 'pong' message is the only messages that is ignored by the client-side DDP parser
const SUBSCRIPTION_MESSAGE_TYPE = 'pong';

export function createGraphQLPublication({
  schema,
  context,
  publication = DEFAULT_PUBLICATION,
} = {}) {
  if (!subscribe) {
    console.warn('DDP-Apollo: You need graphl@0.11 or higher for subscription support');
    return;
  }

  const createContext = contextToFunction(context);

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
      const completeContext = await createContext({ userId }, clientContext);

      const iterator = await subscribe(
        schema,
        query,
        {},
        completeContext,
        variables,
        operationName,
      );

      // When the Meteor subscriptions stops we should break out of the iterator
      this.onStop(() => iterator.return());

      return forAwaitEach(iterator, (graphqlData) => {
        session.socket.send(JSON.stringify({
          msg: SUBSCRIPTION_MESSAGE_TYPE,
          type: GRAPHQL_SUBSCRIPTION_MESSAGE_TYPE,
          subId,
          graphqlData,
        }));
      });
    };

    this.ready();

    subscribeToQuery()
      // When the GraphQL subscriptions stops we should stop the Meteor subscription
      .then(() => this.stop())
      .catch(err => this.error(err));
  });
}
