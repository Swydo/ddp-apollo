const USER_TOKEN_PATH = 'services.resume.loginTokens.hashedToken';
export const NO_VALID_USER_ERROR = new Error('NO_VALID_USER');

export async function getUserByLoginToken(loginToken) {
  // `accounts-base` is a weak dependency, so we'll try to require it
  // eslint-disable-next-line global-require, prefer-destructuring
  const { Accounts } = require('meteor/accounts-base');

  if (!loginToken) { throw NO_VALID_USER_ERROR; }

  if (typeof loginToken !== 'string') {
    throw new Error("GraphQL login token isn't a string");
  }

  // the hashed token is the key to find the possible current user in the db
  const hashedToken = Accounts._hashLoginToken(loginToken);

  // get the possible user from the database
  const user = await Meteor.users.rawCollection().findOne({ [USER_TOKEN_PATH]: hashedToken });

  if (!user) { throw NO_VALID_USER_ERROR; }

  // find the corresponding token: the user may have several open sessions on different clients
  const currentToken = user.services.resume.loginTokens
    .find(token => token.hashedToken === hashedToken);

  const tokenExpiresAt = Accounts._tokenExpiration(currentToken.when);
  const isTokenExpired = tokenExpiresAt < new Date();

  if (isTokenExpired) { throw NO_VALID_USER_ERROR; }

  return user;
}
