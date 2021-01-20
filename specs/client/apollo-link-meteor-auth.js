/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import gql from 'graphql-tag';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { DEFAULT_PATH, meteorAuthLink } from 'apollo-link-ddp';

describe('MeteorAuthLink', function () {
  beforeEach(function () {
    const httpLink = new HttpLink({ uri: Meteor.absoluteUrl(DEFAULT_PATH) });
    const cache = new InMemoryCache();

    this.client = new ApolloClient({
      link: meteorAuthLink.concat(httpLink),
      cache,
    });
  });

  describe('#query', function () {
    it('should return data from the server', async function () {
      const operation = {
        query: gql`query { foo }`,
      };

      const { data, loading } = await this.client.query(operation);

      chai.expect(data).to.deep.equal({ foo: 'bar' });
      chai.expect(loading).to.equal(false);
    });
  });
});
