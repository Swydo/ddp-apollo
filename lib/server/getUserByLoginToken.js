const USER_TOKEN_PATH = 'services.resume.loginTokens.hashedToken';
const NO_VALID_USER = undefined;

let Accounts;

try {
  // `accounts-base` is a weak dependency, so we'll try to require it
  // eslint-disable-next-line global-require, prefer-destructuring
  Accounts = require('meteor/accounts-base').Accounts;
} catch (err) {
  // Accounts could not be loaded
  // Perhaps we should warn people when this is the case
}

export async function getUserByLoginToken(loginToken) {
  if (!Accounts || !loginToken) { return NO_VALID_USER; }

  if (typeof loginToken !== 'string') {
    throw new Error("GraphQL login token isn't a string");
  }

  // the hashed token is the key to find the possible current user in the db
  const hashedToken = Accounts._hashLoginToken(loginToken);

  // get the possible user from the database
  const user = await Meteor.users.rawCollection().findOne({ [USER_TOKEN_PATH]: hashedToken });

  if (!user) { return NO_VALID_USER; }

  // find the corresponding token: the user may have several open sessions on different clients
  const currentToken = user.services.resume.loginTokens
    .find(token => token.hashedToken === hashedToken);

  const tokenExpiresAt = Accounts._tokenExpiration(currentToken.when);
  const isTokenExpired = tokenExpiresAt < new Date();

  if (isTokenExpired) { return NO_VALID_USER; }

  return user;
}
