const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const {
  getSettings,
  updateNotifications,
  updateTheme,
  changeEmail,
  changePassword,
  exportData,
  deleteAccount,
} = require('../controllers/settingsController');

// Get user settings
router.get('/', authenticateToken, getSettings);

// Update notifications
router.put(
  '/notifications',
  authenticateToken,
  [
    body('notificationsEnabled').isBoolean().withMessage('notificationsEnabled must be a boolean'),
    validate,
  ],
  updateNotifications
);

// Update theme
router.put(
  '/theme',
  authenticateToken,
  [
    body('theme').isIn(['light', 'dark']).withMessage('theme must be light or dark'),
    validate,
  ],
  updateTheme
);

// Change email
router.put(
  '/email',
  authenticateToken,
  [
    body('newEmail').trim().notEmpty().withMessage('New email is required').isEmail().withMessage('Invalid email format'),
    validate,
  ],
  changeEmail
);

// Change password
router.put(
  '/password',
  authenticateToken,
  [
    body('currentPassword').trim().notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .trim()
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
    validate,
  ],
  changePassword
);

// Export user data
router.get('/export', authenticateToken, exportData);

// Delete account
router.delete(
  '/account',
  authenticateToken,
  [body('password').trim().notEmpty().withMessage('Password is required'), validate],
  deleteAccount
);

module.exports = router;
