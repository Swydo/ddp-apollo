import { Meteor } from 'meteor/meteor';
import {
  DEFAULT_PUBLICATION,
  GRAPHQL_SUBSCRIPTION_MESSAGE_TYPE,
} from 'apollo-link-ddp';
import { subscribe } from 'graphql';
import forAwaitEach from './forAwaitEach';
import { contextToFunction } from './contextToFunction';

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
      connection: ddpConnection,
    } = this;
    if (!query) {
      this.stop();
      return;
    }

    Promise.resolve()
      .then(() => createContext({ userId, ddpConnection }, clientContext))
      .then(completeContext => subscribe(
        schema,
        query,
        {},
        completeContext,
        variables,
        operationName,
      ))
      .then((iterator) => {
        this.ready();

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
      })
      // When the GraphQL subscriptions stops we should stop the Meteor subscription
      .then(() => this.stop())
      .catch(err => this.error(err));
  });
}
