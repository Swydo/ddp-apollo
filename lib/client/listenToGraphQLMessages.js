import { Observable } from 'apollo-link';
import { GRAPHQL_SUBSCRIPTION_MESSAGE_TYPE } from '../common/defaults';

export function filterGraphQLMessages(callback) {
  return (message) => {
    const data = typeof message === 'string' ?
      JSON.parse(message) :
      message;

    const {
      type,
      subId: subscriptionId,
      graphqlData: result,
    } = data;

    if (
      type === GRAPHQL_SUBSCRIPTION_MESSAGE_TYPE
      && subscriptionId
      && result
    ) {
      callback({
        subscriptionId,
        result,
      });
    }
  };
}

export function createClientStreamObserver(stream) {
  return new Observable((observer) => {
    const event = 'message';
    const callback = message => observer.next(message);

    if (stream) {
      stream.on(event, callback);
    }
  });
}
