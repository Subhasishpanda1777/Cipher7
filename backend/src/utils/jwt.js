const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '1d';

if (!JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('JWT_SECRET is not defined. Tokens cannot be issued or verified.');
}

function signToken(payload, options = {}) {
  if (!JWT_SECRET) {
    throw new Error('JWT secret is not configured');
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
    ...options,
  });
}

function verifyToken(token) {
  if (!JWT_SECRET) {
    throw new Error('JWT secret is not configured');
  }

  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  signToken,
  verifyToken,
};
