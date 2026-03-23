-- Database: clothing_store
-- Compatible with MariaDB & TablePlus

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table: admin_users
-- ----------------------------
DROP TABLE IF EXISTS admin_users;

CREATE TABLE admin_users (
    admin_id INT(11) NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (admin_id),
    UNIQUE KEY username (username)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO
    admin_users
VALUES (
        1,
        'admin123',
        '$2b$10$kiTqWFJTU8yIQjToeFPWyOvwJL4Mm6uxx30i2Ym5n5X89F4TPC3Ya',
        'chandimapramod6@gmail.com',
        '2025-12-16 10:36:46'
    );

-- ----------------------------
-- Table: categories
-- ----------------------------
DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
    category_id INT(11) NOT NULL AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    image_path VARCHAR(500) DEFAULT NULL,
    hover_image_path VARCHAR(500) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (category_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO
    categories
VALUES (
        1,
        'Men',
        '',
        '/uploads/products/1765881707211-478014820.jpeg',
        '/uploads/products/1765881707210-54051452.jpeg',
        1,
        '2025-12-16 10:41:47'
    ),
    (
        2,
        'Women',
        'Women''s clothes',
        '/uploads/products/1765887780685-635466577.jpg',
        '/uploads/products/1765887780687-350623184.jpg',
        1,
        '2025-12-16 12:23:00'
    ),
    (
        3,
        'Men',
        '',
        '/uploads/products/1765945015972-703783670.jpeg',
        '/uploads/products/1765945015971-951218279.jpeg',
        0,
        '2025-12-17 04:16:55'
    ),
    (
        4,
        'Men',
        '',
        '/uploads/products/1765945046382-125534702.jpeg',
        '/uploads/products/1765945046383-566236975.jpeg',
        0,
        '2025-12-17 04:17:26'
    );

-- ----------------------------
-- Table: products
-- ----------------------------
DROP TABLE IF EXISTS products;

CREATE TABLE products (
    product_id INT(11) NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(200) NOT NULL,
    description TEXT DEFAULT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    category_id INT(11) DEFAULT NULL,
    stock_quantity INT(11) DEFAULT 0,
    image_path VARCHAR(500) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    date_added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id),
    KEY category_id (category_id),
    CONSTRAINT products_ibfk_1 FOREIGN KEY (category_id) REFERENCES categories (category_id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO
    products
VALUES (
        1,
        'Shirt',
        'Men''s t shirt',
        1400.00,
        1,
        3,
        '/uploads/products/1765881766210-445836070.jpeg',
        1,
        '2025-12-16 10:42:46'
    ),
    (
        2,
        'Frock',
        'Women''s frock',
        3100.00,
        2,
        17,
        '/uploads/products/1765887949549-770822792.jpg',
        1,
        '2025-12-16 12:25:49'
    );

-- ----------------------------
-- Table: product_colors
-- ----------------------------
DROP TABLE IF EXISTS product_colors;

CREATE TABLE product_colors (
    color_id INT(11) NOT NULL AUTO_INCREMENT,
    product_id INT(11) DEFAULT NULL,
    color_name VARCHAR(50) NOT NULL,
    color_code VARCHAR(7) DEFAULT '#000000',
    available TINYINT(1) DEFAULT 1,
    PRIMARY KEY (color_id),
    KEY product_id (product_id),
    CONSTRAINT product_colors_ibfk_1 FOREIGN KEY (product_id) REFERENCES products (product_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO
    product_colors
VALUES (1, 1, 'Black', '#000000', 1),
    (2, 1, 'Red', '#ff0000', 1),
    (3, 2, 'Pink', '#c595c6', 1);

-- ----------------------------
-- Table: orders
-- ----------------------------
DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
    order_id INT(11) NOT NULL AUTO_INCREMENT,
    customer_name VARCHAR(100) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    PRIMARY KEY (order_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO
    orders
VALUES (
        1,
        'WhatsApp Customer',
        1400.00,
        '2025-12-16 10:43:01',
        'pending'
    ),
    (
        2,
        'WhatsApp Customer',
        1400.00,
        '2025-12-16 10:44:55',
        'pending'
    ),
    (
        3,
        'WhatsApp Customer',
        1400.00,
        '2025-12-16 12:21:02',
        'pending'
    ),
    (
        4,
        'WhatsApp Customer',
        3100.00,
        '2025-12-16 12:26:03',
        'pending'
    ),
    (
        5,
        'WhatsApp Customer',
        1400.00,
        '2025-12-16 12:58:37',
        'pending'
    ),
    (
        6,
        'WhatsApp Customer',
        1400.00,
        '2025-12-17 04:55:41',
        'pending'
    );

-- ----------------------------
-- Table: order_items
-- ----------------------------
DROP TABLE IF EXISTS order_items;

CREATE TABLE order_items (
    item_id INT(11) NOT NULL AUTO_INCREMENT,
    order_id INT(11) DEFAULT NULL,
    product_id INT(11) DEFAULT NULL,
    color_name VARCHAR(50) DEFAULT NULL,
    quantity INT(11) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (item_id),
    KEY order_id (order_id),
    KEY product_id (product_id),
    CONSTRAINT order_items_ibfk_1 FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE,
    CONSTRAINT order_items_ibfk_2 FOREIGN KEY (product_id) REFERENCES products (product_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO
    order_items
VALUES (1, 1, 1, 'Black', 1, 1400.00),
    (2, 2, 1, 'Black', 1, 1400.00),
    (3, 3, 1, 'Red', 1, 1400.00),
    (4, 4, 2, 'Pink', 1, 3100.00),
    (5, 5, 1, 'Red', 1, 1400.00),
    (6, 6, 1, 'Red', 1, 1400.00);

-- ----------------------------
-- Table: contact_messages
-- ----------------------------
DROP TABLE IF EXISTS contact_messages;

CREATE TABLE contact_messages (
    message_id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    replied_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (message_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO
    contact_messages
VALUES (
        1,
        'Site',
        'chandimapramod6@gmail.com',
        'scaSv raeg erga',
        'new',
        '2025-12-16 11:36:01',
        NULL
    ),
    (
        2,
        'wefwe',
        'fernandopramod0@gmail.com',
        'efgser g serg',
        'new',
        '2025-12-16 11:40:05',
        NULL
    ),
    (
        3,
        'Site',
        'fernandopramod0@gmail.com',
        'rqfw fagr wg',
        'new',
        '2025-12-16 11:45:10',
        NULL
    ),
    (
        4,
        'yrthbd',
        'pramodfernando49@gmail.com',
        'zgr rsgre g',
        'new',
        '2025-12-16 11:48:10',
        NULL
    ),
    (
        5,
        'ewfes',
        'pramodfernando49@gmail.com',
        'srfergfer',
        'new',
        '2025-12-16 12:01:34',
        NULL
    ),
    (
        6,
        'fcsd',
        'pramodfernando49@gmail.com',
        'zfvrgr',
        'new',
        '2025-12-16 12:04:32',
        NULL
    ),
    (
        7,
        'pramo chand',
        'pramodfernando49@gmail.com',
        'rehtrt h5hy 5w4y',
        'new',
        '2025-12-16 12:09:42',
        NULL
    ),
    (
        8,
        'pramo chand',
        'pramodfernando49@gmail.com',
        'htjgvj',
        'new',
        '2025-12-16 12:14:11',
        NULL
    ),
    (
        9,
        'pramo chand',
        'pramodfernando49@gmail.com',
        'dfsbc b',
        'new',
        '2025-12-16 12:17:35',
        NULL
    ),
    (
        10,
        'pramo chand',
        'pramodfernando49@gmail.com',
        'fdbgnvyjthf',
        'new',
        '2025-12-16 12:19:17',
        NULL
    ),
    (
        11,
        'pramo chand',
        'pramodfernando49@gmail.com',
        'Welcome to FashionHub...',
        'new',
        '2025-12-16 12:20:11',
        NULL
    ),
    (
        12,
        'pramo chand',
        'pramodfernando49@gmail.com',
        'grhtsrt hh',
        'new',
        '2025-12-16 12:57:57',
        NULL
    ),
    (
        13,
        'pramo chand',
        'pramodfernando49@gmail.com',
        'fgnmb',
        'new',
        '2025-12-16 13:22:59',
        NULL
    ),
    (
        14,
        'pramod',
        'pramodfernando49@gmail.com',
        'feghsgdjmh',
        'new',
        '2025-12-17 04:15:25',
        NULL
    ),
    (
        15,
        'pramo chand',
        'pramodfernando49@gmail.com',
        'gergnery ey ae5y ae5y',
        'new',
        '2025-12-17 04:56:03',
        NULL
    );

SET FOREIGN_KEY_CHECKS = 1;