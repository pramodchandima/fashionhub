const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken'); 
const nodemailer = require('nodemailer'); 
const os = require('os');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;  // Railway uses 8080

// === GET LOCAL IP ===
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const config of iface) {
            if (config.family === 'IPv4' && !config.internal && config.address.startsWith('192.168')) {
                return config.address;
            }
        }
    }
    return 'localhost';
}

const LOCAL_IP = getLocalIP();

// === ENVIRONMENT VALIDATION ===
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// === EMAIL CONFIGURATION ===
const EMAIL_USER = process.env.EMAIL_USER || 'your-email@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASSWORD || 'your-app-password';
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

console.log('🔧 Environment Check:');
console.log('   PORT:', PORT);
console.log('   Database:', process.env.DATABASE_URL ? '✅ Connected via DATABASE_URL' : '❌ Not connected');
console.log('   LOCAL IP:', LOCAL_IP);
console.log('   EMAIL_HOST:', EMAIL_HOST);
console.log('   EMAIL_USER:', EMAIL_USER ? '✓ Set' : '✗ Not set');

// Add this RIGHT AFTER the EMAIL configuration
console.log('📧 CURRENT EMAIL CONFIG:');
console.log('   EMAIL_USER:', EMAIL_USER);
console.log('   EMAIL_PASS length:', EMAIL_PASS ? EMAIL_PASS.length : 'NOT SET');
console.log('   EMAIL_PASS first 4 chars:', EMAIL_PASS ? EMAIL_PASS.substring(0, 4) + '...' : 'NOT SET');
console.log('   ADMIN_EMAIL:', ADMIN_EMAIL);
console.log('   Using real email?', EMAIL_USER !== 'your-email@gmail.com' ? 'YES' : 'NO');

// === MIDDLEWARE ===
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.method === 'POST' && req.url === '/api/admin/products') {
        console.log('📥 Content-Type:', req.headers['content-type']);
    }
    next();
});

// === CORS CONFIGURATION ===
app.use(cors({
  origin: true,  // ✅ ALLOWS ALL ORIGINS (HTTP, HTTPS, everything)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());

// === STATIC FILES ===
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, path) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=86400');
    }
}));

// === DATABASE CONFIGURATION ===
const connectionString = process.env.DATABASE_URL;

const dbConfig = connectionString ? {
  uri: connectionString,
  ssl: { rejectUnauthorized: false }
} : {
  host: process.env.MYSQLHOST || 'mysql.railway.internal',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQL_ROOT_PASSWORD || 'kFjJtGwBhRZtRlEefadNRyUnjtFPSAxR',
  database: process.env.MYSQLDATABASE || 'railway',
  port: process.env.MYSQLPORT || 3306,
  // ✅ CORRECT SSL CONFIG FOR MYSQL2:
  ssl: {
    rejectUnauthorized: false // Temporarily allow the connection
  }
};

let pool;

async function initializeDatabase() {
  try {
    console.log('🔍 DEBUG: ALL environment variables:');
      for (const key in process.env) {
        console.log(`  ${key}: ${process.env[key]}`);
      }
    console.log('🔍 DEBUG: connectionString:', process.env.DATABASE_URL || 'Not set');
    console.log('🔍 DEBUG: MYSQLHOST:', process.env.MYSQLHOST || 'Not set');
    console.log('🔍 DEBUG: MYSQLUSER:', process.env.MYSQLUSER || 'Not set');
    console.log('🔍 DEBUG: MYSQLDATABASE:', process.env.MYSQLDATABASE || 'Not set');
    console.log('🔍 DEBUG: MYSQLPORT:', process.env.MYSQLPORT || 'Not set');
    console.log('🔍 DEBUG: Full dbConfig:', JSON.stringify(dbConfig, null, 2));

    pool = mysql.createPool(dbConfig);
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    
    // Create tables if they don't exist
    await createTables();
    return true; // Success
    
  } catch (error) {
    console.error('⚠️ Database connection failed:', error.message);
    console.log('⚠️ Starting server WITHOUT database (frontend will still work)...');
    pool = null;  // Don't crash, just set pool to null
    return false; // Failure
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

// === SECURITY MIDDLEWARE ===
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Access denied. No token provided.' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false,
        error: 'Invalid or expired token.' 
      });
    }
    req.user = user;
    next();
  });
};

