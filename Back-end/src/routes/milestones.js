const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const {
  getMilestones,
  addMilestone,
  updateMilestone,
  deleteMilestone,
} = require('../controllers/milestonesController');

// Get all milestones for the authenticated user
router.get('/', authenticateToken, getMilestones);

// Add a new milestone
router.post(
  '/',
  authenticateToken,
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }).withMessage('Title must be 200 characters or less'),
    body('date').notEmpty().withMessage('Date is required').isISO8601().withMessage('Date must be in valid format (YYYY-MM-DD)'),
    body('type').optional().isIn(['sobriety', 'custom']).withMessage('Type must be either sobriety or custom'),
    validate,
  ],
  addMilestone
);

// Update a milestone
router.put(
  '/:id',
  authenticateToken,
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid milestone ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 200 }).withMessage('Title must be 200 characters or less'),
    body('date').optional().isISO8601().withMessage('Date must be in valid format (YYYY-MM-DD)'),
    validate,
  ],
  updateMilestone
);

// Delete a milestone
router.delete(
  '/:id',
  authenticateToken,
  [param('id').isInt({ min: 1 }).withMessage('Invalid milestone ID'), validate],
  deleteMilestone
);

module.exports = router;
