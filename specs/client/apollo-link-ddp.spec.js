/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import gql from 'graphql-tag';
import { ApolloLink, Observable } from 'apollo-link';
import { getDDPLink, DDPMethodLink, DDPSubscriptionLink } from '../../lib/client/apollo-link-ddp';
import { DEFAULT_METHOD, DEFAULT_PUBLICATION } from '../../lib/common/defaults';
import { FOO_CHANGED_TOPIC } from '../data/resolvers';

function callPromise(name, ...args) {
  return new Promise((resolve, reject) => {
    Meteor.apply(name, args, (err, data) => {
      err ? reject(err) : resolve(data);
    });
  });
}

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

  });
});

describe('DDPSubscriptionLink', function () {
  beforeEach(function (done) {
    this.link = new DDPSubscriptionLink();

    Meteor.call('ddp-apollo/setup', done);
  });

  it('should add a default publication', function () {
    chai.expect(this.link.publication).to.equal(DEFAULT_PUBLICATION);
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
  });
});

describe('#getDDPLink', function () {
  beforeEach(function () {
    this.link = getDDPLink();
  });

  it('should return an instance of ApolloLink', function () {
    chai.expect(this.link).to.be.an.instanceOf(ApolloLink);
  });
});
