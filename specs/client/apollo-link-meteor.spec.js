/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import gql from 'graphql-tag';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { loginWithUserId } from './helpers/login';
import { callPromise } from './helpers/callPromise';
import { MeteorLink } from '../../lib/client/apollo-link-meteor';

describe('MeteorLink', function () {
  beforeEach(function () {
    this.client = new ApolloClient({
      link: new MeteorLink(),
      cache: new InMemoryCache(),
    });

    this.client.cache.reset();
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

    describe('when authenticated', function () {
      before(async function () {
        const userId = await callPromise('createTestUser');
        chai.expect(userId).to.be.a('string');
        this.userId = userId;
        await loginWithUserId(userId);
      });

      after(function (done) {
        Meteor.logout((err) => { err ? done(err) : done(); });
      });

      it('returns the userId', async function () {
        const operation = {
          query: gql`query { userId }`,
        };

        const { data } = await this.client.query(operation);

        chai.expect(data.userId).to.be.a('string');
        chai.expect(data.userId).to.equal(this.userId);
      });
    });
  });
});

