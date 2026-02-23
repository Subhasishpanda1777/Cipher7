const { pool } = require('../config');
const HttpError = require('../utils/httpError');

const GAME_TYPES = ['movingDot', 'contrastChallenge', 'objectMatch'];

async function ensureChildAccess(childId, user) {
  const { rows } = await pool.query(
    'SELECT id, user_id AS "userId" FROM children WHERE id = $1 LIMIT 1',
    [childId]
  );
  const child = rows[0];
  if (!child) {
    throw new HttpError(404, 'Child not found');
  }

  if (
    user.role === 'parent' &&
    Number(child.userId) !== Number(user.id)
  ) {
    throw new HttpError(403, 'Not authorised for this child');
  }

  return child;
}

async function createTherapySession({ user, payload }) {
  const {
    childId,
    gameType,
    durationMinutes,
    pointsEarned,
    accuracyPercent,
    streak,
    level,
    notes,
  } = payload;

  if (!GAME_TYPES.includes(gameType)) {
    throw new HttpError(400, 'Invalid therapy game type');
  }

  await ensureChildAccess(childId, user);

  const { rows } = await pool.query(
    `INSERT INTO therapy_sessions (child_id, game_type, duration_minutes, points_earned, accuracy_percent, streak, level, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, child_id AS "childId", game_type AS "gameType", session_date AS "sessionDate",
       duration_minutes AS "durationMinutes", points_earned AS "pointsEarned", accuracy_percent AS "accuracyPercent",
       streak, level, notes;`,
    [
      childId,
      gameType,
      durationMinutes || 0,
      pointsEarned || 0,
      accuracyPercent || 0,
      streak || 0,
      level || 1,
      notes || null,
    ]
  );

  return rows[0];
}

async function listSessionsByUser(userId) {
  const { rows } = await pool.query(
    `SELECT ts.id, ts.child_id AS "childId", ts.game_type AS "gameType", ts.session_date AS "sessionDate",
        ts.duration_minutes AS "durationMinutes", ts.points_earned AS "pointsEarned", ts.accuracy_percent AS "accuracyPercent", ts.streak, ts.level, ts.notes,
        c.first_name AS "childFirstName", c.last_name AS "childLastName"
     FROM therapy_sessions ts
     JOIN children c ON c.id = ts.child_id
     WHERE c.user_id = $1
     ORDER BY ts.session_date DESC
     LIMIT 200`,
    [userId]
  );
  return rows;
}

async function listSessionsByChild(childId, user) {
  await ensureChildAccess(childId, user);
  const { rows } = await pool.query(
    `SELECT id, child_id AS "childId", game_type AS "gameType", session_date AS "sessionDate",
        duration_minutes AS "durationMinutes", points_earned AS "pointsEarned", accuracy_percent AS "accuracyPercent", streak, level, notes
     FROM therapy_sessions
     WHERE child_id = $1
     ORDER BY session_date DESC
     LIMIT 100`,
    [childId]
  );
  return rows;
}

async function listAllSessions() {
  const { rows } = await pool.query(
    `SELECT ts.id, ts.child_id AS "childId", ts.game_type AS "gameType", ts.session_date AS "sessionDate",
        ts.duration_minutes AS "durationMinutes", ts.points_earned AS "pointsEarned", ts.accuracy_percent AS "accuracyPercent", ts.streak, ts.level, ts.notes,
        c.first_name AS "childFirstName", c.last_name AS "childLastName",
        u.first_name AS "parentFirstName", u.last_name AS "parentLastName"
     FROM therapy_sessions ts
     JOIN children c ON c.id = ts.child_id
     JOIN users u ON u.id = c.user_id
     ORDER BY ts.session_date DESC
     LIMIT 200`
  );
  return rows;
}

module.exports = {
  GAME_TYPES,
  createTherapySession,
  listSessionsByUser,
  listSessionsByChild,
  listAllSessions,
};
