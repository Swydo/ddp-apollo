export const resolvers = {
  RootQuery: {
    foo: () => 'bar',
  },
  Subscription: {
    fooSub: data => data,
  },
};
