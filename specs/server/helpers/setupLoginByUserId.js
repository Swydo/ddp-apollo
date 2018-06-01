import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
  createTestUser() {
    return Meteor.users.insert({});
  },
});

Accounts.registerLoginHandler('testLogin', (request) => {
  if (!(typeof request.userId === 'string')) {
    return undefined;
  }
  const user = Meteor.users.findOne(request.userId);

  if (!user) {
    return { error: new Meteor.Error('USER_NOT_FOUND') };
  }
  return { userId: user._id };
});
