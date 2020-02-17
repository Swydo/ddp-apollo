import { execute } from 'graphql';

export function createExecutor(gatewayExecutor) {
  return function executor({
    schema,
    query,
    context,
    operationName,
    variables,
  }) {
    if (gatewayExecutor) {
      return gatewayExecutor({
        document: query,
        operationName,
        context,
        request: {
          query,
          operationName,
          variables,
        },
      });
    }

    return execute(
      schema,
      query,
      {},
      context,
      variables,
      operationName,
    );
  };
}
