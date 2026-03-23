const mysql = require('mysql2/promise');
const config = require('./env');

const dbConfig = {
    host: config.DB.HOST,
    user: config.DB.USER,
    password: config.DB.PASSWORD,
    database: config.DB.NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

async function initializeDatabase() {
    try {
        pool = mysql.createPool(dbConfig);

        // Test connection
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();

        // Create tables if they don't exist
        await createTables();

        return pool;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

async function createTables() {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Create admin_users table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        admin_id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

        // Create categories table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        category_id INT PRIMARY KEY AUTO_INCREMENT,
        category_name VARCHAR(100) NOT NULL,
        description TEXT,
        image_path VARCHAR(500),
        hover_image_path VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

        // Create products table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        product_id INT PRIMARY KEY AUTO_INCREMENT,
        product_name VARCHAR(200) NOT NULL,
        description TEXT,
        base_price DECIMAL(10,2) NOT NULL,
        category_id INT,
        stock_quantity INT DEFAULT 0,
        image_path VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

        // Create product_colors table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS product_colors (
        color_id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT,
        color_name VARCHAR(50) NOT NULL,
        color_code VARCHAR(7) DEFAULT '#000000',
        available BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

        // Create orders table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id INT PRIMARY KEY AUTO_INCREMENT,
        customer_name VARCHAR(100) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

        // Create order_items table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        item_id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT,
        product_id INT,
        color_name VARCHAR(50),
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

        // Create contact_messages table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        message_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('new', 'read', 'replied') DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        replied_at TIMESTAMP NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

        await connection.commit();
        console.log('✅ All tables created successfully');

    } catch (error) {
        await connection.rollback();
        console.error('❌ Error creating tables:', error.message);
        throw error;
    } finally {
        connection.release();
    }
}

// Export the pool promise wrapper to ensure it's initialized before use
// Note: This pattern assumes initializeDatabase is called at startup
module.exports = {
    initializeDatabase,
    getPool: () => pool
};
