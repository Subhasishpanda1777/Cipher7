const express = require('express');
const Joi = require('joi');
const therapyController = require('../controllers/therapy.controller');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const { GAME_TYPES } = require('../services/therapy.service');

const router = express.Router();

const createSessionSchema = Joi.object({
  body: Joi.object({
    childId: Joi.number().integer().required(),
    gameType: Joi.string()
      .valid(...GAME_TYPES)
      .required(),
    durationMinutes: Joi.number().integer().min(0).optional(),
    pointsEarned: Joi.number().integer().min(0).optional(),
    streak: Joi.number().integer().min(0).optional(),
    level: Joi.number().integer().min(1).optional(),
    notes: Joi.string().max(500).allow('', null),
  }).required(),
});

router.post(
  '/',
  requireAuth,
  validate(createSessionSchema),
  asyncHandler(therapyController.createSession)
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(therapyController.listMySessions)
);

router.get(
  '/child/:childId',
  requireAuth,
  asyncHandler(therapyController.listChildSessions)
);

router.get(
  '/',
  requireAuth,
  requireRole('doctor', 'admin'),
  asyncHandler(therapyController.listMySessions)
);

module.exports = router;
