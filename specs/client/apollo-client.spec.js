/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import gql from 'graphql-tag';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { getDDPLink } from '../../lib/client/apollo-link-ddp';
import { FOO_CHANGED_TOPIC } from '../data/resolvers';

describe('ApolloClient with DDP link', function () {
  beforeEach(function () {
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

    it('returns subscription data', function (done) {
      const message = { fooSub: 'bar' };
      const observer = this.client.subscribe({ query: gql`subscription { fooSub }` });

      const subscription = observer.subscribe({
        next: (data) => {
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
