export const typeDefs = [`
type Query {
  foo: String
  userId: String
  isDDP: Boolean
  meteorUserId: String
  ddpContextValue: String
  somethingBad: String
}

type Mutation {
  foo: String
}

type Subscription {
  fooSub: String!
}
`];
