export default function listenToGraphQLMessages(connection, callback) {
  if (!callback) {
    return;
  }

  const { _stream: stream } = connection;

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
