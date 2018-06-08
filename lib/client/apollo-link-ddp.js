import { ApolloLink, Observable, split } from 'apollo-link';
import { Meteor } from 'meteor/meteor';
import { DEFAULT_METHOD, DEFAULT_PUBLICATION, DEFAULT_CLIENT_CONTEXT_KEY } from '../common/defaults';
import { isSubscription } from '../common/isSubscription';
import listenToGraphQLMessages from './listenToGraphQLMessages';

function getClientContext(operation, key = DEFAULT_CLIENT_CONTEXT_KEY) {
  return operation.getContext && operation.getContext()[key];
}

export class DDPMethodLink extends ApolloLink {
  constructor({
    connection = Meteor.connection,
    method = DEFAULT_METHOD,
    ddpRetry = true,
    clientContextKey,
  } = {}) {
    super();
    this.connection = connection;
    this.method = method;
    this.clientContextKey = clientContextKey;
    this.ddpRetry = ddpRetry;
  }

  request(operation = {}) {
    const clientContext = getClientContext(operation, this.clientContextKey);
    const args = [operation, clientContext];
    const options = { noRetry: !this.ddpRetry };

    return new Observable((observer) => {
      this.connection.apply(this.method, args, options, (error, result) => {
        if (error) {
          observer.error(error);
        } else {
          observer.next(result);
        }
        observer.complete();
      });

      return () => {};
    });
  }
}

export class DDPSubscriptionLink extends ApolloLink {
  constructor({
    connection = Meteor.connection,
    publication = DEFAULT_PUBLICATION,
    clientContextKey,
  } = {}) {
    super();
    this.connection = connection;
    this.publication = publication;
    this.clientContextKey = clientContextKey;

    this.subscriptionObservers = new Map();

    listenToGraphQLMessages(this.connection._stream, ({
      subscriptionId,
      result,
    }) => {
      const observer = this.subscriptionObservers.get(subscriptionId);

      if (observer) {
        observer.next(result);
      }
    });
  }

  request(operation = {}) {
    const clientContext = getClientContext(operation, this.clientContextKey);
    const subHandler = this.connection.subscribe(this.publication, operation, clientContext);
    const { subscriptionId: subId } = subHandler;

    return new Observable((observer) => {
      this.subscriptionObservers.set(subId, observer);

      return () => {
        subHandler.stop();
        this.subscriptionObservers.delete(subId);
      };
    });
  }
}

/*
* DDPLink combines the functionality from the method link and the subscription link
* providing support for queries, mutations and subscriptions.
*/
export class DDPLink extends ApolloLink {
  constructor(options) {
    super();
    this.methodLink = new DDPMethodLink(options);
    this.subscriptionLink = new DDPSubscriptionLink(options);
  }

  request(operation = {}) {
    return split(
      isSubscription,
      this.subscriptionLink,
      this.methodLink,
    ).request(operation);
  }
}

export function getDDPLink(options) {
  return new DDPLink(options);
}
