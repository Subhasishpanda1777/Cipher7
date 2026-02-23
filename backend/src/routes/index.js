const express = require('express');
const screeningRoutes = require('./screening.routes');
const authRoutes = require('./auth.routes');
const childRoutes = require('./child.routes');
const therapyRoutes = require('./therapy.routes');
const reportRoutes = require('./report.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/screenings', screeningRoutes);
router.use('/child', childRoutes);
router.use('/therapy', therapyRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
