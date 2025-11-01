const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const {
  logMood,
  getMoodLogs,
  getMoodStatistics,
  deleteMoodLog
} = require('../controllers/moodController');

router.post(
  '/log',
  authenticateToken,
  [
    body('moodType').isIn(['happy', 'sad', 'stressed', 'anxious', 'calm', 'angry']).withMessage('Invalid mood type'),
    body('moodScore').isInt({ min: 1, max: 10 }).withMessage('Mood score must be between 1 and 10'),
    body('logDate').optional().isISO8601().withMessage('Invalid date format'),
    validate
  ],
  logMood
);

router.get('/logs', authenticateToken, getMoodLogs);

router.get('/statistics', authenticateToken, getMoodStatistics);

router.delete('/:logId', authenticateToken, deleteMoodLog);

module.exports = router;
