import { GRAPHQL_SUBSCRIPTION_MESSAGE_TYPE } from '../common/defaults';

// Listen to a ClientStream for messages and filter out GraphQL subscription messages
export default function listenToGraphQLMessages(stream, callback) {
  if (!stream || !callback) {
    return;
  }

  stream.on('message', (message) => {
    const {
      type,
      subId: subscriptionId,
      graphqlData: result,
    } = JSON.parse(message);

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
  });
}
