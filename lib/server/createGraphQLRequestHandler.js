import { execute, parse } from 'graphql';
import { getUserByLoginToken, NO_VALID_USER_ERROR } from './getUserByLoginToken';
import { contextToFunction } from './contextToFunction';
import { DEFAULT_AUTH_HEADER } from '../common/defaults';

async function defaultAuthorizer(req, {
  authHeader = DEFAULT_AUTH_HEADER,
}) {
  // get the login token from the request headers, given by meteorAuthLink
  const loginToken = req.headers[authHeader];

  let user;

  // get the user for the context
  try {
    user = await getUserByLoginToken(loginToken);
  } catch (err) {
    if (err !== NO_VALID_USER_ERROR) {
      throw err;
    }
  }

  return user && user._id;
}

export function createGraphQLRequestHandler({
  schema,
  context,
  authHeader,
  authorizer = defaultAuthorizer,
}) {
  const createContext = contextToFunction(context);

  return async function handleRequest(req, res) {
    const {
      query,
      variables,
      operationName,
    } = req.body;

    const userId = await authorizer(req, { authHeader });

    const data = await execute(
      schema,
      parse(query),
      {},
      await createContext({ userId }),
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
