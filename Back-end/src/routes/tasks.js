const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const {
  getDailyTasks,
  completeTask,
  getUserCompletedTasks,
  getTodayProgress,
  getTaskStatistics,
  uncompleteTask,
  claimAchievement,
} = require('../controllers/tasksController');

router.get('/daily', getDailyTasks);

router.post(
  '/complete',
  authenticateToken,
  [
    body('taskId').isInt().withMessage('Valid task ID is required'),
    body('completionDate').optional().isISO8601().withMessage('Invalid date format'),
    validate,
  ],
  completeTask
);

router.get('/completed', authenticateToken, getUserCompletedTasks);

router.get('/today', authenticateToken, getTodayProgress);

router.get('/statistics', authenticateToken, getTaskStatistics);

router.delete('/:completionId', authenticateToken, uncompleteTask);

// NEW: Claim achievement endpoint
router.post(
  '/claim-achievement',
  authenticateToken,
  [
    body('achievementId').isInt().withMessage('Valid achievement ID is required'),
    validate,
  ],
  claimAchievement
);

module.exports = router;
