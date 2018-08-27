import { pubsub } from './pubsub';

export const FOO_CHANGED_TOPIC = 'foo_changed';

export const resolvers = {
  Query: {
    foo: () => 'bar',
    userId: (_, __, { userId } = {}) => userId,
    // Using Meteor.userId() yourself is not recommended. Use the context userId.
    // But to support a lot of Meteor packages it's useful, because they use it underwater.
    // See https://github.com/apollographql/meteor-integration/issues/92
    meteorUserId: () => Meteor.userId(),
    ddpContextValue: (_, __, { ddpContext } = {}) => ddpContext,
    somethingBad: () => { throw new Error('SOMETHING_BAD'); },
  },
  Mutation: {
    foo: () => 'fooMutated',
  },
  Subscription: {
    fooSub: {
      subscribe: () => pubsub.asyncIterator(FOO_CHANGED_TOPIC),
    },
  },
};
