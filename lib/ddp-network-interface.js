import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { DEFAULT_METHOD, DEFAULT_PUBLICATION, DEFAULT_COLLECTION } from './common';

const subCollection = new Mongo.Collection(DEFAULT_COLLECTION);

class DDPNetworkInterface {
  constructor({
        connection = Meteor.connection,
        noRetry = true,
        method = DEFAULT_METHOD,
        publication = DEFAULT_PUBLICATION,
    } = {}) {
    this.connection = connection;
    this.noRetry = noRetry;
    this.method = method;
    this.publication = publication;

    this._subs = {};
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

    const observerHandler = subCollection.find({ _id: subscriptionId }).observe({
      changed(newDocument) {
        handler(newDocument.error, newDocument.data);
      },
    });

    this._subs[subscriptionId] = {
      subHandler,
      observerHandler,
    };

    return subscriptionId;
  }

  unsubscribe(id) {
    const sub = this._subs[id];

    if (sub) {
      sub.subHandler.stop();
      sub.observerHandler.stop();
      delete this._subs[id];
    }
  }
}

export { DDPNetworkInterface };
