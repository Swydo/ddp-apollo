const { getOperationAST } = require('graphql');

const isSubscription = (operation) => {
  const { query, operationName } = operation;
  const operationAST = getOperationAST(query, operationName);

  return !!operationAST && operationAST.operation === 'subscription';
};

module.exports = isSubscription;
