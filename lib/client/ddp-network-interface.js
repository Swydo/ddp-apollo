import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { DEFAULT_METHOD, DEFAULT_PUBLICATION, DEFAULT_COLLECTION } from '../common/defaults';

const DEFAULT_CLEANUP_INTERVAL = 60000;

class DDPNetworkInterface {
  constructor({
    connection = Meteor.connection,
    method = DEFAULT_METHOD,
    publication = DEFAULT_PUBLICATION,
    collection = DEFAULT_COLLECTION,
    cleanUpInterval = DEFAULT_CLEANUP_INTERVAL,
  } = {}) {
    this.connection = connection;
    this.method = method;
    this.publication = publication;
    this.cleanUpInterval = cleanUpInterval;

    const { _stores: stores } = connection;

    // If the collection already exists, retrieve it
    if (stores[collection]) {
      const { _getCollection: getCollection } = stores[collection];
      this.collection = getCollection();
    } else {
      this.collection = new Mongo.Collection(collection);
    }

    this.registeredSubscriptions = {};

    setInterval(() => {
      Object.keys(this.registeredSubscriptions).forEach((subId) => {
        // eslint-disable-next-line no-underscore-dangle
        this.collection._collection.remove({
          dt: { $lte: +new Date() - 1000 },
          subId,
        });
      });
    }, this.cleanUpInterval);
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

    const observerHandler = this.collection
      .find({ subId })
      .observe({
        added(doc = {}) {
          handler(doc.error, doc.data);
        },
      });

    this.registeredSubscriptions[subId] = {
      subHandler,
      observerHandler,
    };

    return subId;
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
