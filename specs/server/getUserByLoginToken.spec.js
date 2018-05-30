/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import { getUserByLoginToken, NO_VALID_USER_ERROR } from '../../lib/server/getUserByLoginToken';

describe('getUserByLoginToken', function () {
  it('throws error for bad tokens', async function () {
    try {
      await getUserByLoginToken('foo');
      chai.expect(false, 'this should not be touched').to.equal(true);
    } catch (err) {
      chai.expect(err).to.equal(NO_VALID_USER_ERROR);
    }
  });
});
