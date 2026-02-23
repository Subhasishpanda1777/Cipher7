const { pool } = require('../config');

async function listChildrenByUser(userId) {
  const { rows } = await pool.query(
    `SELECT id,
        child_uid AS "childUid",
        first_name AS "firstName",
        last_name AS "lastName",
        date_of_birth AS "dateOfBirth",
        diagnosis_notes AS "diagnosisNotes",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
     FROM children
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

async function listAllChildren() {
  const { rows } = await pool.query(
    `SELECT c.id,
        c.child_uid AS "childUid",
        c.first_name AS "firstName",
        c.last_name AS "lastName",
        c.date_of_birth AS "dateOfBirth",
        c.diagnosis_notes AS "diagnosisNotes",
        c.created_at AS "createdAt",
        u.id AS "parentId",
        u.first_name AS "parentFirstName",
        u.last_name AS "parentLastName"
     FROM children c
     JOIN users u ON u.id = c.user_id
     ORDER BY c.created_at DESC
     LIMIT 200`
  );
  return rows;
}

module.exports = {
  listChildrenByUser,
  listAllChildren,
};
