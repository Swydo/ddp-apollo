import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { print } from 'graphql/language/printer';
import { createGraphQlMethod } from './createGraphQlMethod';
import {
  DEFAULT_METHOD,
  DEFAULT_COLLECTION,
  DEFAULT_PUBLICATION,
} from '../common/defaults';

export const DDP_APOLLO_SCHEMA_REQUIRED = 'DDP_APOLLO_SCHEMA_REQUIRED';

export function setupSubscriptions(subscriptionManager, {
  publication = DEFAULT_PUBLICATION,
  collection = DEFAULT_COLLECTION,
} = {}) {
  Meteor.publish(publication, function publishGraphQL({ query, variables } = {}) {
    const {
      userId,
      _subscriptionId: subId,
    } = this;

    if (!query) {
      return this.stop();
    }

    const subPromise = subscriptionManager.subscribe({
      query: print(query),
      variables,
      context: {
        userId,
      },
      callback: (errors, data) => {
        this.added(collection, Random.id(), {
          dt: +new Date(),
          subId,
          ...errors,
          ...data // eslint-disable-line comma-dangle
        });
      },
    });

    this.ready();

    this.onStop(() => {
      subPromise
        .then(id => subscriptionManager.unsubscribe(id))
        .catch(err => console.error(err)); // eslint-disable-line no-console
    });

    return undefined;
  });
}

export function setup(schema, {
  method = DEFAULT_METHOD,
  disableOptics = false,
  subscriptionManager,
  publication,
  collection,
} = {}) {
  if (!schema) {
    throw new Error(DDP_APOLLO_SCHEMA_REQUIRED);
  }

  const methods = {};

  methods[method] = createGraphQlMethod(schema, { disableOptics });

  // Maybe this should be done by the consumer of this package
  Meteor.methods(methods);

  if (subscriptionManager) {
    setupSubscriptions(subscriptionManager, {
      publication,
      collection,
    });
  }
}