// === FILE UPLOAD CONFIGURATION ===
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = 'uploads/products';
    try {
      await fs.mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// Create multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// === HELPER FUNCTIONS ===
const sanitizeInput = (input, maxLength = 255) => {
  if (typeof input !== 'string') return input;
  return input
    .substring(0, maxLength)
    .replace(/[<>]/g, '')
    .trim();
};

// Function to convert relative paths to full URLs
const getFullUrl = (req, path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Check if it's already a full URL
    if (path.startsWith('/uploads')) {
        // Determine the base URL based on request
        const protocol = req.protocol;
        const host = req.get('host');
        return `${protocol}://${host}${path}`;
    }
    
    return path;
};

// === CONTACT FORM ROUTE ===
app.post('/api/contact', async (req, res) => {
    try {
        console.log('📧 Contact form submission received');
        
        const { name, email, subject, message } = req.body;
        
        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({ 
                success: false,
                error: 'All fields are required: name, email, message' 
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                error: 'Please provide a valid email address' 
            });
        }
        
        // Sanitize inputs
        const sanitizedName = sanitizeInput(name, 100);
        const sanitizedEmail = sanitizeInput(email, 100);
        const sanitizedSubject = subject ? sanitizeInput(subject, 200) : 'Contact Form Submission';
        const sanitizedMessage = sanitizeInput(message, 5000);
        
        // Check if database is available
        if (!pool) {
          return res.status(503).json({ 
            success: false,
            error: 'Contact form is temporarily unavailable. Please try again later.' 
          });
        }
        
        // Save to database
        const [dbResult] = await pool.query(
            'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
            [sanitizedName, sanitizedEmail, sanitizedMessage]
        );
        
        const messageId = dbResult.insertId;
        console.log(`✅ Message #${messageId} saved to database`);
        
        // Show message in console (for admin to see)
        console.log('========================================');
        console.log('📝 NEW CONTACT MESSAGE');
        console.log('========================================');
        console.log(`ID: ${messageId}`);
        console.log(`Name: ${sanitizedName}`);
        console.log(`Email: ${sanitizedEmail}`);
        console.log(`Subject: ${sanitizedSubject}`);
        console.log(`Message: ${sanitizedMessage}`);
        console.log(`Time: ${new Date().toLocaleString()}`);
        console.log('========================================\n');
        
        // Try to send emails
        let emailSent = false;
        if (EMAIL_USER && EMAIL_PASS && EMAIL_USER !== 'your-email@gmail.com') {
            emailSent = await sendContactEmails({
                name: sanitizedName,
                email: sanitizedEmail,
                subject: sanitizedSubject,
                message: sanitizedMessage,
                messageId: messageId
            });
        }
        
        let responseMessage = 'Message received successfully! We will contact you soon.';
        if (emailSent) {
            responseMessage += ' (Email confirmation sent)';
        } else {
            responseMessage += ' (Saved to database)';
        }
        
        res.json({ 
            success: true,
            message: responseMessage,
            messageId: messageId,
            emailSent: emailSent
        });
        
    } catch (error) {
        console.error('❌ Error processing contact form:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to process your message. Please try again later.'
        });
    }
});

