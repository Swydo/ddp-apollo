import { getOperationAST } from 'graphql';

export const isASubscriptionOperation = (document, operationName) => {
  const operationAST = getOperationAST(document, operationName);

  return !!operationAST && operationAST.operation === 'subscription';
};
