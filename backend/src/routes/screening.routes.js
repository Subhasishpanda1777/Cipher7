const express = require('express');
const Joi = require('joi');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const screeningController = require('../controllers/screening.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const createScreeningSchema = Joi.object({
  body: Joi.object({
    userId: Joi.number().integer().required(),
    childId: Joi.number().integer().required(),
    alignmentScore: Joi.number().min(0).max(1).required(),
    alignmentDeviationScore: Joi.number().min(0).max(1),
    alignmentNormalized: Joi.number().min(0).max(1).required(),
    alignmentQualityScore: Joi.number().min(0).max(1),
    alignmentSymmetryRatio: Joi.number().min(0).max(1),
    alignmentVerticalStabilityScore: Joi.number().min(0).max(1),
    alignmentAngleScore: Joi.number().min(0).max(1),
    alignmentHorizontalDeviationRatio: Joi.number().min(0).max(1),
    alignmentVerticalDeviationRatio: Joi.number().min(0).max(1),
    alignmentAngleDeviationRatio: Joi.number().min(0).max(1),
    trackingScore: Joi.number().min(0).max(1).required(),
    trackingNormalized: Joi.number().min(0).max(1).required(),
    trackingLagScore: Joi.number().min(0).max(1),
    trackingDistanceScore: Joi.number().min(0).max(1),
    trackingSmoothnessScore: Joi.number().min(0).max(1),
    contrastScore: Joi.number().min(0).max(1).required(),
    contrastSensitivityScore: Joi.number().min(0).max(1),
    contrastNormalized: Joi.number().min(0).max(1).required(),
    contrastLeftEyeAccuracy: Joi.number().min(0).max(100),
    contrastRightEyeAccuracy: Joi.number().min(0).max(100),
    contrastAccuracyScore: Joi.number().min(0).max(1),
    contrastBalanceScore: Joi.number().min(0).max(1),
    contrastReactionBalanceScore: Joi.number().min(0).max(1),
    contrastReactionDeltaMs: Joi.number().integer().min(0),
    finalRiskScore: Joi.number().min(0).max(1).required(),
    finalRiskScoreNormalized: Joi.number().min(0).max(1),
    classification: Joi.string().valid('low', 'moderate', 'high').required(),
    riskClassification: Joi.string().valid('low', 'moderate', 'high'),
    notes: Joi.string().max(500).allow('', null),
    consentGiven: Joi.boolean().required(),
    screeningDurationSeconds: Joi.number().integer().min(0),
    cameraQualityScore: Joi.number().min(0).max(100),
    dataCompletenessPercentage: Joi.number().min(0).max(100),
  }).required(),
});

const getScreeningSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required(),
  }).required(),
});

const listScreeningsSchema = Joi.object({
  params: Joi.object({
    userId: Joi.number().integer().required(),
  }).required(),
});

router.post(
  '/',
  requireAuth,
  validate(createScreeningSchema),
  asyncHandler(screeningController.createScreening)
);

router.get(
  '/:id',
  requireAuth,
  validate(getScreeningSchema),
  asyncHandler(screeningController.getScreening)
);

router.get(
  '/user/:userId',
  requireAuth,
  validate(listScreeningsSchema),
  asyncHandler(screeningController.listScreenings)
);

module.exports = router;
