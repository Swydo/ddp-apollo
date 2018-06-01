import { getUserIdByLoginToken, NO_VALID_USER_ERROR } from './getUserIdByLoginToken';

export function meteorAuthMiddleware(req, res, next) {
  let tokenType;
  let loginToken;

  // get the login token from the request headers, given by meteorAuthLink
  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    [tokenType, loginToken] = parts;

    if (parts.length !== 2 || tokenType !== 'Bearer') {
      // Not a valid login token, so unset
      loginToken = undefined;
    }
  }

  // get the user for the context
  getUserIdByLoginToken(loginToken)
    .then((userId) => {
      req.userId = userId;
      next();
    })
    .catch((err) => {
      err === NO_VALID_USER_ERROR ? next() : next(err);
    });
}
