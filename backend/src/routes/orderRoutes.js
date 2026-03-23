const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticateToken = require('../middleware/auth');

router.post('/orders', orderController.placeOrder);

// Admin route for orders
router.get('/admin/orders', authenticateToken, orderController.getOrders);
router.get('/admin/orders/:id/items', authenticateToken, orderController.getOrderDetails);
router.put('/admin/orders/:id/status', authenticateToken, orderController.updateOrderStatus);

module.exports = router;