// Email sending function
async function sendContactEmails({ name, email, subject, message, messageId }) {
    // 🔍 ADDED: Email configuration debug
    console.log('📧 Email Configuration Debug:');
    console.log('   EMAIL_USER:', EMAIL_USER);
    console.log('   EMAIL_PASS exists?:', EMAIL_PASS ? 'YES' : 'NO');
    console.log('   ADMIN_EMAIL:', ADMIN_EMAIL);
    console.log('   EMAIL_HOST:', EMAIL_HOST);
    console.log('   EMAIL_PORT:', EMAIL_PORT);
    
    let emailSuccess = false;
    
    try {
        console.log('📤 Attempting to send emails...');
        
        // Create transporter
        const transporter = nodemailer.createTransport({
            host: EMAIL_HOST,
            port: EMAIL_PORT,
            secure: EMAIL_PORT === 465,
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        // Verify connection
        console.log('🔍 Verifying email server connection...');
        await transporter.verify();
        console.log('✅ Email server connection verified');
        
        // Determine recipient
        const adminRecipient = ADMIN_EMAIL || EMAIL_USER;
        console.log(`📧 Sending admin email to: ${adminRecipient}`);
        
        // Email 1: To Admin
        const adminMailOptions = {
            from: `"FashionHub Contact" <${EMAIL_USER}>`,
            to: adminRecipient,
            replyTo: email,
            subject: `New Contact: ${subject} (Message #${messageId})`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">New Contact Form Submission</h2>
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
                        <p><strong>Message ID:</strong> #${messageId}</p>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        <p><strong>Subject:</strong> ${subject}</p>
                        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                        <hr>
                        <p><strong>Message:</strong></p>
                        <p style="white-space: pre-wrap; background-color: white; padding: 15px; border-radius: 3px;">${message}</p>
                    </div>
                </div>
            `,
            text: `
New Contact Form Message
=======================
Message ID: #${messageId}
Name: ${name}
Email: ${email}
Subject: ${subject}
Time: ${new Date().toLocaleString()}

Message:
${message}
            `
        };
        
        // Email 2: Auto-reply to User
        const userMailOptions = {
            from: `"FashionHub" <${EMAIL_USER}>`,
            to: email,
            subject: 'Thank you for contacting FashionHub',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4CAF50;">Thank You for Contacting Us!</h2>
                    <p>Dear ${name},</p>
                    <p>We have received your message and will get back to you as soon as possible.</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Your Message (Preview):</strong></p>
                        <p style="font-style: italic;">"${message.substring(0, 150)}${message.length > 150 ? '...' : ''}"</p>
                    </div>
                    <p>We typically respond within 24 hours.</p>
                    <p>Best regards,<br>The FashionHub Team</p>
                </div>
            `,
            text: `
Thank You for Contacting FashionHub!

Dear ${name},

We have received your message and will get back to you as soon as possible.

Your Message (Preview):
"${message.substring(0, 200)}${message.length > 200 ? '...' : ''}"

We typically respond within 24 hours.

Best regards,
The FashionHub Team
            `
        };
        
        // Send emails
        console.log('📨 Sending email to admin...');
        const adminInfo = await transporter.sendMail(adminMailOptions);
        console.log(`✅ Admin email sent: ${adminInfo.messageId}`);
        
        console.log('📨 Sending auto-reply to user...');
        const userInfo = await transporter.sendMail(userMailOptions);
        console.log(`✅ User auto-reply sent: ${userInfo.messageId}`);
        
        emailSuccess = true;
        console.log('🎉 Both emails sent successfully!');
        
    } catch (emailError) {
        console.error('⚠️ Email sending failed:', emailError.message);
        emailSuccess = false;
    }
    
    return emailSuccess;
}

// ============= PUBLIC API ROUTES =============

app.get('/api/health', (req, res) => {
    const emailConfigured = EMAIL_USER && EMAIL_PASS && EMAIL_USER !== 'your-email@gmail.com';
    
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        database: pool ? 'connected' : 'disconnected',
        email: {
            configured: emailConfigured,
            host: EMAIL_HOST,
            user: EMAIL_USER,
            admin: ADMIN_EMAIL
        },
        network: {
            localIP: LOCAL_IP,
            accessUrl: `http://${LOCAL_IP}:${PORT}`
        }
    });
});

