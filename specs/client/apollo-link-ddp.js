/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import gql from 'graphql-tag';
import { ApolloLink, Observable } from 'apollo-link';
import { loginWithUserId } from './helpers/login';
import { callPromise } from './helpers/callPromise';
import { getDDPLink, DDPMethodLink, DDPSubscriptionLink } from '../../lib/client/apollo-link-ddp';
import { DEFAULT_METHOD, DEFAULT_PUBLICATION, GRAPHQL_SUBSCRIPTION_MESSAGE_TYPE } from '../../lib/common/defaults';
import { FOO_CHANGED_TOPIC } from '../data/resolvers';

describe('DDPMethodLink', function () {
  beforeEach(function (done) {
    this.link = new DDPMethodLink();

    Meteor.call('ddp-apollo/setup', done);
  });

  it('should add a default method', function () {
    chai.expect(this.link.method).to.equal(DEFAULT_METHOD);
  });

  describe('#request', function () {
    it('should return an observer', function () {
      const operation = {
        query: gql`query { foo }`,
      };

      chai.expect(this.link.request(operation)).to.be.instanceof(Observable);
    });

    it('returns data', function (done) {
      const operation = {
        query: gql`query { foo }`,
      };

      const observer = this.link.request(operation);

      observer.subscribe({
        next: ({ data }) => {
          try {
            chai.expect(data.foo).to.be.a('string');
            done();
          } catch (e) {
            done(e);
          }
        },
        error: done,
      });
    });
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

    it('returns the userId', function (done) {
      const operation = {
        query: gql`query { userId }`,
      };

      const observer = this.link.request(operation);

      observer.subscribe({
        next: ({ data }) => {
          try {
            chai.expect(data.userId).to.be.a('string');
            chai.expect(data.userId).to.equal(this.userId);
            done();
          } catch (e) {
            done(e);
          }
        },
        error: done,
      });
    });

    it('returns the meteorUserId', function (done) {
      const operation = {
        query: gql`query { meteorUserId }`,
      };

      const observer = this.link.request(operation);

      observer.subscribe({
        next: ({ data }) => {
          try {
            chai.expect(data.meteorUserId).to.be.a('string');
            chai.expect(data.meteorUserId).to.equal(this.userId);
            done();
          } catch (e) {
            done(e);
          }
        },
        error: done,
      });
    });

    it('returns the isDDP flag', function (done) {
      const operation = {
        query: gql`query { isDDP }`,
      };

      const observer = this.link.request(operation);

      observer.subscribe({
        next: ({ data }) => {
          try {
            chai.expect(data.isDDP).to.be.a('boolean');
            chai.expect(data.isDDP).to.be.true;
            done();
          } catch (e) {
            done(e);
          }
        },
        error: done,
      });
    });
  });

  describe('when disconnected', function () {
    beforeEach(function () {
      Meteor.disconnect();
    });

    afterEach(function () {
      // Reconnect in case the test fail before being able to do so
      Meteor.reconnect();
    });

    it('retries automatically', function (done) {
      const operation = {
        query: gql`query { foo }`,
      };

      this.link.request(operation).subscribe({
        next: ({ data }) => {
          try {
            chai.expect(data.foo).to.be.a('string');
            done();
          } catch (e) {
            done(e);
          }
        },
        error: done,
      });

      Meteor.reconnect();
    });

    it('can be configured to prevent retrying automatically', function (done) {
      this.link = new DDPMethodLink({ ddpRetry: false });

      const operation = {
        query: gql`query { foo }`,
      };

      this.link.request(operation).subscribe({
        error: (err) => {
          try {
            chai.expect(err.message).to.contain('noRetry');
            done();
          } catch (e) {
            done(e);
          }
        },
      });

      Meteor.reconnect();
    });
  });
});

describe('DDPSubscriptionLink', function () {
  beforeEach(function (done) {
    this.link = new DDPSubscriptionLink();

    Meteor.call('ddp-apollo/setup', done);
  });

  afterEach(function () {
    this.link.ddpSubscription.unsubscribe();
  });

  it('should add a default publication', function () {
    chai.expect(this.link.publication).to.equal(DEFAULT_PUBLICATION);
  });

  it('subscribes to DDP messages', function () {
    chai.expect(this.link.ddpObserver).to.be.an('object');
    chai.expect(this.link.ddpSubscription).to.be.an('object');
  });

  describe('#request', function () {
    it('should return an id and data', function (done) {
      const operation = {
        query: gql`subscription { fooSub }`,
      };
      const message = { fooSub: 'bar' };

      const observer = this.link.request(operation);

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

    it('should receive multiple updates', function (done) {
      const loops = 5;
      let count = 0;
      const operation = {
        query: gql`subscription { fooSub }`,
      };
      const value = 'bar';

      const observer = this.link.request(operation);

      const subscription = observer.subscribe({
        next: () => ++count,
      });

      const promises = [];

      for (let i = 0; i < loops; i += 1) {
        promises.push(callPromise('ddp-apollo/publish', FOO_CHANGED_TOPIC, { fooSub: value }));
      }

      Promise.all(promises).then(() => {
        Meteor.setTimeout(() => {
          try {
            chai.expect(count, 'number of next calls').to.equal(loops);
            subscription.unsubscribe();
            done();
          } catch (e) {
            done(e);
          }
        }, 100);
      });
    });

    it('accepts a custom DDP observer', function (done) {
      const operation = {
        query: gql`subscription { fooSub }`,
      };
      const message = { fooSub: 'custom' };
      let customObserverLink;

      const ddpObserver = new Observable((observer) => {
        setTimeout(() => {
          observer.next({
            type: GRAPHQL_SUBSCRIPTION_MESSAGE_TYPE,
            subId: customObserverLink.subscriptionObservers.keys().next().value,
            graphqlData: { data: { ...message } },
          });
          observer.complete();
        }, 10);
      });

      customObserverLink = new DDPSubscriptionLink({ ddpObserver });

      chai.expect(customObserverLink.ddpObserver).to.equal(ddpObserver);

      const observer = customObserverLink.request(operation);

      const subscription = observer.subscribe({
        next: ({ data }) => {
          try {
            chai.expect(data).to.deep.equal(message);
            subscription.unsubscribe();
            customObserverLink.ddpSubscription.unsubscribe();
            done();
          } catch (e) {
            done(e);
          }
        },
        error: done,
      });
    });
  });
});

describe('#getDDPLink', function () {
  beforeEach(function () {
    this.link = getDDPLink();
  });

  afterEach(function () {
    this.link.subscriptionLink.ddpSubscription.unsubscribe();
  });

  it('should return an instance of ApolloLink', function () {
    chai.expect(this.link).to.be.an.instanceOf(ApolloLink);
  });
});
