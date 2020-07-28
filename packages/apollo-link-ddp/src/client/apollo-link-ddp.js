const { ApolloLink, Observable, split } = require('@apollo/client');
const isSubscription = require('../common/isSubscription');
const {
  DEFAULT_METHOD,
  DEFAULT_PUBLICATION,
  DEFAULT_CLIENT_CONTEXT_KEY,
  DEFAULT_SUBSCRIPTION_ID_KEY,
} = require('../common/defaults');
const {
  createClientStreamObserver,
  createSocketObserver,
  filterGraphQLMessages,
} = require('./listenToGraphQLMessages');

function getDefaultMeteorConnection() {
  try {
    // eslint-disable-next-line global-require
    const { Meteor } = require('meteor/meteor');
    return Meteor.connection;
  } catch (err) {
    throw new Error('ddp-apollo: missing connection param');
  }
}

function getClientContext(operation, key = DEFAULT_CLIENT_CONTEXT_KEY) {
  return operation.getContext && operation.getContext()[key];
}

function callPromise(connection, name, args, options) {
  return new Promise((resolve, reject) => {
    const promise = connection.apply(name, args, options, (err, data) => {
      err ? reject(err) : resolve(data);
    });
    if (promise && promise.then) { resolve(promise); }
  });
}

class DDPMethodLink extends ApolloLink {
  constructor({
    connection = getDefaultMeteorConnection(),
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
      callPromise(this.connection, this.method, args, options)
        .then(result => observer.next(result))
        .catch(err => observer.error(err))
        .finally(() => observer.complete());

      return () => {};
    });
  }
}

class DDPSubscriptionLink extends ApolloLink {
  constructor({
    connection = getDefaultMeteorConnection(),
    publication = DEFAULT_PUBLICATION,
    subscriptionIdKey = DEFAULT_SUBSCRIPTION_ID_KEY,
    clientContextKey,
    socket,
  } = {}) {
    super();
    this.connection = connection;
    this.publication = publication;
    this.clientContextKey = clientContextKey;
    this.subscriptionIdKey = subscriptionIdKey;

    this.subscriptionObservers = new Map();
    this.ddpObserver = socket
      ? createSocketObserver(socket)
      : createClientStreamObserver(this.connection._stream);

    this.ddpSubscription = this.ddpObserver
      .subscribe({
        next: filterGraphQLMessages(({
          subscriptionId,
          result,
        }) => {
          const observer = this.subscriptionObservers.get(subscriptionId);

          if (observer) {
            observer.next(result);
          }
        }),
      });
  }

  request(operation = {}) {
    const clientContext = getClientContext(operation, this.clientContextKey);
    const subHandler = this.connection.subscribe(this.publication, operation, clientContext);
    const subId = subHandler[this.subscriptionIdKey];

    return new Observable((observer) => {
      this.subscriptionObservers.set(subId, observer);

      return () => {
        if (subHandler.stop) {
          subHandler.stop();
        } else if (this.connection.unsubscribe) {
          this.connection.unsubscribe(subId);
        } else {
          console.warn(`ddp-apollo: could not unsubscribe from subscription with ID ${subId}`);
        }
        this.subscriptionObservers.delete(subId);
      };
    });
  }
}

/*
* DDPLink combines the functionality from the method link and the subscription link
* providing support for queries, mutations and subscriptions.
*/
class DDPLink extends ApolloLink {
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

function getDDPLink(options) {
  return new DDPLink(options);
}

module.exports = {
  getDDPLink,
  DDPLink,
  DDPMethodLink,
  DDPSubscriptionLink,
};
