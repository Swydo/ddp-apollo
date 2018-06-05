import { execute, parse } from 'graphql';
import { contextToFunction } from './contextToFunction';
import { invokeDDP } from './invokeDDP';

export function createGraphQLMiddleware({
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

    const data = await invokeDDP(async () => execute(
      schema,
      parse(query),
      {},
      await createContext({ userId: req.userId }),
      variables,
      operationName,
    ), { userId: req.userId });

    const json = JSON.stringify(data);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', Buffer.byteLength(json, 'utf8'));
    res.write(json);
    res.end();
  };
}
