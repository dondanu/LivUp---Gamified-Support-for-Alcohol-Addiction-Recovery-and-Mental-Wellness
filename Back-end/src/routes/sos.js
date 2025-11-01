const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const {
  addSOSContact,
  getSOSContacts,
  updateSOSContact,
  deleteSOSContact
} = require('../controllers/sosController');

router.post(
  '/contact',
  authenticateToken,
  [
    body('contactName').trim().notEmpty().withMessage('Contact name is required'),
    body('contactPhone').trim().notEmpty().withMessage('Contact phone is required'),
    validate
  ],
  addSOSContact
);

router.get('/contacts', authenticateToken, getSOSContacts);

router.put(
  '/contact/:contactId',
  authenticateToken,
  [
    body('contactName').optional().trim().notEmpty(),
    body('contactPhone').optional().trim().notEmpty(),
    validate
  ],
  updateSOSContact
);

router.delete('/contact/:contactId', authenticateToken, deleteSOSContact);

module.exports = router;
