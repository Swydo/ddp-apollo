import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { runQuery } from 'graphql-server-core';
import { print } from 'graphql/language/printer';
import * as DEFAULT_OPTICS from './optics';
import {
  DEFAULT_METHOD,
  DEFAULT_COLLECTION,
  DEFAULT_PUBLICATION,
} from '../common/defaults';

export const DDP_APOLLO_SCHEMA_REQUIRED = 'DDP_APOLLO_SCHEMA_REQUIRED';

export function createGraphQlMethod(schema, {
  disableOptics,
  optics = DEFAULT_OPTICS,
}) {
  if (!schema) {
    throw new Error(DDP_APOLLO_SCHEMA_REQUIRED);
  }

  const {
    _opticsInstrumented: instrumented,
  } = schema;

  // By setting disableOptics to true it can be disabled
  // Else, just check if the schema was instrumented
  const hasOptics = Boolean(!disableOptics && instrumented);

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
