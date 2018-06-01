import { pubsub } from './pubsub';

export const FOO_CHANGED_TOPIC = 'foo_changed';

export const resolvers = {
  Query: {
    foo: () => 'bar',
    userId: (_, __, { userId } = {}) => userId,
    ddpContextValue: (_, __, { ddpContext } = {}) => ddpContext,
  },
  Subscription: {
    fooSub: {
      subscribe: () => pubsub.asyncIterator(FOO_CHANGED_TOPIC),
    },
  },
};
