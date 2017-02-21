/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import { chai } from 'meteor/practicalmeteor:chai';
import { DDPNetworkInterface } from './ddp-network-interface';

describe('#DDPNetworkInterface', function () {
  before(function () {
    this.ni = new DDPNetworkInterface({
      connection: Meteor.connection,
    });
  });

  it('should add a method', function () {
    chai.expect(this.ni.method).to.equal('/graphql');
  });

  describe('#query', function () {
    it('should return a promise', function (done) {
      this.ni.query().then(() => done());
    });
  });
});
