/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import { expect } from 'chai';
import DDPLink, { DDPLink as namedDDPLink } from '../../client';

describe('Client exports', function () {
  it('exports the DDPLink', function () {
    expect(DDPLink).to.be.a('function');
  });

  it('exports a named DDPLink', function () {
    expect(namedDDPLink).to.be.a('function');
  });
});
