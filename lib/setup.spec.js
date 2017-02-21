/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import { setup } from './setup';
import { DEFAULT_METHOD } from './common';

describe('#setup', function () {
  before(function () {
    setup();
  });

  after(function () {
    delete Meteor.default_server.method_handlers[DEFAULT_METHOD];
  });

  it('should add a method', function (done) {
    Meteor.call(DEFAULT_METHOD, done);
  });
});
