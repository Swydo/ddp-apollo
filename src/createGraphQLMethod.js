import { createExecutor } from './createExecutor';
import { contextToFunction } from './contextToFunction';

export const DDP_APOLLO_SCHEMA_REQUIRED = 'DDP_APOLLO_SCHEMA_REQUIRED';

export function createGraphQLMethod({
  schema,
  context,
  execute = createExecutor(),
}) {
  if (!schema) {
    throw new Error(DDP_APOLLO_SCHEMA_REQUIRED);
  }

  const createContext = contextToFunction(context);

  return async function graphQlMethod({ query, variables, operationName } = {}, clientContext) {
    if (!query) {
      return {};
    }

    if (this.unblock) {
      this.unblock();
    }

    const { userId, connection: ddpConnection } = this;
    const completeContext = await createContext({ userId, ddpConnection }, clientContext);

    return execute({
      schema,
      query,
      context: completeContext,
      variables,
      operationName,
    });
  };
}
