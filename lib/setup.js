import { runQuery } from 'graphql-server-core';
import { print } from 'graphql/language/printer';
import * as DEFAULT_OPTICS from './optics';
import {
  DEFAULT_METHOD,
  DEFAULT_COLLECTION,
  DEFAULT_PUBLICATION,
} from './common';

export const DDP_APOLLO_SCHEMA_REQUIERD = 'DDP_APOLLO_SCHEMA_REQUIERD';

export function createGraphQlMethod(schema, {
  disableOptics,
  optics = DEFAULT_OPTICS,
}) {
  // By setting disableOptics to true it can be disabled
  // Else, just check if the schema was instrumented
  const hasOptics = Boolean(!disableOptics && schema && schema._opticsInstrumented);

  return function graphQlMethod({ query, variables, operationName } = {}) {
    this.unblock && this.unblock();

    const { userId } = this;
    const opticsContext = hasOptics && optics.createContext(this.connection);

    const data = runQuery({
      schema,
      query,
      variables,
      operationName,
      context: {
        userId,
        opticsContext,
      },
    }).await();

    hasOptics && Meteor.defer(() => optics.reportContext(
      optics.finishContext(opticsContext),
    ));

    return data;
  };
}

export function setupSubscriptions(subscriptionManager, {
  publication = DEFAULT_PUBLICATION,
  collection = DEFAULT_COLLECTION,
} = {}) {
  Meteor.publish(publication, function publishGraphQL({ query, variables } = {}) {
    const {
      userId,
      _subscriptionId: id,
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
      callback: (err, data) => {
        this.changed(collection, id, (err || data));
      },
    });

    this.added(collection, id, {});
    this.ready();

    this.onStop(() => {
      subPromise
        .then(subId => subscriptionManager.unsubscribe(subId))
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
    throw new Error(DDP_APOLLO_SCHEMA_REQUIERD);
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
