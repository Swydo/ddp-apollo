import { ApolloLink } from 'apollo-link';
import { getLoginToken } from './getLoginToken';

export const meteorAuthLink = new ApolloLink((operation, forward) => {
  operation.setContext(() => ({
    headers: {
      Authorization: `Bearer ${getLoginToken() || ''}`,
    },
  }));

  return forward(operation);
});
