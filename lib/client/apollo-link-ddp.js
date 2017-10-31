import { ApolloLink, Observable } from 'apollo-link';
import { Meteor } from 'meteor/meteor';
import { DEFAULT_METHOD, DEFAULT_PUBLICATION } from '../common/defaults';
import { isASubscriptionOperation } from '../common/isSubscription';
import listenToGraphQLMessages from './listenToGraphQLMessages';

export default class DDPLink extends ApolloLink {
  constructor({
    connection = Meteor.connection,
    method = DEFAULT_METHOD,
    publication = DEFAULT_PUBLICATION,
  } = {}) {
    super();
    this.connection = connection;
    this.method = method;
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
    const isSub = isASubscriptionOperation(operation.query, operation.operationName);

    if (isSub) {
      return this.subscribe(operation);
    }

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

  subscribe(operation = {}) {
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

export function getDDPLink(options) {
  return new DDPLink(options);
}
