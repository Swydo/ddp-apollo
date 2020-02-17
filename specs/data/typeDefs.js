import gql from 'graphql-tag';

export const typeDefs = gql`
type Query {
  foo: String
  userId: String
  isDDP: Boolean
  meteorUserId: String
  ddpContextValue: String
  contextToString: String
  somethingBad: String
}

type Mutation {
  foo: String
}

type Subscription {
  fooSub: String!
}
`;
