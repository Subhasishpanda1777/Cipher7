const { verifyToken } = require('../utils/jwt');
const HttpError = require('../utils/httpError');

function extractTokenFromHeader(headerValue) {
  if (!headerValue) return null;
  const parts = headerValue.split(' ');
  if (parts.length !== 2) return null;
  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) return null;
  return token;
}

function requireAuth(req, res, next) {
  try {
    const token =
      req.cookies?.token || extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw new HttpError(401, 'Authentication required');
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(new HttpError(401, 'Invalid or expired token'));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new HttpError(403, 'Not authorised'));
      return;
    }
    next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
};
