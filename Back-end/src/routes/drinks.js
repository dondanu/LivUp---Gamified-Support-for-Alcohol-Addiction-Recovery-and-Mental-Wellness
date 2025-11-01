const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const {
  logDrink,
  getDrinkLogs,
  deleteDrinkLog,
  getDrinkStatistics
} = require('../controllers/drinkController');

router.post(
  '/log',
  authenticateToken,
  [
    body('drinkCount').isInt({ min: 0 }).withMessage('Drink count must be a non-negative integer'),
    body('logDate').optional().isISO8601().withMessage('Invalid date format'),
    validate
  ],
  logDrink
);

router.get('/logs', authenticateToken, getDrinkLogs);

router.get('/statistics', authenticateToken, getDrinkStatistics);

router.delete('/:logId', authenticateToken, deleteDrinkLog);

module.exports = router;
