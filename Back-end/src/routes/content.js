const express = require('express');
const router = express.Router();
const {
  getMotivationalQuote,
  getHealthyAlternatives,
  getRandomAlternative
} = require('../controllers/contentController');

router.get('/quote', getMotivationalQuote);

router.get('/alternatives', getHealthyAlternatives);

router.get('/alternative/random', getRandomAlternative);

module.exports = router;
