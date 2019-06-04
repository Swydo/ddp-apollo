const isSubscriptionDefinition = ({ kind, operation }) => kind === 'OperationDefinition' && operation === 'subscription';

const isSubscription = ({ query }) => query
  && query.definitions
  && query.definitions.some(isSubscriptionDefinition);

module.exports = isSubscription;
