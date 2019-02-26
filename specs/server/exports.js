/* eslint-disable prefer-arrow-callback, func-names, import/named */
/* eslint-env mocha */
import { expect } from 'chai';
import {
  DDP_APOLLO_SCHEMA_REQUIRED,
  setup,
  createGraphQLPublication,
  setupHttpEndpoint,
} from '../../server';

describe('Server exports', function () {
  it('exports the DDP_APOLLO_SCHEMA_REQUIRED constant', function () {
    expect(DDP_APOLLO_SCHEMA_REQUIRED).to.be.a('string');
  });

  it('exports the setup function', function () {
    expect(setup).to.be.a('function');
  });

  it('exports the createGraphQLPublication function', function () {
    expect(createGraphQLPublication).to.be.a('function');
  });

  it('exports the setupHttpEndpoint function', function () {
    expect(setupHttpEndpoint).to.be.a('function');
  });
});
