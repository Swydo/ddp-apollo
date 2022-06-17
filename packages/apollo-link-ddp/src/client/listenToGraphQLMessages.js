const { Observable } = require('@apollo/client/core');
const { GRAPHQL_SUBSCRIPTION_MESSAGE_TYPE } = require('../common/defaults');

function filterGraphQLMessages(callback) {
  return (message) => {
    const data = typeof message === 'string'
      ? JSON.parse(message)
      : message;

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

function createClientStreamObserver(stream) {
  return new Observable((observer) => {
    const event = 'message';
    const callback = message => observer.next(message);

    if (stream) {
      stream.on(event, callback);
    }
    return () => {
      if (stream && stream.eventCallbacks && stream.eventCallbacks[event]) {
        const index = stream.eventCallbacks[event].indexOf(callback);
        if (index > -1) {
          stream.eventCallbacks[event].splice(index, 1);
        }
      }
    };
  });
}

function createSocketObserver(socket) {
  return new Observable((observer) => {
    const event = 'message:in';
    const listener = message => observer.next(message);

    socket.on(event, listener);

    return () => socket.off(event, listener);
  });
}

module.exports = {
  createClientStreamObserver,
  createSocketObserver,
  filterGraphQLMessages,
};
