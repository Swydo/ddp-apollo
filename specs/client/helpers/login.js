import { Accounts } from 'meteor/accounts-base';

export function loginWithUserId(userId) {
  return new Promise((resolve, reject) => {
    Accounts.callLoginMethod({
      methodArguments: [{ userId }],
      userCallback: err => (err ? reject(err) : resolve()),
    });
  });
}
