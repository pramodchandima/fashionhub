const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authenticateToken = require('../middleware/auth');

// Public
router.post('/contact', contactController.submitContactForm);

// Admin
router.get('/admin/contact-messages', authenticateToken, contactController.getContactMessages);
router.put('/admin/contact-messages/:id/status', authenticateToken, contactController.updateMessageStatus);

module.exports = router;
