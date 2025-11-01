const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getWeeklyProgress,
  getMonthlyProgress,
  getOverallProgress,
  getDashboardData
} = require('../controllers/progressController');

router.get('/weekly', authenticateToken, getWeeklyProgress);

router.get('/monthly', authenticateToken, getMonthlyProgress);

router.get('/overall', authenticateToken, getOverallProgress);

router.get('/dashboard', authenticateToken, getDashboardData);

module.exports = router;