// 🆕 ADDED: Test Email Route
app.get('/api/test-email', async (req, res) => {
  try {
    console.log('📧 Testing email configuration...');
    console.log('EMAIL_USER:', EMAIL_USER);
    console.log('EMAIL_PASS exists?:', EMAIL_PASS ? 'YES' : 'NO');
    
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      },
      tls: { rejectUnauthorized: false }
    });
    
    await transporter.verify();
    
    const info = await transporter.sendMail({
      from: `"FashionHub Test" <${EMAIL_USER}>`,
      to: ADMIN_EMAIL || EMAIL_USER,
      subject: 'Test Email from FashionHub',
      text: 'If you get this, emails are working!'
    });
    
    res.json({ 
      success: true, 
      message: 'Test email sent! Check your inbox.',
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Network access test
app.get('/api/network-info', (req, res) => {
    res.json({
        success: true,
        localIP: LOCAL_IP,
        port: PORT,
        accessUrls: {
            backend: `http://${LOCAL_IP}:${PORT}`,
            apiBase: `http://${LOCAL_IP}:${PORT}/api`,
            images: `http://${LOCAL_IP}:${PORT}/uploads`,
            frontend: `http://${LOCAL_IP}:3000`
        },
        instructions: `Access from other devices: http://${LOCAL_IP}:3000`
    });
});

// Test image access
app.get('/api/test-image', (req, res) => {
    res.json({
        success: true,
        imageTest: {
            staticFile: `http://${req.get('host')}/uploads/products/test.jpg`,
            apiEndpoint: `http://${req.get('host')}/api/products`,
            fullUrlExample: getFullUrl(req, '/uploads/products/filename.jpg')
        }
    });
});

// --- SETUP ADMIN ROUTE ---
app.get('/api/setup-admin', async (req, res) => {
    try {
        // Check if database is available
        if (!pool) {
            return res.status(503).json({ 
                success: false,
                error: 'Database is not available. Cannot setup admin.' 
            });
        }
        
        const username = process.env.ADMIN_USERNAME || 'admin';
        const password = process.env.ADMIN_PASSWORD || 'Admin@123';
        const email = process.env.ADMIN_EMAIL || 'admin@example.com';

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        
        await pool.query(
            `INSERT INTO admin_users (username, password_hash, email) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
             password_hash = VALUES(password_hash), 
             email = VALUES(email)`,
            [username, hash, email]
        );
        
        res.json({ 
            success: true,
            message: 'Admin user setup completed successfully', 
            details: { username, email }
        });
    } catch (error) {
        console.error('Setup admin error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    // Check if database is available
    if (!pool) {
      return res.json([]); // Return empty array if no database
    }
    
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE is_active = 1 ORDER BY category_name'
    );
    
    // Convert image paths to full URLs
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
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    // Check if database is available
    if (!pool) {
      return res.json([]); // Return empty array if no database
    }
    
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
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    // Check if database is available
    if (!pool) {
      return res.status(503).json({ 
        error: 'Product information is temporarily unavailable.' 
      });
    }
    
    const productId = parseInt(req.params.id);
    
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
});

// Place Order
app.post('/api/orders', async (req, res) => {
    // Check if database is available
    if (!pool) {
      return res.status(503).json({ 
        success: false,
        error: 'Order system is temporarily unavailable. Please try again later.' 
      });
    }
    
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { customerName, totalAmount, items } = req.body; 

        if (!items || items.length === 0) {
            throw new Error('No items in order');
        }

        const [orderResult] = await connection.query(
            'INSERT INTO orders (customer_name, total_amount) VALUES (?, ?)',
            [customerName || 'WhatsApp Customer', totalAmount]
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
});

// ============= SECURE ADMIN ROUTES =============

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    // Check if database is available
    if (!pool) {
      return res.status(503).json({ 
        success: false,
        error: 'Admin system is temporarily unavailable.' 
      });
    }
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Username and password are required' 
      });
    }
    
    const [admins] = await pool.query(
      'SELECT * FROM admin_users WHERE username = ?', 
      [sanitizeInput(username, 50)]
    );
    
    if (admins.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid username or password' 
      });
    }
    
    const admin = admins[0];
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid username or password' 
      });
    }
    
    const token = jwt.sign(
      { 
        id: admin.admin_id, 
        username: admin.username 
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );
    
    res.json({ 
      success: true, 
      token, 
      admin: { 
        id: admin.admin_id,
        username: admin.username,
        email: admin.email
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error during login' 
    });
  }
});

// Change Password
app.post('/api/admin/change-password', authenticateToken, async (req, res) => {
    try {
        // Check if database is available
        if (!pool) {
          return res.status(503).json({ 
            success: false,
            error: 'Database is temporarily unavailable.' 
          });
        }
        
        const { currentPassword, newPassword } = req.body;
        const adminId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false,
                error: 'Both passwords are required' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false,
                error: 'Password must be at least 6 characters' 
            });
        }

        const [admins] = await pool.query('SELECT * FROM admin_users WHERE admin_id = ?', [adminId]);
        const admin = admins[0];
        
        const validPassword = await bcrypt.compare(currentPassword, admin.password_hash);
        if (!validPassword) {
            return res.status(400).json({ 
                success: false,
                error: 'Incorrect current password' 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE admin_users SET password_hash = ? WHERE admin_id = ?', [hash, adminId]);

        res.json({ 
            success: true, 
            message: 'Password changed successfully' 
        });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ 
            success: false,
            error: 'Server error while changing password' 
        });
    }
});

