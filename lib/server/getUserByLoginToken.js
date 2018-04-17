import { Accounts } from 'meteor/accounts-base';

const USER_TOKEN_PATH = 'services.resume.loginTokens.hashedToken';
const NO_VALID_USER = undefined;

export async function getUserByLoginToken(loginToken) {
  if (!loginToken) { return NO_VALID_USER; }

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
