const { getPool } = require('../config/db');
const { getFullUrl } = require('../utils/helpers');

// Get all public categories
exports.getAllCategories = async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM categories WHERE is_active = 1 ORDER BY category_name'
        );

        const categoriesWithFullUrls = rows.map(category => ({
            ...category,
            image_path: getFullUrl(req, category.image_path),
            hover_image_path: getFullUrl(req, category.hover_image_path)
        }));

        res.json(categoriesWithFullUrls);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin: Get all categories (including inactive if needed, though originally filtered)
exports.getAdminCategories = async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM categories WHERE is_active = 1');

        const categoriesWithFullUrls = rows.map(category => ({
            ...category,
            image_path: getFullUrl(req, category.image_path),
            hover_image_path: getFullUrl(req, category.hover_image_path)
        }));

        res.json(categoriesWithFullUrls);
    } catch (error) {
        console.error('Admin get categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin: Create category
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const files = req.files || {};
        const imagePath = files['image'] ? `/uploads/products/${files['image'][0].filename}` : null;
        const hoverImagePath = files['hoverImage'] ? `/uploads/products/${files['hoverImage'][0].filename}` : null;

        const pool = getPool();
        const [result] = await pool.query(
            'INSERT INTO categories (category_name, description, image_path, hover_image_path) VALUES (?, ?, ?, ?)',
            [name, description, imagePath, hoverImagePath]
        );

        res.json({
            success: true,
            id: result.insertId,
            message: 'Category created successfully'
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin: Update category
exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        let query = 'UPDATE categories SET category_name = ?, description = ?';
        const params = [name, description];

        const files = req.files || {};
        if (files['image']) {
            query += ', image_path = ?';
            params.push(`/uploads/products/${files['image'][0].filename}`);
        }
        if (files['hoverImage']) {
            query += ', hover_image_path = ?';
            params.push(`/uploads/products/${files['hoverImage'][0].filename}`);
        }

        query += ' WHERE category_id = ?';
        params.push(req.params.id);

        const pool = getPool();
        await pool.query(query, params);
        res.json({ success: true, message: 'Category updated successfully' });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin: Delete category (Soft delete)
exports.deleteCategory = async (req, res) => {
    try {
        const pool = getPool();
        await pool.query('UPDATE categories SET is_active = 0 WHERE category_id = ?', [req.params.id]);
        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