// --- ADMIN CATEGORIES ROUTES ---
app.get('/api/admin/categories', authenticateToken, async (req, res) => {
    try {
        // Check if database is available
        if (!pool) {
          return res.json([]);
        }
        
        const [rows] = await pool.query('SELECT * FROM categories WHERE is_active = 1');
        
        // Convert image paths to full URLs for admin panel too
        const categoriesWithFullUrls = rows.map(category => ({
            ...category,
            image_path: getFullUrl(req, category.image_path),
            hover_image_path: getFullUrl(req, category.hover_image_path)
        }));
        
        res.json(categoriesWithFullUrls);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/admin/categories', authenticateToken, upload.fields([
    { name: 'image', maxCount: 1 }, 
    { name: 'hoverImage', maxCount: 1 }
]), async (req, res) => {
    try {
        // Check if database is available
        if (!pool) {
          return res.status(503).json({ 
            error: 'Database is temporarily unavailable.' 
          });
        }
        
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }
        
        const files = req.files || {};
        const imagePath = files['image'] ? `/uploads/products/${files['image'][0].filename}` : null;
        const hoverImagePath = files['hoverImage'] ? `/uploads/products/${files['hoverImage'][0].filename}` : null;
        
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
});

app.put('/api/admin/categories/:id', authenticateToken, upload.fields([
    { name: 'image', maxCount: 1 }, 
    { name: 'hoverImage', maxCount: 1 }
]), async (req, res) => {
    try {
        // Check if database is available
        if (!pool) {
          return res.status(503).json({ 
            error: 'Database is temporarily unavailable.' 
          });
        }
        
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
        
        await pool.query(query, params);
        res.json({ success: true, message: 'Category updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/admin/categories/:id', authenticateToken, async (req, res) => {
    try {
        // Check if database is available
        if (!pool) {
          return res.status(503).json({ 
            error: 'Database is temporarily unavailable.' 
          });
        }
        
        await pool.query('UPDATE categories SET is_active = 0 WHERE category_id = ?', [req.params.id]);
        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- ADMIN PRODUCTS ROUTES ---
app.get('/api/admin/products', authenticateToken, async (req, res) => {
    try {
        // Check if database is available
        if (!pool) {
          return res.json([]);
        }
        
        const [products] = await pool.query(`
            SELECT p.*, c.category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.category_id 
            WHERE p.is_active = 1
        `);
        
        for (let product of products) {
            const [colors] = await pool.query('SELECT * FROM product_colors WHERE product_id = ?', [product.product_id]);
            product.colors = colors;
            
            // Convert image path to full URL for admin panel
            if (product.image_path) {
                product.image_path = getFullUrl(req, product.image_path);
            }
        }
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// === FIXED: PRODUCT CREATION ===
app.post('/api/admin/products', authenticateToken, (req, res, next) => {
    // Check if database is available
    if (!pool) {
      return res.status(503).json({ 
        success: false,
        error: 'Database is temporarily unavailable.' 
      });
    }
    
    // Create a multer instance that handles both fields and file
    const multerUpload = multer({
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 }
    }).fields([
        { name: 'image', maxCount: 1 },
        { name: 'name', maxCount: 1 },
        { name: 'description', maxCount: 1 },
        { name: 'price', maxCount: 1 },
        { name: 'categoryId', maxCount: 1 },
        { name: 'stock', maxCount: 1 },
        { name: 'colors', maxCount: 1 }
    ]);
    
    multerUpload(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ 
                success: false,
                error: err.message 
            });
        }
        
        // Parse text fields from multer
        if (req.files) {
            // Multer puts text fields in req.files when using .fields()
            const textFields = {};
            Object.keys(req.files).forEach(key => {
                if (req.files[key][0] && req.files[key][0].fieldname !== 'image') {
                    // This is a text field, get its value from buffer
                    const field = req.files[key][0];
                    textFields[field.fieldname] = field.buffer.toString();
                }
            });
            
            // Merge text fields into req.body
            req.body = { ...req.body, ...textFields };
        }
        
        console.log('✅ Parsed body:', req.body);
        console.log('✅ Files:', req.files);
        next();
    });
}, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        console.log('=== CREATE PRODUCT ===');
        console.log('Body:', req.body);
        console.log('Files:', req.files);
        
        // Get fields
        const name = req.body.name;
        const description = req.body.description || '';
        const price = req.body.price;
        const categoryId = req.body.categoryId;
        const stock = req.body.stock || '0';
        const colors = req.body.colors || '[]';
        
        console.log('Parsed values:', { name, price, categoryId });
        
        if (!name || name.trim().length === 0) {
            throw new Error('Product name is required');
        }
        
        const sanitizedName = sanitizeInput(name, 200);
        const sanitizedDescription = sanitizeInput(description);
        const priceValue = parseFloat(price) || 0;
        const categoryIdNum = parseInt(categoryId) || 0;
        const stockQuantity = parseInt(stock) || 0;
        
        // Get image file
        let imagePath = null;
        if (req.files && req.files['image'] && req.files['image'][0]) {
            imagePath = `/uploads/products/${req.files['image'][0].filename}`;
        }
        
        console.log('Inserting product:', { 
            name: sanitizedName, 
            price: priceValue, 
            categoryId: categoryIdNum,
            image: imagePath 
        });
        
        const [result] = await connection.query(
            'INSERT INTO products (product_name, description, base_price, category_id, stock_quantity, image_path) VALUES (?, ?, ?, ?, ?, ?)',
            [sanitizedName, sanitizedDescription, priceValue, categoryIdNum, stockQuantity, imagePath]
        );
        
        const productId = result.insertId;
        
        // Add colors
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
});

app.put('/api/admin/products/:id', authenticateToken, upload.single('image'), async (req, res) => {
    // Check if database is available
    if (!pool) {
      return res.status(503).json({ 
        success: false,
        error: 'Database is temporarily unavailable.' 
      });
    }
    
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

        await pool.query(query, params);

        // Update colors
        if (colors) {
            await pool.query('DELETE FROM product_colors WHERE product_id=?', [req.params.id]);
            try {
                const colorList = JSON.parse(colors);
                for (let c of colorList) {
                    if (c.name) {
                        await pool.query(
                            'INSERT INTO product_colors (product_id, color_name, color_code) VALUES (?, ?, ?)',
                            [req.params.id, sanitizeInput(c.name, 50), c.code || '#000000']
                        );
                    }
                }
            } catch (e) {}
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
});

app.delete('/api/admin/products/:id', authenticateToken, async (req, res) => {
    try {
        // Check if database is available
        if (!pool) {
          return res.status(503).json({ 
            error: 'Database is temporarily unavailable.' 
          });
        }
        
        await pool.query('UPDATE products SET is_active = 0 WHERE product_id = ?', [req.params.id]);
        res.json({ 
            success: true, 
            message: 'Product deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- ADMIN CONTACT MESSAGES ROUTES ---
app.get('/api/admin/contact-messages', authenticateToken, async (req, res) => {
    try {
        // Check if database is available
        if (!pool) {
          return res.json([]);
        }
        
        const [messages] = await pool.query(`
            SELECT * FROM contact_messages 
            ORDER BY created_at DESC
        `);
        res.json(messages);
    } catch (error) {
        console.error('Get contact messages error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/admin/contact-messages/:id/status', authenticateToken, async (req, res) => {
    try {
        // Check if database is available
        if (!pool) {
          return res.status(503).json({ 
            error: 'Database is temporarily unavailable.' 
          });
        }
        
        const { status } = req.body;
        const messageId = req.params.id;
        
        if (!['new', 'read', 'replied'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const updateData = { status };
        if (status === 'replied') {
            updateData.replied_at = new Date();
        }
        
        await pool.query(
            'UPDATE contact_messages SET status = ?, replied_at = ? WHERE message_id = ?',
            [status, updateData.replied_at, messageId]
        );
        
        res.json({ 
            success: true, 
            message: 'Message status updated successfully' 
        });
    } catch (error) {
        console.error('Update message status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============= SERVE REACT FRONTEND =============
// Serve static files from frontend-build folder
app.use(express.static(path.join(__dirname, 'frontend-build')));

// For React Router - handle all non-API requests
app.get('*', (req, res, next) => {
  // Don't interfere with API routes or static files
  if (req.url.startsWith('/api/') || req.url.startsWith('/uploads/')) {
    return next(); // Pass to 404 handler if API route doesn't exist
  }
  
  // Serve the React app
  res.sendFile(path.join(__dirname, 'frontend-build', 'index.html'), (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Server error loading frontend');
    }
  });
});

// 404 Handler for API routes
app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ 
        success: false,
        error: `API route ${req.url} not found` 
    });
  }
  next();
});

// General 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'frontend-build', 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Page not found');
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        success: false,
        error: 'Internal server error'
    });
});

// ============= START SERVER =============
async function startServer() {
    try {
      const dbSuccess = await initializeDatabase();
      
      if (dbSuccess) {
        console.log('✅ Database initialized successfully');
      } else {
        console.log('⚠️ Server starting WITHOUT database');
      }
      
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

// Start the server
startServer();