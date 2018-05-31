import { execute, parse } from 'graphql';
import { contextToFunction } from './contextToFunction';

export function createGraphQLRequestHandler({
  schema,
  context,
}) {
  const createContext = contextToFunction(context);

  return async function handleRequest(req, res) {
    const {
      query,
      variables,
      operationName,
    } = req.body;

    const data = await execute(
      schema,
      parse(query),
      {},
      await createContext({ userId: req.userId }),
      variables,
      operationName,
    );

    const json = JSON.stringify(data);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', Buffer.byteLength(json, 'utf8'));
    res.write(json);
    res.end();
  };
}
