/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import { makeExecutableSchema } from 'graphql-tools';
import gql from 'graphql-tag';
import { ApolloGateway, LocalGraphQLDataSource } from '@apollo/gateway';
import { buildFederatedSchema } from '@apollo/federation';
import { DEFAULT_METHOD } from 'apollo-link-ddp';

import { setup } from '../../src/setup';
import { DDP_APOLLO_SCHEMA_REQUIRED } from '../../src/initSchema';
import { createGraphQLMethod } from '../../src/createGraphQLMethod';

import { typeDefs } from '../data/typeDefs';
import { resolvers } from '../data/resolvers';
import { reset } from './helpers';
import { callPromise } from '../client/helpers/callPromise';

async function callMethod(...args) {
  return callPromise.apply(this, [DEFAULT_METHOD, ...args]);
}

describe('#setup', function () {
  beforeEach(function () {
    reset();
  });

  it('requires a schema', async function () {
    try {
      await setup();
      throw new Error('Setup without schema should fail!');
    } catch (e) {
      chai.expect(e.message).to.equal(DDP_APOLLO_SCHEMA_REQUIRED);
    }
  });

  describe('method', function () {
    beforeEach(async function () {
      const schema = makeExecutableSchema({
        resolvers,
        typeDefs,
      });

      await setup({ schema });
    });

    it('should add a method', function (done) {
      Meteor.call(DEFAULT_METHOD, done);
    });

    it('should return data', async function () {
      const request = {
        query: gql`{ foo }`,
      };

      const { data } = await callMethod(request);

      chai.expect(data.foo).to.equal('bar');
    });
  });

  describe('context', function () {
    it('accepts an object', async function () {
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

      const request = {
        query: gql`{ foo }`,
      };

      await setup({ schema, context });

      const { data } = await callMethod(request);

      chai.expect(data.foo).to.equal('baz:qux');
    });

    it('accepts a function', async function () {
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

      const request = {
        query: gql`{ foo }`,
      };

      await setup({ schema, context });

      const { data } = await callMethod(request);

      chai.expect(data.foo).to.equal('baz:qux');
    });

    it('accepts an async function', async function () {
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

      const request = {
        query: gql`{ foo }`,
      };

      await setup({ schema, context });

      const { data } = await callMethod(request);

      chai.expect(data.foo).to.equal('baz:qux');
    });

    it('leaves the original values alone', async function (done) {
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

      const request = { query: gql`{ foo }` };

      await setup({ schema, context });

      await callMethod(request);
    });
  });

  describe('createContext', function () {
    it('is called with the current context', function (done) {
      const request = { query: gql`{ foo }` };

      const schema = makeExecutableSchema({
        resolvers,
        typeDefs,
      });

      function context(currentContext) {
        chai.expect(Object.getOwnPropertyNames(currentContext)).to.include('userId');
        done();
      }

      createGraphQLMethod({ schema, context })(request).catch(done);
    });

    it('returns a modified context', async function () {
      const request = { query: gql`{ foo }` };

      const schema = makeExecutableSchema({
        resolvers: {
          Query: {
            foo: (_, __, { foo, bar }) => [foo, bar].join(':'),
          },
        },
        typeDefs,
      });

      const context = () => ({ foo: 'baz', bar: 'qux' });

      const { data } = await createGraphQLMethod({ schema, context })(request);

      chai.expect(data.foo).to.equal('baz:qux');
    });

    it('accepts a ddp context param', async function () {
      const request = { query: gql`{ foo }` };

      const schema = makeExecutableSchema({
        resolvers: {
          Query: { foo: (_, __, { foo }) => foo },
        },
        typeDefs,
      });

      const context = (_, clientContext) => clientContext;

      const { data } = await createGraphQLMethod({ schema, context })(request, { foo: 'bar' });

      chai.expect(data.foo).to.equal('bar');
    });
  });

  describe('gateway', function () {
    beforeEach(async function () {
      const {
        Subscription,
        ...resolversWithoutSubscriptions
      } = resolvers;

      const typeDefsWithoutSubscriptions = {
        ...typeDefs,
        definitions: typeDefs.definitions.filter((def) => def.name.value !== 'Subscription'),
      };

      const schema = buildFederatedSchema([{
        resolvers: resolversWithoutSubscriptions,
        typeDefs: typeDefsWithoutSubscriptions,
      }]);

      const gateway = new ApolloGateway({
        serviceList: [{ name: 'local', url: 'foo' }],
        buildService: () => new LocalGraphQLDataSource(schema),
      });

      await setup({ gateway });
    });

    it('returns data via method', async function () {
      const request = {
        query: gql`{ foo }`,
      };

      const { data } = await callMethod(request);

      chai.expect(data.foo).to.equal('bar');
    });

    it('supports context with userId', async function () {
      const request = {
        query: gql`{ contextToString }`,
      };

      const { data } = await callMethod(request);

      chai.expect(data.contextToString).to.be.ok;
      chai.expect(JSON.parse(data.contextToString)).to.have.property('userId');
    });
  });
});
