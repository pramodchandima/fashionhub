const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');
const multer = require('multer');

// Public
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);

// Admin
router.get('/admin/products', authenticateToken, productController.getAdminProducts);

// Complex upload middleware configuration for product creation duplicated from original to maintain behavior
// Note: In a cleaner refactor, we might simplify this, but sticking to working logic first.
const cpUpload = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'name', maxCount: 1 },
    { name: 'description', maxCount: 1 },
    { name: 'price', maxCount: 1 },
    { name: 'categoryId', maxCount: 1 },
    { name: 'stock', maxCount: 1 },
    { name: 'colors', maxCount: 1 }
]);

router.post('/admin/products', authenticateToken, cpUpload, productController.createProduct);

router.put('/admin/products/:id', authenticateToken, upload.single('image'), productController.updateProduct);

router.delete('/admin/products/:id', authenticateToken, productController.deleteProduct);

module.exports = router;
