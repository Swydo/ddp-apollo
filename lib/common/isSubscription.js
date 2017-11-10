import { getOperationAST } from 'graphql';

export const isSubscription = (operation) => {
  const { query, operationName } = operation;
  const operationAST = getOperationAST(query, operationName);

  return !!operationAST && operationAST.operation === 'subscription';
};
