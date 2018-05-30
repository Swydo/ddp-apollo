/* global window, fetch */
import { getLoginToken } from './getLoginToken';
import {
  DEFAULT_AUTH_HEADER,
  DEFAULT_PATH,
} from '../common/defaults';

/*
* Create a graphQL fetcher for graphiQL
*/
export function createFetcher({
  path = DEFAULT_PATH,
} = {}) {
  return function graphQLFetcher(graphQLParams) {
    const headers = {
      'Content-Type': 'application/json',
      [DEFAULT_AUTH_HEADER]: getLoginToken(),
    };

    return fetch(`${window.location.origin}/${path}`, {
      method: 'post',
      headers,
      body: JSON.stringify(graphQLParams),
    }).then(response => response.json());
  };
}
