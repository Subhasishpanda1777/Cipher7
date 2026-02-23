const HttpError = require('../utils/httpError');
const authService = require('../services/auth.service');
const { signToken } = require('../utils/jwt');

function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });
}

async function register(req, res) {
  const { firstName, lastName, email, password, role } = req.body;
  const user = await authService.createUser({ firstName, lastName, email, password, role });
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  setAuthCookie(res, token);
  res.status(201).json({ message: 'Account created', data: { ...user, token } });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await authService.verifyCredentials(email, password);
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  setAuthCookie(res, token);
  res.json({ message: 'Logged in', data: { ...user, token } });
}

async function logout(req, res) {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
}

async function me(req, res) {
  if (!req.user) {
    throw new HttpError(401, 'Unauthenticated');
  }

  const fullUser = await authService.findUserById(req.user.id);
  if (!fullUser) {
    throw new HttpError(404, 'User not found');
  }

  res.json({ data: fullUser });
}

module.exports = {
  register,
  login,
  logout,
  me,
};
