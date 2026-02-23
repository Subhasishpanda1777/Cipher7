const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const childController = require('../controllers/child.controller');

const router = express.Router();

router.get('/me', requireAuth, asyncHandler(childController.listMyChildren));
router.get('/', requireAuth, requireRole('doctor', 'admin'), asyncHandler(childController.listAllChildren));

module.exports = router;
