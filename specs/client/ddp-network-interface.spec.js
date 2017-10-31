/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import sinon from 'sinon';
import gql from 'graphql-tag';
import { DDPNetworkInterface } from '../../lib/client/ddp-network-interface';
import { DEFAULT_METHOD } from '../../lib/common/defaults';
import { FOO_CHANGED_TOPIC } from '../data/resolvers';

function callPromise(name, ...args) {
  return new Promise((resolve, reject) => {
    Meteor.apply(name, args, (err, data) => {
      err ? reject(err) : resolve(data);
    });
  });
}

describe('#DDPNetworkInterface', function () {
  beforeEach(function (done) {
    this.network = new DDPNetworkInterface();

    Meteor.call('ddp-apollo/setup', done);
  });

  it('should add a default method', function () {
    chai.expect(this.network.method).to.equal(DEFAULT_METHOD);
  });

  describe('#query', function () {
    it('should return a promise', function () {
      chai.expect(this.network.query()).to.be.instanceof(Promise);
    });
  });

  describe('#subscribe', function () {
    it('should return an id and data', function (done) {
      const request = {
        query: gql`subscription { fooSub }`,
      };
      const value = 'bar';

      const network = this.network;
      let subId;

      function handler(err, data) {
        try {
          chai.expect(data).to.deep.equal({ fooSub: value });
          network.unsubscribe(subId);
          done(err);
        } catch (e) {
          done(e);
        }
      }

      subId = this.network.subscribe(request, handler);
      chai.expect(subId).to.be.a('string');

      Meteor.call('ddp-apollo/publish', FOO_CHANGED_TOPIC, { fooSub: value });
    });

    it('should receive multiple updates', function (done) {
      const loops = 5;
      const request = {
        query: gql`subscription { fooSub }`,
      };
      const value = 'bar';

      const dummy = { handler() {} };

      const spy = sinon.spy(dummy, 'handler');

      this.network.subscribe(request, dummy.handler);

      const promises = [];

      for (let i = 0; i < loops; i += 1) {
        promises.push(callPromise('ddp-apollo/publish', FOO_CHANGED_TOPIC, { fooSub: value }));
      }

      Promise.all(promises).then(() => {
        Meteor.setTimeout(() => {
          try {
            chai.expect(spy.callCount).to.equal(loops);
            done();
          } catch (e) {
            done(e);
          }
        }, 100);
      });
    });
  });

  describe('#unsubscribe', function () {
    it('should remove the id', function (done) {
      const request = {
        query: gql`subscription { fooSub }`,
      };

      const subId = this.network.subscribe(request, function () {});

      chai.expect(this.network.handlers[subId]).to.be.a('function');

      setTimeout(() => {
        this.network.unsubscribe(subId);
        chai.expect(this.network.handlers[subId]).to.not.be.ok;
        done();
      }, 10);
    });
  });
});
