const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getSmartInsights } = require('../controllers/insightsController');

// Get smart insights for the user
router.get('/', authenticateToken, getSmartInsights);

module.exports = router;
