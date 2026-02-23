const { pool } = require('../config');

async function createScreening(screening) {
  const {
    userId,
    childId,
    alignmentScore,
    alignmentNormalized,
    alignmentSymmetryRatio,
    trackingScore,
    trackingNormalized,
    contrastScore,
    contrastNormalized,
    contrastLeftEyeAccuracy,
    contrastRightEyeAccuracy,
    finalRiskScore,
    classification,
    notes,
    consentGiven,
    screeningDurationSeconds,
    cameraQualityScore,
    dataCompletenessPercentage,
  } = screening;

  const query = `
    INSERT INTO screenings
      (user_id, child_id, alignment_score, alignment_normalized, alignment_symmetry_ratio,
       tracking_score, tracking_normalized, contrast_score, contrast_normalized,
       contrast_left_eye_accuracy, contrast_right_eye_accuracy,
       final_risk_score, classification, notes, consent_given,
       screening_duration_seconds, camera_quality_score, data_completeness_percentage)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING id, user_id AS "userId", child_id AS "childId",
      alignment_score AS "alignmentScore", alignment_normalized AS "alignmentNormalized",
      alignment_symmetry_ratio AS "alignmentSymmetryRatio",
      tracking_score AS "trackingScore", tracking_normalized AS "trackingNormalized",
      contrast_score AS "contrastScore", contrast_normalized AS "contrastNormalized",
      contrast_left_eye_accuracy AS "contrastLeftEyeAccuracy",
      contrast_right_eye_accuracy AS "contrastRightEyeAccuracy",
      final_risk_score AS "finalRiskScore", classification, notes, 
      consent_given AS "consentGiven",
      screening_duration_seconds AS "screeningDurationSeconds",
      camera_quality_score AS "cameraQualityScore",
      data_completeness_percentage AS "dataCompletenessPercentage",
      created_at AS "createdAt";
  `;

  const values = [
    userId,
    childId,
    alignmentScore || null,
    alignmentNormalized || null,
    alignmentSymmetryRatio || null,
    trackingScore || null,
    trackingNormalized || null,
    contrastScore || null,
    contrastNormalized || null,
    contrastLeftEyeAccuracy || null,
    contrastRightEyeAccuracy || null,
    finalRiskScore,
    classification,
    notes || null,
    consentGiven,
    screeningDurationSeconds || null,
    cameraQualityScore || null,
    dataCompletenessPercentage || null,
  ];

  const { rows } = await pool.query(query, values);

  return rows[0];
}

async function getScreeningById(id) {
  const query = `
    SELECT id,
      user_id AS "userId",
      child_id AS "childId",
      alignment_score AS "alignmentScore",
      tracking_score AS "trackingScore",
      contrast_score AS "contrastScore",
      final_risk_score AS "finalRiskScore",
      classification,
      notes,
      consent_given AS "consentGiven",
      created_at AS "createdAt"
    FROM screenings
    WHERE id = $1;
  `;

  const { rows } = await pool.query(query, [id]);

  return rows[0] || null;
}

async function listScreeningsByUser(userId) {
  const query = `
    SELECT id,
      user_id AS "userId",
      child_id AS "childId",
      alignment_score AS "alignmentScore",
      tracking_score AS "trackingScore",
      contrast_score AS "contrastScore",
      final_risk_score AS "finalRiskScore",
      classification,
      notes,
      consent_given AS "consentGiven",
      created_at AS "createdAt"
    FROM screenings
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;

  const { rows } = await pool.query(query, [userId]);

  return rows;
}

async function listAllScreenings() {
  const query = `
    SELECT id,
      user_id AS "userId",
      child_id AS "childId",
      alignment_score AS "alignmentScore",
      tracking_score AS "trackingScore",
      contrast_score AS "contrastScore",
      final_risk_score AS "finalRiskScore",
      classification,
      notes,
      consent_given AS "consentGiven",
      created_at AS "createdAt"
    FROM screenings
    ORDER BY created_at DESC
    LIMIT 200;
  `;

  const { rows } = await pool.query(query);

  return rows;
}

module.exports = {
  createScreening,
  getScreeningById,
  listScreeningsByUser,
  listAllScreenings,
};
