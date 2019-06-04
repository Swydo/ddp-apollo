/* global localStorage */
const LOGIN_TOKEN_KEY = 'Meteor.loginToken';

function getLoginToken() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(LOGIN_TOKEN_KEY);
  }
  return undefined;
}

module.exports = getLoginToken;
