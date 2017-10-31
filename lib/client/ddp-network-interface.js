import { Meteor } from 'meteor/meteor';
import { DEFAULT_METHOD, DEFAULT_PUBLICATION } from '../common/defaults';
import listenToGraphQLMessages from './listenToGraphQLMessages';

class DDPNetworkInterface {
  constructor({
    connection = Meteor.connection,
    method = DEFAULT_METHOD,
    publication = DEFAULT_PUBLICATION,
  } = {}) {
    this.connection = connection;
    this.method = method;
    this.publication = publication;

    this.handlers = {};

    listenToGraphQLMessages(this.connection, ({
      subscriptionId,
      result: {
        errors,
        data,
      },
    }) => {
      const handler = this.handlers[subscriptionId];

      if (handler) {
        handler(errors, data);
      }
    });
  }

  query(request = {}) {
    return new Promise((resolve) => {
      this.connection.apply(this.method, [request], (error, data) => {
        if (error) {
          resolve({ errors: [error] });
        } else {
          resolve(data);
        }
      });
    });
  }

  subscribe(request = {}, handler) {
    const subHandler = Meteor.subscribe(this.publication, request);
    const { subscriptionId: subId } = subHandler;

    this.handlers[subId] = handler;

    return subId;
  }

  unsubscribe(id) {
    // eslint-disable-next-line no-underscore-dangle
    const subscription = this.connection._subscriptions[id];

    if (subscription) {
      subscription.stop();
    }

    delete this.handlers[id];
  }
}

export { DDPNetworkInterface };
