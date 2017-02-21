/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import { DDPNetworkInterface } from '../lib/ddp-network-interface';
import { DEFAULT_METHOD } from '../lib/common';

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
    it('should return a promise', function () {
      chai.expect(this.ni.query()).to.be.instanceof(Promise);
    });
  });
});
