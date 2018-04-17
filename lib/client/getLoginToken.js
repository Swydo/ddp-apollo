/* global localStorage */
const LOGIN_TOKEN_KEY = 'Meteor.loginToken';

export function getLoginToken() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(LOGIN_TOKEN_KEY);
  }
  return undefined;
}
