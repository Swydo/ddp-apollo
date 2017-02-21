/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import { chai } from 'meteor/practicalmeteor:chai';
import { DDPNetworkInterface } from './ddp-network-interface';
import { DEFAULT_METHOD } from './common';

describe('#DDPNetworkInterface', function () {
  before(function () {
    this.ni = new DDPNetworkInterface({
      connection: Meteor.connection,
    });
  });

  it('should add a default method', function () {
    chai.expect(this.ni.method).to.equal(DEFAULT_METHOD);
  });

  describe('#query', function () {
    it('should return a promise', function (done) {
      this.ni.query().then(() => done());
    });
  });
});
