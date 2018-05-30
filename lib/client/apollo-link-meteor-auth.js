import { ApolloLink } from 'apollo-link';
import { getLoginToken } from './getLoginToken';
import { DEFAULT_AUTH_HEADER } from '../common/defaults';

export const meteorAuthLink = new ApolloLink((operation, forward) => {
  operation.setContext(() => ({
    headers: {
      [DEFAULT_AUTH_HEADER]: getLoginToken(),
    },
  }));

  return forward(operation);
});
