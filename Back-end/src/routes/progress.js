const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getWeeklyProgress,
  getMonthlyProgress,
  getOverallProgress,
  getDashboardData,
  getCalendarData,
  getWeeklyComparison,
  getStatsSummary,
} = require('../controllers/progressController');

router.get('/weekly', authenticateToken, getWeeklyProgress);

router.get('/monthly', authenticateToken, getMonthlyProgress);

router.get('/overall', authenticateToken, getOverallProgress);

router.get('/dashboard', authenticateToken, getDashboardData);

router.get('/calendar', authenticateToken, getCalendarData);

// NEW ROUTES
router.get('/weekly-comparison', authenticateToken, getWeeklyComparison);

router.get('/stats-summary', authenticateToken, getStatsSummary);

module.exports = router;
