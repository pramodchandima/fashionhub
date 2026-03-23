const os = require('os');
require('dotenv').config();

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

// === ENVIRONMENT VARIABLES ===
const config = {
    PORT: process.env.PORT || 5000,
    LOCAL_IP: LOCAL_IP,
    DB: {
        HOST: process.env.DB_HOST || 'localhost',
        USER: process.env.DB_USER || 'root',
        PASSWORD: process.env.DB_PASSWORD || '', 
        NAME: process.env.DB_NAME || 'clothing_store'
    },
    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    EMAIL: {
        USER: process.env.EMAIL_USER || 'your-email@gmail.com',
        PASS: process.env.EMAIL_PASSWORD || 'your-app-password',
        HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
        PORT: process.env.EMAIL_PORT || 587,
        ADMIN: process.env.ADMIN_EMAIL || 'admin@example.com'
    },
    ADMIN_SETUP: {
        USERNAME: process.env.ADMIN_USERNAME || 'admin',
        PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@123',
        EMAIL: process.env.ADMIN_EMAIL || 'admin@example.com'
    }
};

module.exports = config;
