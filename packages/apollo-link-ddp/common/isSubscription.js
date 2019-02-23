const { getMainDefinition } = require('apollo-utilities');

const isSubscription = ({ query }) => {
  const { kind, operation } = getMainDefinition(query);
  return kind === 'OperationDefinition' && operation === 'subscription';
};

module.exports = isSubscription;
