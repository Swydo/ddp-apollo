/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import gql from 'graphql-tag';
import { Promise } from 'meteor/promise';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { getDDPLink } from 'apollo-link-ddp';
import { FOO_CHANGED_TOPIC } from '../data/resolvers';

describe('Using SimpleDDP', function () {
  beforeEach(function () {
    // The ApolloClient won't recognize Promise in package tests unless exported like this
    global.Promise = Promise;

    // eslint-disable-next-line global-require
    const SimpleDDP = require('simpleddp');

    const ddp = new SimpleDDP({
      endpoint: 'ws://localhost:3000/websocket',
      SocketConstructor: global.WebSocket,
    });

    // SimpleDDP has a different API than the default DDP client
    // We need to map some functions to a format which the DDP link understands
    ddp.apply = ddp.call;
    ddp.subscribe = (pub, ...args) => ddp.sub(pub, args);

    this.link = getDDPLink({
      connection: ddp,
      socket: ddp.ddpConnection.socket,
      subscriptionIdKey: 'subid',
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

      this.link.subscriptionLink.connection.call('ddp-apollo/publish', [FOO_CHANGED_TOPIC, message]);
    });
  });
});
