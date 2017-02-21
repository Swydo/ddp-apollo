/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import sinon from 'sinon';
import { makeExecutableSchema } from 'graphql-tools';
import OpticsAgent from 'optics-agent';

import { setup, createGraphQlMethod } from './setup';
import { DEFAULT_METHOD } from './common';
import * as optics from './optics';

OpticsAgent.configureAgent({
  apiKey: 'foo',
});

const typeDefs = [`
type RootQuery {
  foo: String
}
schema {
  query: RootQuery
}
`];

const resolvers = {
  RootQuery: {
    foo: () => 'bar',
  },
};

describe('#setup', function () {
  afterEach(function () {
    delete Meteor.default_server.method_handlers[DEFAULT_METHOD];
  });

  describe('method', function () {
    beforeEach(function () {
      setup();
    });

    it('should add a method', function (done) {
      Meteor.call(DEFAULT_METHOD, done);
    });
  });

  describe('optics', function () {
    it('should auto-detect if optics should be added', function (done) {
      const schema = makeExecutableSchema({
        resolvers,
        typeDefs,
      });

      OpticsAgent.instrumentSchema(schema);

      const functions = Object.keys(optics);

      const fakeOptics = functions.reduce((all, current) => {
        // eslint-disable-next-line no-param-reassign
        all[current] = function () {
          // empty
        };
        return all;
      }, {});

      const spies = functions.map(name => sinon.spy(fakeOptics, name));

      createGraphQlMethod(schema, { optics: fakeOptics })();

      Meteor.defer(() => {
        try {
          spies.forEach((spy) => {
            chai.expect(spy.callCount, spy.displayName).to.equal(1);
          });
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
