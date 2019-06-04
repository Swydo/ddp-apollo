/* global window, fetch */
const { DEFAULT_PATH } = require('../common/defaults');
const getLoginToken = require('./getLoginToken');

/*
* Create a graphQL fetcher for graphiQL
*/
function createGraphQLFetcher({
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

module.exports = createGraphQLFetcher;
