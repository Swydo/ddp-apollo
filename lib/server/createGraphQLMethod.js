import { Meteor } from 'meteor/meteor';
import { execute } from 'graphql';
import * as DEFAULT_OPTICS from './optics';
import {
  DEFAULT_CREATE_CONTEXT,
} from '../common/defaults';

export const DDP_APOLLO_SCHEMA_REQUIRED = 'DDP_APOLLO_SCHEMA_REQUIRED';

export function createGraphQLMethod(schema, {
  disableOptics,
  optics = DEFAULT_OPTICS,
  createContext = DEFAULT_CREATE_CONTEXT,
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

  return async function graphQlMethod({ query, variables, operationName } = {}) {
    this.unblock && this.unblock();

    const { userId } = this;
    const opticsContext = hasOptics && optics.createContext(this.connection);

    let data = {};

    if (query) {
      const context = createContext({
        userId,
        opticsContext,
      });

      data = execute(
        schema,
        query,
        {},
        context,
        variables,
        operationName,
      );
    }

    if (hasOptics) {
      Meteor.defer(() => optics.reportContext(optics.finishContext(opticsContext)));
    }

    return data;
  };
}
