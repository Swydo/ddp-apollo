/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import sinon from 'sinon';
import { makeExecutableSchema } from 'graphql-tools';
import OpticsAgent from 'optics-agent';
import gql from 'graphql-tag';

import { setup, DDP_APOLLO_SCHEMA_REQUIRED } from '../../lib/server/setup';
import { createGraphQLMethod } from '../../lib/server/createGraphQLMethod';
import { DEFAULT_METHOD } from '../../lib/common/defaults';
import * as optics from '../../lib/server/optics';

import { typeDefs } from '../data/typeDefs';
import { resolvers } from '../data/resolvers';
import { reset } from './helpers';

OpticsAgent.configureAgent({
  apiKey: process.env.OPTICS_API_KEY || 'foo',
});

describe('#setup', function () {
  beforeEach(function () {
    reset();
  });

  it('requires a schema', function () {
    try {
      setup();
      throw new Error('Setup without schema should fail!');
    } catch (e) {
      chai.expect(e.message).to.equal(DDP_APOLLO_SCHEMA_REQUIRED);
    }
  });

  describe('method', function () {
    beforeEach(function () {
      const schema = makeExecutableSchema({
        resolvers,
        typeDefs,
      });

      setup({ schema });
    });

    it('should add a method', function (done) {
      Meteor.call(DEFAULT_METHOD, done);
    });

    it('should return data', function (done) {
      const request = {
        query: gql`{ foo }`,
      };

      Meteor.apply(DEFAULT_METHOD, [request], function (err, { data }) {
        try {
          chai.expect(data.foo).to.equal('bar');
          done(err);
        } catch (e) {
          done(e);
        }
      });
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

      createGraphQLMethod(schema, { optics: fakeOptics })();

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
