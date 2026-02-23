const bcrypt = require('bcryptjs');
const { pool } = require('../config');
const HttpError = require('../utils/httpError');

const USER_ROLES = ['parent', 'doctor', 'admin'];

async function findUserByEmail(email) {
  const query = `
    SELECT id,
      first_name AS "firstName",
      last_name AS "lastName",
      email,
      password_hash AS "passwordHash",
      role,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM users
    WHERE email = $1
    LIMIT 1;
  `;
  const { rows } = await pool.query(query, [email.toLowerCase()]);
  return rows[0] || null;
}

async function findUserById(id) {
  const query = `
    SELECT id,
      first_name AS "firstName",
      last_name AS "lastName",
      email,
      role,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM users
    WHERE id = $1
    LIMIT 1;
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
}

async function createUser({ firstName, lastName, email, password, role }) {
  if (!USER_ROLES.includes(role)) {
    throw new HttpError(400, 'Invalid user role');
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new HttpError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const query = `
    INSERT INTO users (first_name, last_name, email, password_hash, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id,
      first_name AS "firstName",
      last_name AS "lastName",
      email,
      role,
      created_at AS "createdAt",
      updated_at AS "updatedAt";
  `;

  const { rows } = await pool.query(query, [
    firstName.trim(),
    lastName.trim(),
    email.toLowerCase().trim(),
    passwordHash,
    role,
  ]);

  return rows[0];
}

async function verifyCredentials(email, password) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

module.exports = {
  USER_ROLES,
  createUser,
  findUserByEmail,
  findUserById,
  verifyCredentials,
};
