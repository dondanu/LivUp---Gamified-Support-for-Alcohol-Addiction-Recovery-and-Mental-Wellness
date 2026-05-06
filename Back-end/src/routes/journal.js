const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const {
  getJournalEntries,
  getEntriesByType,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalStats,
} = require('../controllers/journalController');

// Get all journal entries (with optional filters)
router.get(
  '/',
  authenticateToken,
  [
    query('type').optional().isIn(['note', 'gratitude', 'reason', 'mantra']).withMessage('Invalid entry type'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
    query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be between 1 and 500'),
    validate,
  ],
  getJournalEntries
);

// Get entries grouped by type
router.get('/grouped', authenticateToken, getEntriesByType);

// Get journal statistics
router.get('/stats', authenticateToken, getJournalStats);

// Add a new journal entry
router.post(
  '/',
  authenticateToken,
  [
    body('type')
      .notEmpty()
      .withMessage('Type is required')
      .isIn(['note', 'gratitude', 'reason', 'mantra'])
      .withMessage('Invalid entry type'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ max: 5000 })
      .withMessage('Content must be 5000 characters or less'),
    body('entryDate')
      .optional()
      .isISO8601()
      .withMessage('Entry date must be in valid format (YYYY-MM-DD)'),
    validate,
  ],
  addJournalEntry
);

// Update a journal entry
router.put(
  '/:id',
  authenticateToken,
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid entry ID'),
    body('content')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Content cannot be empty')
      .isLength({ max: 5000 })
      .withMessage('Content must be 5000 characters or less'),
    body('entryDate')
      .optional()
      .isISO8601()
      .withMessage('Entry date must be in valid format (YYYY-MM-DD)'),
    validate,
  ],
  updateJournalEntry
);

// Delete a journal entry
router.delete(
  '/:id',
  authenticateToken,
  [param('id').isInt({ min: 1 }).withMessage('Invalid entry ID'), validate],
  deleteJournalEntry
);

module.exports = router;
