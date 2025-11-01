const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const {
  getUserProfile,
  updateUserPoints,
  getLevels,
  getAchievements,
  checkAndAwardAchievements,
  updateAvatar
} = require('../controllers/gamificationController');

router.get('/profile', authenticateToken, getUserProfile);

router.post(
  '/points',
  authenticateToken,
  [
    body('points').isInt({ min: 1 }).withMessage('Points must be a positive integer'),
    validate
  ],
  updateUserPoints
);

router.get('/levels', getLevels);

router.get('/achievements', authenticateToken, getAchievements);

router.post('/check-achievements', authenticateToken, checkAndAwardAchievements);

router.put(
  '/avatar',
  authenticateToken,
  [
    body('avatarType').trim().notEmpty().withMessage('Avatar type is required'),
    validate
  ],
  updateAvatar
);

module.exports = router;
