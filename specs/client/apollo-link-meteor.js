/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import gql from 'graphql-tag';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { MeteorLink } from 'apollo-link-ddp';
import { loginWithUserId } from './helpers/login';
import { callPromise } from './helpers/callPromise';

describe('MeteorLink', function () {
  beforeEach(function () {
    this.link = new MeteorLink();

    this.client = new ApolloClient({
      link: this.link,
      cache: new InMemoryCache(),
    });

    this.client.cache.reset();
  });

  afterEach(function () {
    this.link.subscriptionLink.ddpSubscription.unsubscribe();
  });

  describe('#mutate', function () {
    it('returns data from the server', async function () {
      const operation = {
        mutation: gql`mutation { foo }`,
      };

      const { data } = await this.client.mutate(operation);

      chai.expect(data).to.deep.equal({ foo: 'fooMutated' });
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

      it('returns the meteorUserId', async function () {
        const operation = {
          query: gql`query { meteorUserId }`,
        };

        const { data } = await this.client.query(operation);

        chai.expect(data.meteorUserId).to.be.a('string');
        chai.expect(data.meteorUserId).to.equal(this.userId);
      });
    });
  });
});
