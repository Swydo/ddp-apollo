/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import gql from 'graphql-tag';
import { Promise } from 'meteor/promise';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { getDDPLink } from '../../lib/client/apollo-link-ddp';
import { FOO_CHANGED_TOPIC } from '../data/resolvers';

describe('ApolloClient with DDP link', function () {
  beforeEach(function () {
    // The ApolloClient won't recognize Promise in package tests unless exported like this
    global.Promise = Promise;

    this.client = new ApolloClient({
      link: getDDPLink(),
      cache: new InMemoryCache(),
    });
  });

  describe('#query', function () {
    it('returns query data', async function () {
      const { data } = await this.client.query({ query: gql`query { foo }` });

      chai.expect(data.foo).to.be.a('string');
    });

    it('should pass and retrieve a ddp context', async function () {
      const { data } = await this.client.query({
        query: gql`query { ddpContextValue }`,
        context: { ddpContext: 'ddpFoo' },
      });

      chai.expect(data.ddpContextValue).to.equal('ddpFoo');
    });

    it('handles errors', async function () {
      try {
        await this.client.query({
          query: gql`query { somethingBad }`,
        });
        chai.expect(false, 'this should not happen').to.equal(true);
      } catch (err) {
        chai.expect(err.message).to.equal('GraphQL error: SOMETHING_BAD');
        chai.expect(err.graphQLErrors[0].message).to.equal('SOMETHING_BAD');
      }
    });
  });

  describe('#subscribe', function () {
    it('returns subscription data', function (done) {
      const message = { fooSub: 'bar' };
      const observer = this.client.subscribe({ query: gql`subscription { fooSub }` });

      const subscription = observer.subscribe({
        next: ({ data }) => {
          try {
            chai.expect(data).to.deep.equal(message);
            subscription.unsubscribe();
            done();
          } catch (e) {
            done(e);
          }
        },
      });

      Meteor.call('ddp-apollo/publish', FOO_CHANGED_TOPIC, message);
    });
  });
});
