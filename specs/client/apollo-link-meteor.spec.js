/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import gql from 'graphql-tag';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { MeteorLink } from '../../lib/client/apollo-link-meteor';

describe('MeteorLink', function () {
  beforeEach(function () {
    this.client = new ApolloClient({
      link: new MeteorLink(),
      cache: new InMemoryCache(),
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

