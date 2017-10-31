import { pubsub } from './pubsub';

export const FOO_CHANGED_TOPIC = 'foo_changed';

export const resolvers = {
  Query: {
    foo: () => 'bar',
  },
  Subscription: {
    fooSub: {
      subscribe: () => pubsub.asyncIterator(FOO_CHANGED_TOPIC),
    },
  },
};
