/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import { expect } from 'chai';
import DDPLink, {
  DDPLink as namedDDPLink,
  MeteorLink,
  meteorAuthLink,
  createGraphQLFetcher,
} from '../../client';

describe('Client exports', function () {
  it('exports the DDPLink', function () {
    expect(DDPLink).to.be.a('function');
  });

  it('exports a named DDPLink', function () {
    expect(namedDDPLink).to.be.a('function');
  });

  it('exports a MeteorLink', function () {
    expect(MeteorLink).to.be.a('function');
  });

  it('exports a meteorAuthLink', function () {
    expect(meteorAuthLink).to.be.a('function');
  });

  it('exports a createGraphQLFetcher', function () {
    expect(createGraphQLFetcher).to.be.a('function');
  });
});
