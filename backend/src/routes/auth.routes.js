const express = require('express');
const Joi = require('joi');
const authController = require('../controllers/auth.controller');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { USER_ROLES } = require('../services/auth.service');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const registerSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().max(120).required(),
    lastName: Joi.string().max(120).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string()
      .valid(...USER_ROLES)
      .required(),
  }).required(),
});

const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }).required(),
});

router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(authController.register)
);

router.post('/login', validate(loginSchema), asyncHandler(authController.login));

router.post('/logout', asyncHandler(authController.logout));

router.get('/me', requireAuth, asyncHandler(authController.me));

module.exports = router;
