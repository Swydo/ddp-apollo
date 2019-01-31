const DEFAULT_METHOD = '__graphql';
const DEFAULT_PUBLICATION = '__graphql-subscriptions';
const DEFAULT_SUBSCRIPTION_ID_KEY = 'subscriptionId';
const DEFAULT_CLIENT_CONTEXT_KEY = 'ddpContext';
const GRAPHQL_SUBSCRIPTION_MESSAGE_TYPE = 'graphql-sub-message';
const DEFAULT_PATH = '/graphql';
const DEFAULT_CREATE_CONTEXT = context => context;

const defaults = {
  DEFAULT_CLIENT_CONTEXT_KEY,
  DEFAULT_CREATE_CONTEXT,
  DEFAULT_METHOD,
  DEFAULT_PATH,
  DEFAULT_PUBLICATION,
  DEFAULT_SUBSCRIPTION_ID_KEY,
  GRAPHQL_SUBSCRIPTION_MESSAGE_TYPE,
};

module.exports = defaults;
