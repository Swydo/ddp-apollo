/* global window, fetch */
import { getLoginToken } from './getLoginToken';
import { DEFAULT_PATH } from '../common/defaults';

/*
* Create a graphQL fetcher for graphiQL
*/
export function createFetcher({
  path = DEFAULT_PATH,
} = {}) {
  return function graphQLFetcher(graphQLParams) {
    const headers = {
      Authorization: `Bearer ${getLoginToken() || ''}`,
      'Content-Type': 'application/json',
    };

    return fetch(`${window.location.origin}/${path}`, {
      method: 'post',
      headers,
      body: JSON.stringify(graphQLParams),
    }).then(response => response.json());
  };
}
