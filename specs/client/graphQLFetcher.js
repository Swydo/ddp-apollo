/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import { createGraphQLFetcher } from 'apollo-link-ddp';
import { callPromise } from './helpers/callPromise';
import { loginWithUserId } from './helpers/login';

describe('graphQLFetcher', function () {
  beforeEach(function () {
    this.fetcher = createGraphQLFetcher();
  });

  it('should return data from the server', async function () {
    const operation = {
      query: 'query { foo }',
    };

    const { data } = await this.fetcher(operation);

    chai.expect(data).to.deep.equal({ foo: 'bar' });
  });

  describe('when authenticated', function () {
    before(async function () {
      const userId = await callPromise('createTestUser');
      chai.expect(userId).to.be.a('string');
      this.userId = userId;
      await loginWithUserId(userId);
    });

    after(function (done) {
      Meteor.logout((err) => { err ? done(err) : done(); });
    });

    it('returns the userId', async function () {
      const operation = {
        query: 'query { userId, meteorUserId }',
      };

      const { data } = await this.fetcher(operation);

      chai.expect(data.userId).to.equal(this.userId);
      chai.expect(data.meteorUserId).to.equal(this.userId);
    });
  });
});

