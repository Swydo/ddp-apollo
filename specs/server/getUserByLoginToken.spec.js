/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import { getUserByLoginToken } from '../../lib/server/getUserByLoginToken';

describe('getUserByLoginToken', function () {
  it('does not crash for bad tokens', async function () {
    const user = await getUserByLoginToken('foo');

    chai.expect(user).to.equal(undefined);
  });
});
