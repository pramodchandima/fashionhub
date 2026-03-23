const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public Routes
router.get('/categories', categoryController.getAllCategories);

// Admin Routes
router.get('/admin/categories', authenticateToken, categoryController.getAdminCategories);

router.post('/admin/categories',
    authenticateToken,
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'hoverImage', maxCount: 1 }
    ]),
    categoryController.createCategory
);

router.put('/admin/categories/:id',
    authenticateToken,
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'hoverImage', maxCount: 1 }
    ]),
    categoryController.updateCategory
);

router.delete('/admin/categories/:id', authenticateToken, categoryController.deleteCategory);

module.exports = router;
