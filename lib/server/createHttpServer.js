import { WebApp } from 'meteor/webapp';
import { execute, parse } from 'graphql';
import { getUserByLoginToken } from './getUserByLoginToken';
import { contextToFunction } from './contextToFunction';
import {
  DEFAULT_PATH,
  DEFAULT_AUTH_HEADER,
} from '../common/defaults';

export function getGraphQLRequestHandler({
  schema,
  context,
  authHeader = DEFAULT_AUTH_HEADER,
}) {
  const createContext = contextToFunction(context);

  return async function handleRequest(req, res) {
    const {
      query,
      variables,
      operationName,
    } = req.body;

    // get the login token from the request headers, given by meteorAuthLink
    const loginToken = req.headers[authHeader];

    // get the user for the context
    const user = await getUserByLoginToken(loginToken);

    const data = await execute(
      schema,
      parse(query),
      {},
      await createContext({ userId: user && user._id }),
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

export function createHttpServer({
  schema,
  path = DEFAULT_PATH,
  context,
  engine,
} = {}) {
  // Only require the body-parser for users who actually setup an http server
  // eslint-disable-next-line global-require
  const bodyParser = require('body-parser');
  const requestHandler = getGraphQLRequestHandler({ schema, context });

  if (engine && engine.expressMiddleware) {
    WebApp.connectHandlers.use(engine.expressMiddleware());
  }

  WebApp.connectHandlers.use(path, bodyParser.json());
  WebApp.connectHandlers.use(path, requestHandler);
}
