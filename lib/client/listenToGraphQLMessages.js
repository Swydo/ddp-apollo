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

export default function listenToClientStreamMessages(stream, callback) {
  if (!stream || !callback) {
    return;
  }
  stream.on('message', callback);
}

export function createClientSteamListener(stream) {
  return callback => listenToClientStreamMessages(stream, callback);
}
