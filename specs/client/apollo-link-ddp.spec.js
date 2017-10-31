/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import gql from 'graphql-tag';
import { Observable } from 'apollo-link';
import { getDDPLink } from '../../lib/client/apollo-link-ddp';
import { DEFAULT_METHOD } from '../../lib/common/defaults';
import { FOO_CHANGED_TOPIC } from '../data/resolvers';

function callPromise(name, ...args) {
  return new Promise((resolve, reject) => {
    Meteor.apply(name, args, (err, data) => {
      err ? reject(err) : resolve(data);
    });
  });
}

describe('DDPLink', function () {
  beforeEach(function (done) {
    this.link = getDDPLink();

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
  });

  describe('#subscribe', function () {
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
