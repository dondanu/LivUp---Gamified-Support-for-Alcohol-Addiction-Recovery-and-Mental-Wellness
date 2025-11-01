const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { getUserSettings, updateUserSettings } = require('../controllers/settingsController');

router.get('/', authenticateToken, getUserSettings);

router.put(
  '/',
  authenticateToken,
  [
    body('notificationsEnabled').optional().isBoolean().withMessage('Invalid notifications setting'),
    body('reminderFrequency').optional().isIn(['daily', 'weekly', 'none']).withMessage('Invalid reminder frequency'),
    body('theme').optional().isIn(['light', 'dark']).withMessage('Invalid theme'),
    validate
  ],
  updateUserSettings
);

module.exports = router;
