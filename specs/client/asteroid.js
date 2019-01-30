/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import gql from 'graphql-tag';
import { Promise } from 'meteor/promise';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { getDDPLink } from 'apollo-link-ddp';
import { Observable } from 'apollo-link';
import { FOO_CHANGED_TOPIC } from '../data/resolvers';

describe('Using Asteroid', function () {
  beforeEach(function () {
    // The ApolloClient won't recognize Promise in package tests unless exported like this
    global.Promise = Promise;

    // eslint-disable-next-line global-require
    const { createClass } = require('asteroid');

    const Asteroid = createClass();
    const asteroid = new Asteroid({
      endpoint: 'ws://localhost:3000/websocket',
    });

    const ddpObserver = new Observable((observer) => {
      asteroid.ddp.socket.on('message:in', message => observer.next(message));
    });

    this.link = getDDPLink({
      connection: asteroid,
      ddpObserver,
    });

    this.client = new ApolloClient({
      link: this.link,
      cache: new InMemoryCache(),
    });
  });

  afterEach(function () {
    this.link.subscriptionLink.ddpSubscription.unsubscribe();
  });

  describe('#query', function () {
    it('returns query data', async function () {
      const { data } = await this.client.query({ query: gql`query { foo }` });

      chai.expect(data.foo).to.be.a('string');
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

      this.link.subscriptionLink.connection.call('ddp-apollo/publish', FOO_CHANGED_TOPIC, message);
    });
  });
});
