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
  uncompleteTask
} = require('../controllers/tasksController');

router.get('/daily', getDailyTasks);

router.post(
  '/complete',
  authenticateToken,
  [
    body('taskId').isInt().withMessage('Valid task ID is required'),
    body('completionDate').optional().isISO8601().withMessage('Invalid date format'),
    validate
  ],
  completeTask
);

router.get('/completed', authenticateToken, getUserCompletedTasks);

router.get('/today', authenticateToken, getTodayProgress);

router.get('/statistics', authenticateToken, getTaskStatistics);

router.delete('/:completionId', authenticateToken, uncompleteTask);

module.exports = router;
