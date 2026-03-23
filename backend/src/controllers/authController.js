const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');
const config = require('../config/env');
const { sanitizeInput } = require('../utils/helpers');

exports.adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        const pool = getPool();
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
            config.JWT_SECRET,
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
};

exports.changePassword = async (req, res) => {
    try {
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

        const pool = getPool();
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
};

exports.setupAdmin = async (req, res) => {
    try {
        const username = config.ADMIN_SETUP.USERNAME;
        const password = config.ADMIN_SETUP.PASSWORD;
        const email = config.ADMIN_SETUP.EMAIL;

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const pool = getPool();
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
};
