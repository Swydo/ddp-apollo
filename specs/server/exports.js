/* eslint-disable prefer-arrow-callback, func-names, import/named */
/* eslint-env mocha */
import { expect } from 'chai';
import {
  setup,
  createGraphQLPublication,
  setupHttpEndpoint,
} from '../../server';

describe('Server exports', function () {
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
