const { ApolloLink, split } = require('@apollo/client');
const isSubscription = require('../common/isSubscription');
const { DDPSubscriptionLink } = require('./apollo-link-ddp');
const { DEFAULT_PATH } = require('../common/defaults');
const meteorAuthLink = require('./apollo-link-meteor-auth');

class MeteorLink extends ApolloLink {
  constructor(options = {}) {
    super();

    // Only require HttpLink for people using the HTTP version
    // eslint-disable-next-line global-require
    const { HttpLink } = require('@apollo/client');

    const {
      uri = Meteor.absoluteUrl(DEFAULT_PATH),
      httpLink,
      authLink = meteorAuthLink,
    } = options;

    this.meteorHttpLink = authLink.concat(httpLink || new HttpLink({ uri }));
    this.subscriptionLink = new DDPSubscriptionLink(options);
  }

  request(operation = {}) {
    return split(
      isSubscription,
      this.subscriptionLink,
      this.meteorHttpLink,
    ).request(operation);
  }
}

module.exports = MeteorLink;
