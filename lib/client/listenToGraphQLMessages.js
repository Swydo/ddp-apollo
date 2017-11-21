// Listen to a ClientStream for messages and filter out GraphQL subscription messages
export default function listenToGraphQLMessages(stream, callback) {
  if (!stream || !callback) {
    return;
  }

  stream.on('message', (message) => {
    const {
      subId: subscriptionId,
      graphqlData: result,
    } = JSON.parse(message);

    if (subscriptionId && result) {
      callback({
        subscriptionId,
        result,
      });
    }
  });
}
