/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import { setup } from './setup';

describe('#setup', function () {
  before(function () {
    setup();
  });

  it('should add a method', function (done) {
    Meteor.call('/graphql', done);
  });
});
