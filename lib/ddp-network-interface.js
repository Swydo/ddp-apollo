import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { DEFAULT_METHOD, DEFAULT_PUBLICATION, DEFAULT_COLLECTION } from './common';

class DDPNetworkInterface {
  constructor({
      connection = Meteor.connection,
      noRetry = true,
      method = DEFAULT_METHOD,
      publication = DEFAULT_PUBLICATION,
      collection = DEFAULT_COLLECTION,
  } = {}) {
    this.connection = connection;
    this.noRetry = noRetry;
    this.method = method;
    this.publication = publication;

    const { _stores: stores } = connection;

    // If the collection already exists, retrieve it
    if (stores[collection]) {
      const { _getCollection: getCollection } = stores[collection];
      this.collection = getCollection();
    } else {
      this.collection = new Mongo.Collection(collection);
    }

    this.registeredSubscriptions = {};
  }

  query(request = {}) {
    return new Promise((resolve) => {
      this.connection.apply(this.method, [request], { noRetry: this.noRetry }, (error, data) => {
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
    const { subscriptionId } = subHandler;

    const observerHandler = this.collection
    .find({ _id: subscriptionId })
    .observe({
      changed(newDocument) {
        handler(newDocument.error, newDocument.data);
      },
    });

    this.registeredSubscriptions[subscriptionId] = {
      subHandler,
      observerHandler,
    };

    return subscriptionId;
  }

  unsubscribe(id) {
    const sub = this.registeredSubscriptions[id];

    if (sub) {
      sub.subHandler.stop();
      sub.observerHandler.stop();
      delete this.registeredSubscriptions[id];
    }
  }
}

export { DDPNetworkInterface };
