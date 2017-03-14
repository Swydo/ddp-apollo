export const typeDefs = [`
type RootQuery {
  foo: String
}

type Subscription {
  fooSub: String
}

schema {
  query: RootQuery
  subscription: Subscription
}
`];
