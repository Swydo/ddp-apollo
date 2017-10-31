export const resolvers = {
  Query: {
    foo: () => 'bar',
  },
  Subscription: {
    fooSub: data => data,
  },
};
