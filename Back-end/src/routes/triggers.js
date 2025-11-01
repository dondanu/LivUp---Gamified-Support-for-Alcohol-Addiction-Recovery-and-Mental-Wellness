const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const {
  logTrigger,
  getTriggerLogs,
  getTriggerAnalysis,
  deleteTriggerLog
} = require('../controllers/triggerController');

router.post(
  '/log',
  authenticateToken,
  [
    body('triggerType').isIn(['stress', 'party', 'social', 'boredom', 'anxiety', 'other']).withMessage('Invalid trigger type'),
    body('intensity').isInt({ min: 1, max: 10 }).withMessage('Intensity must be between 1 and 10'),
    body('logDate').optional().isISO8601().withMessage('Invalid date format'),
    validate
  ],
  logTrigger
);

router.get('/logs', authenticateToken, getTriggerLogs);

router.get('/analysis', authenticateToken, getTriggerAnalysis);

router.delete('/:logId', authenticateToken, deleteTriggerLog);

module.exports = router;
