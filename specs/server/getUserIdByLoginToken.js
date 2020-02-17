/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import { getUserIdByLoginToken, NO_VALID_USER_ERROR } from '../../src/getUserIdByLoginToken';

describe('getUserIdByLoginToken', function () {
  it('throws error for bad tokens', async function () {
    try {
      await getUserIdByLoginToken('foo');
      chai.expect(false, 'this should not be touched').to.equal(true);
    } catch (err) {
      chai.expect(err).to.equal(NO_VALID_USER_ERROR);
    }
  });
});
