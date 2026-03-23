const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');
const { getFullUrl } = require('./utils/helpers');

const app = express();

// === MIDDLEWARE ===
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// === CORS CONFIGURATION ===
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5000',
        `http://${config.LOCAL_IP}:3000`,
        `http://${config.LOCAL_IP}:5000`
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());

// === STATIC FILES ===
// Serve uploads from backend root/uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, path) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=86400');
    }
}));

// === API ROUTES ===
app.use('/api', authRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api', contactRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    const emailConfigured = config.EMAIL.USER && config.EMAIL.PASS && config.EMAIL.USER !== 'your-email@gmail.com';
    const { getPool } = require('./config/db');
    const pool = getPool();

    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: pool ? 'connected' : 'disconnected',
        email: {
            configured: emailConfigured,
            host: config.EMAIL.HOST,
            user: config.EMAIL.USER,
            admin: config.EMAIL.ADMIN
        },
        network: {
            localIP: config.LOCAL_IP,
            accessUrl: `http://${config.LOCAL_IP}:${config.PORT}`
        }
    });
});

// Network Info
app.get('/api/network-info', (req, res) => {
    res.json({
        success: true,
        localIP: config.LOCAL_IP,
        port: config.PORT,
        accessUrls: {
            backend: `http://${config.LOCAL_IP}:${config.PORT}`,
            apiBase: `http://${config.LOCAL_IP}:${config.PORT}/api`,
            images: `http://${config.LOCAL_IP}:${config.PORT}/uploads`,
            frontend: `http://${config.LOCAL_IP}:3000`
        },
        instructions: `Access from other devices: http://${config.LOCAL_IP}:3000`
    });
});

// Test Image
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

// === SERVE REACT FRONTEND ===
// Serve static files from React app
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// For any non-API request, send back React's index.html
app.get('*', (req, res) => {
    // Don't interfere with API routes
    if (req.url.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            error: `API route ${req.url} not found`
        });
    }
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.url} not found`
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

module.exports = app;
