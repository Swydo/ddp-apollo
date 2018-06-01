import { getUserByLoginToken, NO_VALID_USER_ERROR } from './getUserByLoginToken';

export function meteorAuthMiddleware(req, res, next) {
  let bearer;
  let loginToken;

  // get the login token from the request headers, given by meteorAuthLink
  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    [bearer, loginToken] = parts;

    if (parts.length !== 2 || bearer !== 'Bearer') {
      // Not a valid login token, so unset
      loginToken = undefined;
    }
  }

  // get the user for the context
  getUserByLoginToken(loginToken)
    .then((user) => {
      req.userId = user && user._id;
      next();
    })
    .catch((err) => {
      err === NO_VALID_USER_ERROR ? next() : next(err);
    });
}
