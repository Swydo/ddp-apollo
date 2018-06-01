import { ApolloLink, split } from 'apollo-link';
import { DDPSubscriptionLink } from './apollo-link-ddp';
import { meteorAuthLink } from './apollo-link-meteor-auth';
import { DEFAULT_PATH } from '../common/defaults';
import { isSubscription } from '../common/isSubscription';

export class MeteorLink extends ApolloLink {
  constructor(options = {}) {
    super();

    // Only require HttpLink for people using the HTTP version
    // eslint-disable-next-line global-require
    const { HttpLink } = require('apollo-link-http');

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
