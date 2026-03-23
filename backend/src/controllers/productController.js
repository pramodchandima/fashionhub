const { getPool } = require('../config/db');
const { getFullUrl, sanitizeInput } = require('../utils/helpers');

// Get all products (Public)
exports.getAllProducts = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = `
      SELECT p.*, c.category_name as category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.is_active = 1
    `;
        const params = [];

        if (category) {
            query += ' AND p.category_id = ?';
            params.push(category);
        }
        if (search) {
            const safeSearch = sanitizeInput(search, 100);
            query += ' AND (p.product_name LIKE ? OR p.description LIKE ?)';
            params.push(`%${safeSearch}%`, `%${safeSearch}%`);
        }
        query += ' ORDER BY p.date_added DESC';

        const pool = getPool();
        const [products] = await pool.query(query, params);

        for (let product of products) {
            const [colors] = await pool.query(
                'SELECT * FROM product_colors WHERE product_id = ? AND available = 1',
                [product.product_id]
            );
            product.colors = colors;

            // Convert image path to full URL
            if (product.image_path) {
                product.image_path = getFullUrl(req, product.image_path);
            }
        }

        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get single product (Public)
exports.getProductById = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const pool = getPool();

        const [products] = await pool.query(`
      SELECT p.*, c.category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.category_id 
      WHERE p.product_id = ? AND p.is_active = 1
    `, [productId]);

        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = products[0];
        const [colors] = await pool.query(
            'SELECT * FROM product_colors WHERE product_id = ? AND available = 1',
            [productId]
        );
        product.colors = colors;

        // Convert image path to full URL
        if (product.image_path) {
            product.image_path = getFullUrl(req, product.image_path);
        }

        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin: Get all products
exports.getAdminProducts = async (req, res) => {
    try {
        const pool = getPool();
        const [products] = await pool.query(`
            SELECT p.*, c.category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.category_id 
            WHERE p.is_active = 1
        `);

        for (let product of products) {
            const [colors] = await pool.query('SELECT * FROM product_colors WHERE product_id = ?', [product.product_id]);
            product.colors = colors;

            // Convert image path to full URL
            if (product.image_path) {
                product.image_path = getFullUrl(req, product.image_path);
            }
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin: Create Product
exports.createProduct = async (req, res) => {
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Handle multer fields merging
        if (req.files) {
            const textFields = {};
            Object.keys(req.files).forEach(key => {
                if (req.files[key][0] && req.files[key][0].fieldname !== 'image') {
                    const field = req.files[key][0];
                    textFields[field.fieldname] = field.buffer.toString();
                }
            });
            req.body = { ...req.body, ...textFields };
        }

        const name = req.body.name;
        const description = req.body.description || '';
        const price = req.body.price;
        const categoryId = req.body.categoryId;
        const stock = req.body.stock || '0';
        const colors = req.body.colors || '[]';

        if (!name || name.trim().length === 0) {
            throw new Error('Product name is required');
        }

        const sanitizedName = sanitizeInput(name, 200);
        const sanitizedDescription = sanitizeInput(description);
        const priceValue = parseFloat(price) || 0;
        const categoryIdNum = parseInt(categoryId) || 0;
        const stockQuantity = parseInt(stock) || 0;

        let imagePath = null;
        if (req.files && req.files['image'] && req.files['image'][0]) {
            imagePath = `/uploads/products/${req.files['image'][0].filename}`;
        }

        const [result] = await connection.query(
            'INSERT INTO products (product_name, description, base_price, category_id, stock_quantity, image_path) VALUES (?, ?, ?, ?, ?, ?)',
            [sanitizedName, sanitizedDescription, priceValue, categoryIdNum, stockQuantity, imagePath]
        );

        const productId = result.insertId;

        if (colors && colors !== '[]') {
            try {
                const colorList = JSON.parse(colors);
                for (let c of colorList) {
                    if (c && c.name && c.name.trim().length > 0) {
                        await connection.query(
                            'INSERT INTO product_colors (product_id, color_name, color_code) VALUES (?, ?, ?)',
                            [productId, sanitizeInput(c.name, 50), c.code || '#000000']
                        );
                    }
                }
            } catch (parseError) {
                console.warn('Color parse error:', parseError);
            }
        }

        await connection.commit();

        res.json({
            success: true,
            id: productId,
            message: 'Product created successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Create product error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Admin: Update Product
exports.updateProduct = async (req, res) => {
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { name, description, price, categoryId, stock, colors } = req.body;

        if (!name || name.trim().length === 0) {
            throw new Error('Product name is required');
        }

        const sanitizedName = sanitizeInput(name, 200);
        const sanitizedDescription = description ? sanitizeInput(description) : null;
        const productPrice = parseFloat(price) || 0;
        const categoryIdNum = parseInt(categoryId) || 0;
        const stockQuantity = parseInt(stock || 0);

        let query = 'UPDATE products SET product_name=?, description=?, base_price=?, category_id=?, stock_quantity=?';
        const params = [sanitizedName, sanitizedDescription, productPrice, categoryIdNum, stockQuantity];

        if (req.file) {
            query += ', image_path=?';
            params.push(`/uploads/products/${req.file.filename}`);
        }

        query += ' WHERE product_id=?';
        params.push(req.params.id);

        await connection.query(query, params);

        if (colors) {
            await connection.query('DELETE FROM product_colors WHERE product_id=?', [req.params.id]);
            try {
                const colorList = JSON.parse(colors);
                for (let c of colorList) {
                    if (c.name) {
                        await connection.query(
                            'INSERT INTO product_colors (product_id, color_name, color_code) VALUES (?, ?, ?)',
                            [req.params.id, sanitizeInput(c.name, 50), c.code || '#000000']
                        );
                    }
                }
            } catch (e) { }
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Product updated successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Update product error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Admin: Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const pool = getPool();
        await pool.query('UPDATE products SET is_active = 0 WHERE product_id = ?', [req.params.id]);
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
