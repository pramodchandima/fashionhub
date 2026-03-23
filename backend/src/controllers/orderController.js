const { getPool } = require('../config/db');

exports.placeOrder = async (req, res) => {
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { customerName, customerEmail, customerPhone, shippingAddress, totalAmount, items } = req.body;

        if (!items || items.length === 0) {
            throw new Error('No items in order');
        }

        const [orderResult] = await connection.query(
            'INSERT INTO orders (customer_name, customer_email, customer_phone, shipping_address, total_amount) VALUES (?, ?, ?, ?, ?)',
            [
                customerName || 'Guest',
                customerEmail || null,
                customerPhone || null,
                shippingAddress || null,
                totalAmount
            ]
        );
        const orderId = orderResult.insertId;

        for (let item of items) {
            const [product] = await connection.query(
                'SELECT stock_quantity FROM products WHERE product_id = ?',
                [item.productId]
            );

            if (product.length === 0) {
                throw new Error(`Product ID ${item.productId} not found`);
            }

            if (product[0].stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for product ID ${item.productId}`);
            }

            await connection.query(
                'INSERT INTO order_items (order_id, product_id, color_name, quantity, unit_price) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.productId, item.color || 'Default', item.quantity, item.price]
            );

            await connection.query(
                'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
                [item.quantity, item.productId]
            );
        }

        await connection.commit();
        res.json({
            success: true,
            orderId,
            message: 'Order placed successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Order error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    } finally {
        connection.release();
    }
};

exports.getOrders = async (req, res) => {
    try {
        const pool = getPool();
        const [orders] = await pool.query('SELECT * FROM orders ORDER BY order_date DESC');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const pool = getPool();
        const orderId = req.params.id;

        const [items] = await pool.query(`
            SELECT oi.*, p.product_name, p.image_path 
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
        `, [orderId]);

        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const pool = getPool();
        const { status } = req.body;
        const orderId = req.params.id;

        await pool.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, orderId]);
        res.json({ success: true, message: 'Order status updated' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
