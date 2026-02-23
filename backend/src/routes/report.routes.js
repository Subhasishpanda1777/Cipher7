const express = require('express');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const reportController = require('../controllers/report.controller');

const router = express.Router();

router.get(
  '/parent-summary',
  requireAuth,
  asyncHandler(reportController.generateParentSummary)
);

module.exports = router;
