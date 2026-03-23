const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

router.post('/admin/login', authController.adminLogin);
router.post('/admin/change-password', authenticateToken, authController.changePassword);
router.get('/setup-admin', authController.setupAdmin);

module.exports = router;
