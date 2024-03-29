const { ApolloLink } = require('@apollo/client/core');
const getLoginToken = require('./getLoginToken');

const meteorAuthLink = new ApolloLink((operation, forward) => {
  operation.setContext(() => ({
    headers: {
      Authorization: `Bearer ${getLoginToken() || ''}`,
    },
  }));

  return forward(operation);
});

module.exports = meteorAuthLink;
