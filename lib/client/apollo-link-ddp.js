import { ApolloLink, Observable, split } from 'apollo-link';
import { Meteor } from 'meteor/meteor';
import { DEFAULT_METHOD, DEFAULT_PUBLICATION } from '../common/defaults';
import { isSubscription } from '../common/isSubscription';
import listenToGraphQLMessages from './listenToGraphQLMessages';

export class DDPMethodLink extends ApolloLink {
  constructor({
    connection = Meteor.connection,
    method = DEFAULT_METHOD,
  } = {}) {
    super();
    this.connection = connection;
    this.method = method;
  }

  request(operation = {}) {
    return new Observable((observer) => {
      this.connection.apply(this.method, [operation], (error, result) => {
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
  } = {}) {
    super();
    this.connection = connection;
    this.publication = publication;

    this.subscriptionObservers = {};

    listenToGraphQLMessages(this.connection, ({
      subscriptionId,
      result,
    }) => {
      const observer = this.subscriptionObservers[subscriptionId];

      if (observer) {
        observer.next(result);
      }
    });
  }

  request(operation = {}) {
    const subHandler = this.connection.subscribe(this.publication, operation);
    const { subscriptionId: subId } = subHandler;

    return new Observable((observer) => {
      this.subscriptionObservers[subId] = observer;

      return () => {
        subHandler.stop();
        delete this.subscriptionObservers[subId];
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
