/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import { makeExecutableSchema } from 'graphql-tools';
import gql from 'graphql-tag';

import { setup, DDP_APOLLO_SCHEMA_REQUIRED } from '../../lib/server/setup';
import { createGraphQLMethod } from '../../lib/server/createGraphQLMethod';
import { DEFAULT_METHOD } from '../../lib/common/defaults';

import { typeDefs } from '../data/typeDefs';
import { resolvers } from '../data/resolvers';
import { reset } from './helpers';

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

  describe('context', function () {
    it('accepts an object', function (done) {
      const schema = makeExecutableSchema({
        resolvers: {
          Query: {
            foo: (_, __, { foo, bar }) => [foo, bar].join(':'),
          },
        },
        typeDefs,
      });

      const context = {
        foo: 'baz',
        bar: 'qux',
      };

      setup({ schema, context });

      const request = {
        query: gql`{ foo }`,
      };

      Meteor.apply(DEFAULT_METHOD, [request], function (err, { data }) {
        try {
          chai.expect(data.foo).to.equal('baz:qux');
          done(err);
        } catch (e) {
          done(e);
        }
      });
    });

    it('accepts a function', function (done) {
      const schema = makeExecutableSchema({
        resolvers: {
          Query: {
            foo: (_, __, { foo, bar }) => [foo, bar].join(':'),
          },
        },
        typeDefs,
      });

      const context = () => ({
        foo: 'baz',
        bar: 'qux',
      });

      setup({ schema, context });

      const request = {
        query: gql`{ foo }`,
      };

      Meteor.apply(DEFAULT_METHOD, [request], function (err, { data }) {
        try {
          chai.expect(data.foo).to.equal('baz:qux');
          done(err);
        } catch (e) {
          done(e);
        }
      });
    });

    it('accepts an async function', function (done) {
      const schema = makeExecutableSchema({
        resolvers: {
          Query: {
            foo: (_, __, { foo, bar }) => [foo, bar].join(':'),
          },
        },
        typeDefs,
      });

      const getQux = async () => 'qux';

      const context = async () => ({
        foo: 'baz',
        bar: await getQux(),
      });

      setup({ schema, context });

      const request = {
        query: gql`{ foo }`,
      };

      Meteor.apply(DEFAULT_METHOD, [request], function (err, { data }) {
        try {
          chai.expect(data.foo).to.equal('baz:qux');
          done(err);
        } catch (e) {
          done(e);
        }
      });
    });

    it('leaves the original values alone', function (done) {
      const schema = makeExecutableSchema({
        resolvers: {
          Query: {
            foo: (_, __, context) => {
              chai.expect(Object.getOwnPropertyNames(context)).to.include('userId');
              chai.expect(Object.getOwnPropertyNames(context)).to.include('foo');
              done();
            },
          },
        },
        typeDefs,
      });

      const context = { foo: 'baz' };

      setup({ schema, context });

      const request = { query: gql`{ foo }` };

      Meteor.apply(DEFAULT_METHOD, [request], () => {});
    });
  });

  describe('createContext', function () {
    it('is called with the current context', function (done) {
      const request = { query: gql`{ foo }` };

      const schema = makeExecutableSchema({
        resolvers,
        typeDefs,
      });

      function createContext(currentContext) {
        chai.expect(Object.getOwnPropertyNames(currentContext)).to.include('userId');
        done();
      }

      createGraphQLMethod(schema, { createContext })(request).catch(done);
    });

    it('returns a modified context', function (done) {
      const request = { query: gql`{ foo }` };

      const schema = makeExecutableSchema({
        resolvers: {
          Query: {
            foo: (_, __, { foo, bar }) => [foo, bar].join(':'),
          },
        },
        typeDefs,
      });

      const createContext = () => ({ foo: 'baz', bar: 'qux' });

      createGraphQLMethod(schema, { createContext })(request)
        .then(({ data }) => {
          chai.expect(data.foo).to.equal('baz:qux');
          done();
        })
        .catch(done);
    });
  });
});
