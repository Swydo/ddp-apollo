import { parse } from 'graphql';
import { createExecutor } from './createExecutor';
import { contextToFunction } from './contextToFunction';
import { invokeDDP } from './invokeDDP';

export function createGraphQLMiddleware({
  schema,
  context,
  execute = createExecutor(),
}) {
  const createContext = contextToFunction(context);

  return async function handleRequest(req, res) {
    const {
      query,
      variables,
      operationName,
    } = req.body;

    const data = await invokeDDP(async () => execute({
      schema,
      query: parse(query),
      context: await createContext({ userId: req.userId }),
      operationName,
      variables,
    }), { userId: req.userId });

    const json = JSON.stringify(data);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', Buffer.byteLength(json, 'utf8'));
    res.write(json);
    res.end();
  };
}
