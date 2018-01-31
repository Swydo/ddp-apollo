import { execute } from 'graphql';
import {
  DEFAULT_CREATE_CONTEXT,
} from '../common/defaults';

export const DDP_APOLLO_SCHEMA_REQUIRED = 'DDP_APOLLO_SCHEMA_REQUIRED';

export function createGraphQLMethod(schema, {
  createContext = DEFAULT_CREATE_CONTEXT,
}) {
  if (!schema) {
    throw new Error(DDP_APOLLO_SCHEMA_REQUIRED);
  }

  return async function graphQlMethod({ query, variables, operationName } = {}) {
    this.unblock && this.unblock();

    const { userId } = this;

    let data = {};

    if (query) {
      const context = createContext({
        userId,
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

    return data;
  };
}
